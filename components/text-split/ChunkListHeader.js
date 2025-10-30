'use client';

import { Box, Typography, Checkbox, Button, Select, MenuItem, Tooltip, Menu, IconButton } from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';
import DownloadIcon from '@mui/icons-material/Download';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

export default function ChunkListHeader({
  projectId,
  totalChunks,
  selectedChunks,
  onSelectAll,
  onBatchGenerateQuestions,
  onBatchEditChunks,
  questionFilter,
  setQuestionFilter,
  chunks = [], // 添加chunks参数，用于导出文本块
  selectedModel = {}
}) {
  const { t, i18n } = useTranslation();

  // 添加更多菜单的状态和锚点
  const [moreMenuAnchorEl, setMoreMenuAnchorEl] = useState(null);
  const isMoreMenuOpen = Boolean(moreMenuAnchorEl);

  // 打开更多菜单
  const handleMoreMenuClick = event => {
    setMoreMenuAnchorEl(event.currentTarget);
  };

  // 关闭更多菜单
  const handleMoreMenuClose = () => {
    setMoreMenuAnchorEl(null);
  };

  // 处理批量编辑，关闭菜单并调用原有函数
  const handleBatchEdit = () => {
    handleMoreMenuClose();
    onBatchEditChunks();
  };

  // 处理导出文本块，关闭菜单并调用原有函数
  const handleExport = () => {
    handleMoreMenuClose();
    handleExportChunks();
  };

  // 创建自动提取问题任务
  const handleCreateAutoQuestionTask = async () => {
    if (!projectId || !selectedModel?.id) {
      toast.error(t('textSplit.selectModelFirst', { defaultValue: '请先选择模型' }));
      return;
    }

    try {
      // 调用创建任务接口
      const response = await axios.post(`/api/projects/${projectId}/tasks`, {
        taskType: 'question-generation',
        modelInfo: selectedModel,
        language: i18n.language,
        detail: '批量生成问题任务'
      });

      if (response.data?.code === 0) {
        toast.success(t('tasks.createSuccess', { defaultValue: '后台任务已创建，系统将自动处理未生成问题的文本块' }));
      } else {
        toast.error(t('tasks.createFailed', { defaultValue: '创建任务失败' }) + ': ' + response.data?.message);
      }
    } catch (error) {
      console.error('创建自动提取问题任务失败:', error);
      toast.error(t('tasks.createFailed', { defaultValue: '创建任务失败' }) + ': ' + error.message);
    }
  };

  // 创建自动数据清洗任务
  const handleCreateAutoDataCleaningTask = async () => {
    if (!projectId || !selectedModel?.id) {
      toast.error(t('textSplit.selectModelFirst', { defaultValue: '请先选择模型' }));
      return;
    }

    try {
      // 调用创建任务接口
      const response = await axios.post(`/api/projects/${projectId}/tasks`, {
        taskType: 'data-cleaning',
        modelInfo: selectedModel,
        language: i18n.language,
        detail: '批量数据清洗任务'
      });

      if (response.data?.code === 0) {
        toast.success(
          t('tasks.createSuccess', { defaultValue: '后台任务已创建，系统将自动处理所有文本块进行数据清洗' })
        );
      } else {
        toast.error(t('tasks.createFailed', { defaultValue: '创建任务失败' }) + ': ' + response.data?.message);
      }
    } catch (error) {
      console.error('创建自动数据清洗任务失败:', error);
      toast.error(t('tasks.createFailed', { defaultValue: '创建任务失败' }) + ': ' + error.message);
    }
  };

  // 导出文本块为JSON文件的函数
  const handleExportChunks = () => {
    if (!chunks || chunks.length === 0) return;

    // 创建要导出的数据对象
    const exportData = chunks.map(chunk => ({
      name: chunk.name,
      projectId: chunk.projectId,
      fileName: chunk.fileName,
      content: chunk.content,
      summary: chunk.summary,
      size: chunk.size
    }));

    // 将数据转换为JSON字符串
    const jsonString = JSON.stringify(exportData, null, 2);

    // 创建Blob对象
    const blob = new Blob([jsonString], { type: 'application/json' });

    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `text-chunks-export-${new Date().toISOString().split('T')[0]}.json`;

    // 触发下载
    document.body.appendChild(a);
    a.click();

    // 清理
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', md: 'center' },
        gap: 2,
        mb: 3
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Checkbox
          checked={selectedChunks.length === totalChunks}
          indeterminate={selectedChunks.length > 0 && selectedChunks.length < totalChunks}
          onChange={onSelectAll}
        />
        <Typography variant="body1">
          {t('textSplit.selectedCount', { count: selectedChunks.length })} ,
          {t('textSplit.totalCount', { count: totalChunks })}
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexWrap: 'wrap',
          gap: 1.5,
          width: { xs: '100%', md: 'auto' }
        }}
      >
        <Select value={questionFilter} onChange={setQuestionFilter} size="small" sx={{ minWidth: 150 }}>
          <MenuItem value="all">{t('textSplit.allChunks')}</MenuItem>
          <MenuItem value="generated">{t('textSplit.generatedQuestions2')}</MenuItem>
          <MenuItem value="ungenerated">{t('textSplit.ungeneratedQuestions')}</MenuItem>
        </Select>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1.5,
            mt: { xs: 1, sm: 0 },
            width: { xs: '100%', sm: 'auto' }
          }}
        >
          <Button
            variant="contained"
            color="primary"
            startIcon={<QuizIcon />}
            disabled={selectedChunks.length === 0}
            onClick={onBatchGenerateQuestions}
            size="medium"
            sx={{ minWidth: { xs: '48%', sm: 'auto' } }}
          >
            {t('textSplit.batchGenerateQuestions')}
          </Button>

          <Tooltip
            title={t('textSplit.autoGenerateQuestionsTip', {
              defaultValue: '创建后台批量处理任务：自动查询待生成问题的文本块并提取问题'
            })}
          >
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<AutoFixHighIcon />}
              onClick={() => handleCreateAutoQuestionTask()}
              disabled={!projectId || !selectedModel?.id}
              size="medium"
              sx={{ minWidth: { xs: '48%', sm: 'auto' } }}
            >
              {t('textSplit.autoGenerateQuestions')}
            </Button>
          </Tooltip>

          <Tooltip
            title={t('textSplit.autoDataCleaningTip', {
              defaultValue: '创建后台批量处理任务：自动对所有文本块进行数据清洗'
            })}
          >
            <Button
              variant="outlined"
              color="success"
              startIcon={<CleaningServicesIcon />}
              onClick={() => handleCreateAutoDataCleaningTask()}
              disabled={!projectId || !selectedModel?.id}
              size="medium"
              sx={{ minWidth: { xs: '48%', sm: 'auto' } }}
            >
              {t('textSplit.autoDataCleaning', { defaultValue: '自动数据清洗' })}
            </Button>
          </Tooltip>

          {/* 更多菜单按钮 */}
          <Tooltip title={t('common.more', { defaultValue: '更多操作' })}>
            <IconButton
              onClick={handleMoreMenuClick}
              color="primary"
              size="medium"
              sx={{
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <MoreVertIcon />
            </IconButton>
          </Tooltip>

          {/* 更多操作下拉菜单 */}
          <Menu
            anchorEl={moreMenuAnchorEl}
            open={isMoreMenuOpen}
            onClose={handleMoreMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right'
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right'
            }}
          >
            <MenuItem onClick={handleBatchEdit} disabled={selectedChunks.length === 0}>
              <EditIcon fontSize="small" sx={{ mr: 1 }} />
              {t('batchEdit.batchEdit', { defaultValue: '批量编辑' })}
            </MenuItem>
            <MenuItem onClick={handleExport} disabled={chunks.length === 0}>
              <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
              {t('textSplit.exportChunks', { defaultValue: '导出文本块' })}
            </MenuItem>
          </Menu>
        </Box>
      </Box>
    </Box>
  );
}
