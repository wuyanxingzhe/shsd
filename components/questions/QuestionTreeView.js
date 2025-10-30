'use client';

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  IconButton,
  Collapse,
  Chip,
  Tooltip,
  Divider,
  CircularProgress
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteIcon from '@mui/icons-material/Delete';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import EditIcon from '@mui/icons-material/Edit';
import FolderIcon from '@mui/icons-material/Folder';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import { useGenerateDataset } from '@/hooks/useGenerateDataset';
import axios from 'axios';

/**
 * 问题树视图组件
 * @param {Object} props
 * @param {Array} props.tags - 标签树
 * @param {Array} props.selectedQuestions - 已选择的问题ID列表
 * @param {Function} props.onSelectQuestion - 选择问题的回调函数
 * @param {Function} props.onDeleteQuestion - 删除问题的回调函数
 */
export default function QuestionTreeView({
  tags = [],
  selectedQuestions = [],
  onSelectQuestion,
  onDeleteQuestion,
  onEditQuestion,
  projectId,
  searchTerm
}) {
  const { t } = useTranslation();
  const [expandedTags, setExpandedTags] = useState({});
  const [questionsByTag, setQuestionsByTag] = useState({});
  const [processingQuestions, setProcessingQuestions] = useState({});
  const { generateSingleDataset } = useGenerateDataset();
  const [questions, setQuestions] = useState([]);
  const [loadedTags, setLoadedTags] = useState({});
  // 初始化时，将所有标签设置为收起状态（而不是展开状态）
  useEffect(() => {
    async function fetchTagsInfo() {
      try {
        // 获取标签信息，仅用于标签统计
        const response = await axios.get(`/api/projects/${projectId}/questions/tree?tagsOnly=true&input=${searchTerm}`);
        setQuestions(response.data); // 设置数据仅用于标签统计

        // 当搜索条件变化时，重新加载已展开标签的问题数据
        const expandedTagLabels = Object.entries(expandedTags)
          .filter(([_, isExpanded]) => isExpanded)
          .map(([label]) => label);

        // 重新加载已展开标签的数据
        for (const label of expandedTagLabels) {
          fetchTagQuestions(label);
        }
      } catch (error) {
        console.error('获取标签信息失败:', error);
      }
    }

    if (projectId) {
      fetchTagsInfo();
    }

    const initialExpandedState = {};
    const processTag = tag => {
      // 将默认状态改为 false（收起）而不是 true（展开）
      initialExpandedState[tag.label] = false;
      if (tag.child && tag.child.length > 0) {
        tag.child.forEach(processTag);
      }
    };

    tags.forEach(processTag);
    // 未分类问题也默认收起
    initialExpandedState['uncategorized'] = false;
    setExpandedTags(initialExpandedState);
  }, [tags]);

  // 根据标签对问题进行分类
  useEffect(() => {
    const taggedQuestions = {};

    // 初始化标签映射
    const initTagMap = tag => {
      taggedQuestions[tag.label] = [];
      if (tag.child && tag.child.length > 0) {
        tag.child.forEach(initTagMap);
      }
    };

    tags.forEach(initTagMap);

    // 将问题分配到对应的标签下
    questions.forEach(question => {
      // 如果问题没有标签，添加到"未分类"
      if (!question.label) {
        if (!taggedQuestions['uncategorized']) {
          taggedQuestions['uncategorized'] = [];
        }
        taggedQuestions['uncategorized'].push(question);
        return;
      }

      // 将问题添加到匹配的标签下
      const questionLabel = question.label;

      // 查找最精确匹配的标签
      // 使用一个数组来存储所有匹配的标签路径，以便找到最精确的匹配
      const findAllMatchingTags = (tag, path = []) => {
        const currentPath = [...path, tag.label];

        // 存储所有匹配结果
        const matches = [];

        // 精确匹配当前标签
        if (tag.label === questionLabel) {
          matches.push({ label: tag.label, depth: currentPath.length });
        }

        // 检查子标签
        if (tag.child && tag.child.length > 0) {
          for (const childTag of tag.child) {
            const childMatches = findAllMatchingTags(childTag, currentPath);
            matches.push(...childMatches);
          }
        }

        return matches;
      };

      // 在所有根标签中查找所有匹配
      let allMatches = [];
      for (const rootTag of tags) {
        const matches = findAllMatchingTags(rootTag);
        allMatches.push(...matches);
      }

      // 找到深度最大的匹配（最精确的匹配）
      let matchedTagLabel = null;
      if (allMatches.length > 0) {
        // 按深度排序，深度最大的是最精确的匹配
        allMatches.sort((a, b) => b.depth - a.depth);
        matchedTagLabel = allMatches[0].label;
      }

      if (matchedTagLabel) {
        // 如果找到匹配的标签，将问题添加到该标签下
        if (!taggedQuestions[matchedTagLabel]) {
          taggedQuestions[matchedTagLabel] = [];
        }
        taggedQuestions[matchedTagLabel].push(question);
      } else {
        // 如果找不到匹配的标签，添加到"未分类"
        if (!taggedQuestions['uncategorized']) {
          taggedQuestions['uncategorized'] = [];
        }
        taggedQuestions['uncategorized'].push(question);
      }
    });

    setQuestionsByTag(taggedQuestions);
  }, [questions, tags]);

  // 处理展开/折叠标签 - 使用 useCallback 优化
  const handleToggleExpand = useCallback(
    tagLabel => {
      // 检查是否需要加载此标签的问题数据
      const shouldExpand = !expandedTags[tagLabel];

      if (shouldExpand && !loadedTags[tagLabel]) {
        // 如果要展开且尚未加载数据，则加载数据
        fetchTagQuestions(tagLabel);
      }

      setExpandedTags(prev => ({
        ...prev,
        [tagLabel]: shouldExpand
      }));
    },
    [expandedTags, loadedTags, projectId]
  );

  // 获取特定标签的问题数据
  const fetchTagQuestions = useCallback(
    async tagLabel => {
      try {
        const response = await axios.get(
          `/api/projects/${projectId}/questions/tree?tag=${encodeURIComponent(tagLabel)}${searchTerm ? `&input=${searchTerm}` : ''}`
        );

        // 更新问题数据，合并新获取的数据
        setQuestions(prev => {
          // 创建一个新数组，包含现有数据
          const updatedQuestions = [...prev];

          // 添加新获取的问题数据
          response.data.forEach(newQuestion => {
            // 检查是否已存在相同 ID 的问题
            const existingIndex = updatedQuestions.findIndex(q => q.id === newQuestion.id);
            if (existingIndex === -1) {
              // 如果不存在，添加到数组
              updatedQuestions.push(newQuestion);
            } else {
              // 如果已存在，更新数据
              updatedQuestions[existingIndex] = newQuestion;
            }
          });

          return updatedQuestions;
        });

        // 标记该标签已加载数据
        setLoadedTags(prev => ({
          ...prev,
          [tagLabel]: true
        }));
      } catch (error) {
        console.error(`获取标签 "${tagLabel}" 的问题失败:`, error);
      }
    },
    [projectId, searchTerm, expandedTags]
  );

  // 检查问题是否被选中 - 使用 useCallback 优化
  const isQuestionSelected = useCallback(
    questionKey => {
      return selectedQuestions.includes(questionKey);
    },
    [selectedQuestions]
  );

  // 处理生成数据集 - 使用 useCallback 优化
  const handleGenerateDataset = async (questionId, questionInfo) => {
    // 设置处理状态
    setProcessingQuestions(prev => ({
      ...prev,
      [questionId]: true
    }));
    await generateSingleDataset({ projectId, questionId, questionInfo });
    // 重置处理状态
    setProcessingQuestions(prev => ({
      ...prev,
      [questionId]: false
    }));
  };

  // 渲染单个问题项 - 使用 useCallback 优化
  const renderQuestionItem = useCallback(
    (question, index, total) => {
      const questionKey = question.id;
      return (
        <QuestionItem
          key={questionKey}
          question={question}
          index={index}
          total={total}
          isSelected={isQuestionSelected(questionKey)}
          onSelect={onSelectQuestion}
          onDelete={onDeleteQuestion}
          onGenerate={handleGenerateDataset}
          onEdit={onEditQuestion}
          isProcessing={processingQuestions[questionKey]}
          t={t}
        />
      );
    },
    [isQuestionSelected, onSelectQuestion, onDeleteQuestion, handleGenerateDataset, processingQuestions, t]
  );

  // 计算标签及其子标签下的所有问题数量 - 使用 useMemo 缓存计算结果
  const tagQuestionCounts = useMemo(() => {
    const counts = {};

    const countQuestions = tag => {
      const directQuestions = questionsByTag[tag.label] || [];
      let total = directQuestions.length;

      if (tag.child && tag.child.length > 0) {
        for (const childTag of tag.child) {
          total += countQuestions(childTag);
        }
      }

      counts[tag.label] = total;
      return total;
    };

    tags.forEach(countQuestions);
    return counts;
  }, [questionsByTag, tags]);

  // 递归渲染标签树 - 使用 useCallback 优化
  const renderTagTree = useCallback(
    (tag, level = 0) => {
      const questions = questionsByTag[tag.label] || [];
      const hasQuestions = questions.length > 0;
      const hasChildren = tag.child && tag.child.length > 0;
      const isExpanded = expandedTags[tag.label];
      const totalQuestions = tagQuestionCounts[tag.label] || 0;

      return (
        <Box key={tag.label}>
          <TagItem
            tag={tag}
            level={level}
            isExpanded={isExpanded}
            totalQuestions={totalQuestions}
            onToggle={handleToggleExpand}
            t={t}
          />

          {/* 只有当标签展开时才渲染子内容，减少不必要的渲染 */}
          {isExpanded && (
            <Collapse in={true}>
              {hasChildren && (
                <List disablePadding>{tag.child.map(childTag => renderTagTree(childTag, level + 1))}</List>
              )}

              {hasQuestions && (
                <List disablePadding sx={{ mt: hasChildren ? 1 : 0 }}>
                  {questions.map((question, index) => renderQuestionItem(question, index, questions.length))}
                </List>
              )}
            </Collapse>
          )}
        </Box>
      );
    },
    [questionsByTag, expandedTags, tagQuestionCounts, handleToggleExpand, renderQuestionItem, t]
  );

  // 渲染未分类问题
  const renderUncategorizedQuestions = () => {
    const uncategorizedQuestions = questionsByTag['uncategorized'] || [];
    if (uncategorizedQuestions.length === 0) return null;

    return (
      <Box>
        <ListItem
          button
          onClick={() => handleToggleExpand('uncategorized')}
          sx={{
            py: 1,
            bgcolor: 'primary.light',
            color: 'primary.contrastText',
            '&:hover': {
              bgcolor: 'primary.main'
            },
            borderRadius: '4px',
            mb: 0.5,
            pr: 1
          }}
        >
          <FolderIcon fontSize="small" sx={{ mr: 1, color: 'inherit' }} />
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                  {t('datasets.uncategorized')}
                </Typography>
                <Chip
                  label={t('datasets.questionCount', { count: uncategorizedQuestions.length })}
                  size="small"
                  sx={{ ml: 1, height: 20, fontSize: '0.7rem', color: '#fff', backgroundColor: '#333' }}
                />
              </Box>
            }
          />
          <IconButton size="small" edge="end" sx={{ color: 'inherit' }}>
            {expandedTags['uncategorized'] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </ListItem>

        <Collapse in={expandedTags['uncategorized']}>
          <List disablePadding>
            {uncategorizedQuestions.map((question, index) =>
              renderQuestionItem(question, index, uncategorizedQuestions.length)
            )}
          </List>
        </Collapse>
      </Box>
    );
  };

  // 如果没有标签和问题，显示空状态
  if (tags.length === 0 && Object.keys(questionsByTag).length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          {t('datasets.noTagsAndQuestions')}
        </Typography>
      </Box>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        overflow: 'auto',
        p: 2,
        maxHeight: '75vh'
      }}
    >
      <List disablePadding>
        {renderUncategorizedQuestions()}
        {tags.map(tag => renderTagTree(tag))}
      </List>
    </Paper>
  );
}

// 使用 memo 优化问题项渲染
const QuestionItem = memo(
  ({ question, index, total, isSelected, onSelect, onDelete, onGenerate, onEdit, isProcessing, t }) => {
    const questionKey = question.id;
    return (
      <Box key={question.id}>
        <ListItem
          sx={{
            pl: 4,
            py: 1,
            borderRadius: '4px',
            ml: 2,
            mr: 1,
            mb: 0.5,
            bgcolor: isSelected ? 'action.selected' : 'transparent',
            '&:hover': {
              bgcolor: 'action.hover'
            }
          }}
        >
          <Checkbox checked={isSelected} onChange={() => onSelect(questionKey)} size="small" />
          <QuestionMarkIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
          <ListItemText
            primary={
              <Typography variant="body2" sx={{ fontWeight: 400 }}>
                {question.question}
                {question.dataSites && question.dataSites.length > 0 && (
                  <Chip
                    label={t('datasets.answerCount', { count: question.dataSites.length })}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ ml: 1, fontSize: '0.75rem', maxWidth: 150 }}
                  />
                )}
              </Typography>
            }
            secondary={
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {t('datasets.source')}: {question.chunk?.name || question.chunkId || t('common.unknown')}
              </Typography>
            }
          />
          <Box>
            <Tooltip title={t('common.edit')}>
              <IconButton
                size="small"
                sx={{ mr: 1 }}
                onClick={() =>
                  onEdit({
                    question: question.question,
                    chunkId: question.chunkId,
                    label: question.label || 'other'
                  })
                }
                disabled={isProcessing}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('datasets.generateDataset')}>
              <IconButton
                size="small"
                sx={{ mr: 1 }}
                onClick={() => onGenerate(question.id, question.question)}
                disabled={isProcessing}
              >
                {isProcessing ? <CircularProgress size={16} /> : <AutoFixHighIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Tooltip title={t('common.delete')}>
              <IconButton size="small" onClick={() => onDelete(question.question, question.chunkId)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </ListItem>
        {index < total - 1 && <Divider component="li" variant="inset" sx={{ ml: 6 }} />}
      </Box>
    );
  }
);

// 使用 memo 优化标签项渲染
const TagItem = memo(({ tag, level, isExpanded, totalQuestions, onToggle, t }) => {
  return (
    <ListItem
      button
      onClick={() => onToggle(tag.label)}
      sx={{
        pl: level * 2 + 1,
        py: 1,
        bgcolor: level === 0 ? 'primary.light' : 'background.paper',
        color: level === 0 ? 'primary.contrastText' : 'inherit',
        '&:hover': {
          bgcolor: level === 0 ? 'primary.main' : 'action.hover'
        },
        borderRadius: '4px',
        mb: 0.5,
        pr: 1
      }}
    >
      {/* 内部内容保持不变 */}
      <FolderIcon fontSize="small" sx={{ mr: 1, color: level === 0 ? 'inherit' : 'primary.main' }} />
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography
              variant="body1"
              sx={{
                fontWeight: level === 0 ? 600 : 400,
                fontSize: level === 0 ? '1rem' : '0.9rem'
              }}
            >
              {tag.label}
            </Typography>
            {totalQuestions > 0 && (
              <Chip
                label={t('datasets.questionCount', { count: totalQuestions })}
                size="small"
                color={level === 0 ? 'default' : 'primary'}
                variant={level === 0 ? 'default' : 'outlined'}
                sx={{ ml: 1, height: 20, fontSize: '0.7rem', color: '#fff', backgroundColor: '#333' }}
              />
            )}
          </Box>
        }
      />
      <IconButton size="small" edge="end" sx={{ color: level === 0 ? 'inherit' : 'action.active' }}>
        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </IconButton>
    </ListItem>
  );
});
