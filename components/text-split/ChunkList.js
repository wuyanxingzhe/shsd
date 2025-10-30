'use client';

import { useState } from 'react';
import { Box, Paper, Typography, CircularProgress, Pagination, Grid } from '@mui/material';
import ChunkListHeader from './ChunkListHeader';
import ChunkCard from './ChunkCard';
import ChunkViewDialog from './ChunkViewDialog';
import ChunkDeleteDialog from './ChunkDeleteDialog';
import BatchEditChunksDialog from './BatchEditChunkDialog';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

/**
 * Chunk list component
 * @param {Object} props
 * @param {string} props.projectId - Project ID
 * @param {Array} props.chunks - Chunk array
 * @param {Function} props.onDelete - Delete callback
 * @param {Function} props.onEdit - Edit callback
 * @param {Function} props.onGenerateQuestions - Generate questions callback
 * @param {Function} props.onDataCleaning - Data cleaning callback
 * @param {string} props.questionFilter - Question filter
 * @param {Function} props.onQuestionFilterChange - Question filter change callback
 * @param {Object} props.selectedModel - 选中的模型信息
 */
export default function ChunkList({
  projectId,
  chunks = [],
  onDelete,
  onEdit,
  onGenerateQuestions,
  onDataCleaning,
  loading = false,
  questionFilter,
  setQuestionFilter,
  selectedModel,
  onChunksUpdate
}) {
  const theme = useTheme();
  const [page, setPage] = useState(1);
  const [selectedChunks, setSelectedChunks] = useState([]);
  const [viewChunk, setViewChunk] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chunkToDelete, setChunkToDelete] = useState(null);
  const [batchEditDialogOpen, setBatchEditDialogOpen] = useState(false);
  const [batchEditLoading, setBatchEditLoading] = useState(false);

  // 对文本块进行排序，先按文件ID排序，再按part-后面的数字排序
  const sortedChunks = [...chunks].sort((a, b) => {
    // 先按fileId排序
    if (a.fileId !== b.fileId) {
      return a.fileId.localeCompare(b.fileId);
    }

    // 同一文件内，再按part-后面的数字排序
    const getPartNumber = name => {
      const match = name.match(/part-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    };

    const numA = getPartNumber(a.name);
    const numB = getPartNumber(b.name);

    return numA - numB;
  });

  const itemsPerPage = 5;
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedChunks = sortedChunks.slice(startIndex, endIndex);
  const totalPages = Math.ceil(sortedChunks.length / itemsPerPage);
  const { t } = useTranslation();

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleViewChunk = async chunkId => {
    try {
      const response = await fetch(`/api/projects/${projectId}/chunks/${chunkId}`);
      if (!response.ok) {
        throw new Error(t('textSplit.fetchChunksFailed'));
      }

      const data = await response.json();
      setViewChunk(data);
      setViewDialogOpen(true);
    } catch (error) {
      console.error(t('textSplit.fetchChunksError'), error);
    }
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
  };

  const handleOpenDeleteDialog = chunkId => {
    setChunkToDelete(chunkId);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setChunkToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (chunkToDelete && onDelete) {
      onDelete(chunkToDelete);
    }
    handleCloseDeleteDialog();
  };

  // 处理编辑文本块
  const handleEditChunk = async (chunkId, newContent) => {
    if (onEdit) {
      onEdit(chunkId, newContent);
      onChunksUpdate();
    }
  };

  // 处理选择文本块
  const handleSelectChunk = chunkId => {
    setSelectedChunks(prev => {
      if (prev.includes(chunkId)) {
        return prev.filter(id => id !== chunkId);
      } else {
        return [...prev, chunkId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedChunks.length === chunks.length) {
      setSelectedChunks([]);
    } else {
      setSelectedChunks(chunks.map(chunk => chunk.id));
    }
  };

  const handleBatchGenerateQuestions = () => {
    if (onGenerateQuestions && selectedChunks.length > 0) {
      onGenerateQuestions(selectedChunks);
    }
  };

  const handleBatchEdit = async editData => {
    try {
      setBatchEditLoading(true);

      // 调用批量编辑API
      const response = await fetch(`/api/projects/${projectId}/chunks/batch-edit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          position: editData.position,
          content: editData.content,
          chunkIds: editData.chunkIds
        })
      });

      if (!response.ok) {
        throw new Error('批量编辑失败');
      }

      const result = await response.json();

      if (result.success) {
        // 编辑成功后，刷新文本块数据
        if (onChunksUpdate) {
          onChunksUpdate();
        }

        // 清空选中状态
        setSelectedChunks([]);

        // 关闭对话框
        setBatchEditDialogOpen(false);

        // 显示成功消息
        console.log(`成功更新了 ${result.updatedCount} 个文本块`);
      } else {
        throw new Error(result.message || '批量编辑失败');
      }
    } catch (error) {
      console.error('批量编辑失败:', error);
      // 这里可以添加错误提示
    } finally {
      setBatchEditLoading(false);
    }
  };

  // 打开批量编辑对话框
  const handleOpenBatchEdit = () => {
    setBatchEditDialogOpen(true);
  };

  // 关闭批量编辑对话框
  const handleCloseBatchEdit = () => {
    setBatchEditDialogOpen(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <ChunkListHeader
        projectId={projectId}
        totalChunks={chunks.length}
        selectedChunks={selectedChunks}
        onSelectAll={handleSelectAll}
        onBatchGenerateQuestions={handleBatchGenerateQuestions}
        onBatchEditChunks={handleOpenBatchEdit}
        questionFilter={questionFilter}
        setQuestionFilter={event => setQuestionFilter(event.target.value)}
        chunks={chunks}
        selectedModel={selectedModel}
      />

      <Grid container spacing={2}>
        {displayedChunks.map(chunk => (
          <Grid item xs={12} key={chunk.id}>
            <ChunkCard
              chunk={chunk}
              selected={selectedChunks.includes(chunk.id)}
              onSelect={() => handleSelectChunk(chunk.id)}
              onView={() => handleViewChunk(chunk.id)}
              onDelete={() => handleOpenDeleteDialog(chunk.id)}
              onEdit={handleEditChunk}
              onGenerateQuestions={() => onGenerateQuestions && onGenerateQuestions([chunk.id])}
              onDataCleaning={() => onDataCleaning && onDataCleaning([chunk.id])}
              projectId={projectId}
              selectedModel={selectedModel}
            />
          </Grid>
        ))}
      </Grid>

      {chunks.length === 0 && (
        <Paper
          sx={{
            p: 4,
            textAlign: 'center',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2
          }}
        >
          <Typography variant="body1" color="textSecondary">
            {t('textSplit.noChunks')}
          </Typography>
        </Paper>
      )}

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" />
        </Box>
      )}

      {/* 文本块详情对话框 */}
      <ChunkViewDialog open={viewDialogOpen} chunk={viewChunk} onClose={handleCloseViewDialog} />

      {/* 删除确认对话框 */}
      <ChunkDeleteDialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog} onConfirm={handleConfirmDelete} />

      {/* 批量编辑对话框 */}
      <BatchEditChunksDialog
        open={batchEditDialogOpen}
        onClose={handleCloseBatchEdit}
        onConfirm={handleBatchEdit}
        selectedChunks={selectedChunks}
        totalChunks={chunks.length}
        loading={batchEditLoading}
      />
    </Box>
  );
}
