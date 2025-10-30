'use client';

import { useState, useEffect } from 'react';
import { Container, Box, Typography, Button, CircularProgress, Card, useTheme, alpha } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRouter } from 'next/navigation';
import ExportDatasetDialog from '@/components/ExportDatasetDialog';
import ExportProgressDialog from '@/components/ExportProgressDialog';
import ImportDatasetDialog from '@/components/datasets/ImportDatasetDialog';
import { useTranslation } from 'react-i18next';
import DatasetList from './components/DatasetList';
import SearchBar from './components/SearchBar';
import ActionBar from './components/ActionBar';
import FilterDialog from './components/FilterDialog';
import DeleteConfirmDialog from './components/DeleteConfirmDialog';
import useDatasetExport from './hooks/useDatasetExport';
import useDatasetEvaluation from './hooks/useDatasetEvaluation';
import useDatasetFilters from './hooks/useDatasetFilters';
import { processInParallel } from '@/lib/util/async';
import axios from 'axios';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from 'sonner';

// 主页面组件
export default function DatasetsPage({ params }) {
  const { projectId } = params;
  const router = useRouter();
  const theme = useTheme();
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    datasets: null,
    batch: false,
    deleting: false
  });
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [exportDialog, setExportDialog] = useState({ open: false });
  const [importDialog, setImportDialog] = useState({ open: false });
  const [selectedIds, setselectedIds] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const { t } = useTranslation();

  // 使用 useDatasetFilters Hook 管理筛选条件
  const {
    filterConfirmed,
    setFilterConfirmed,
    filterHasCot,
    setFilterHasCot,
    filterIsDistill,
    setFilterIsDistill,
    filterScoreRange,
    setFilterScoreRange,
    filterCustomTag,
    setFilterCustomTag,
    filterNoteKeyword,
    setFilterNoteKeyword,
    searchQuery,
    setSearchQuery,
    searchField,
    setSearchField,
    isInitialized,
    getActiveFilterCount
  } = useDatasetFilters(projectId);

  const debouncedSearchQuery = useDebounce(searchQuery);
  // 删除进度状态
  const [deleteProgress, setDeteleProgress] = useState({
    total: 0, // 总删除问题数量
    completed: 0, // 已删除完成的数量
    percentage: 0 // 进度百分比
  });
  // 导出进度状态
  const [exportProgress, setExportProgress] = useState({
    show: false, // 是否显示进度
    processed: 0, // 已处理数量
    total: 0, // 总数量
    hasMore: true // 是否还有更多数据
  });

  // 3. 添加打开导出对话框的处理函数
  const handleOpenExportDialog = () => {
    setExportDialog({ open: true });
  };

  // 4. 添加关闭导出对话框的处理函数
  const handleCloseExportDialog = () => {
    setExportDialog({ open: false });
  };

  // 5. 添加打开导入对话框的处理函数
  const handleOpenImportDialog = () => {
    setImportDialog({ open: true });
  };

  // 6. 添加关闭导入对话框的处理函数
  const handleCloseImportDialog = () => {
    setImportDialog({ open: false });
  };

  // 7. 导入成功后的处理函数
  const handleImportSuccess = () => {
    // 刷新数据集列表
    getDatasetsList();
    toast.success(t('import.importSuccess', '数据集导入成功'));
  };

  // 获取数据集列表
  const getDatasetsList = async () => {
    try {
      setLoading(true);
      let url = `/api/projects/${projectId}/datasets?page=${page}&size=${rowsPerPage}`;

      if (filterConfirmed !== 'all') {
        url += `&status=${filterConfirmed}`;
      }

      if (searchQuery) {
        url += `&input=${encodeURIComponent(searchQuery)}&field=${searchField}`;
      }

      if (filterHasCot !== 'all') {
        url += `&hasCot=${filterHasCot}`;
      }

      if (filterIsDistill !== 'all') {
        url += `&isDistill=${filterIsDistill}`;
      }

      if (filterScoreRange[0] > 0 || filterScoreRange[1] < 5) {
        url += `&scoreRange=${filterScoreRange[0]}-${filterScoreRange[1]}`;
      }

      if (filterCustomTag) {
        url += `&customTag=${encodeURIComponent(filterCustomTag)}`;
      }

      if (filterNoteKeyword) {
        url += `&noteKeyword=${encodeURIComponent(filterNoteKeyword)}`;
      }

      const response = await axios.get(url);
      setDatasets(response.data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isInitialized) return;

    getDatasetsList();
    // 获取项目中所有使用过的标签
    const fetchAvailableTags = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/datasets/tags`);
        if (response.ok) {
          const data = await response.json();
          setAvailableTags(data.tags || []);
        }
      } catch (error) {
        console.error('获取标签失败:', error);
      }
    };
    fetchAvailableTags();
  }, [
    projectId,
    page,
    rowsPerPage,
    filterConfirmed,
    debouncedSearchQuery,
    searchField,
    filterHasCot,
    filterIsDistill,
    filterScoreRange,
    filterCustomTag,
    filterNoteKeyword,
    isInitialized
  ]);

  // 处理页码变化
  const handlePageChange = (event, newPage) => {
    // MUI TablePagination 的页码从 0 开始，而我们的 API 从 1 开始
    setPage(newPage + 1);
  };

  // 处理每页行数变化
  const handleRowsPerPageChange = event => {
    setPage(1);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  // 打开删除确认框
  const handleOpenDeleteDialog = dataset => {
    setDeleteDialog({
      open: true,
      datasets: [dataset]
    });
  };

  // 关闭删除确认框
  const handleCloseDeleteDialog = () => {
    setDeleteDialog({
      open: false,
      dataset: null
    });
  };

  const handleBatchDeleteDataset = async () => {
    const datasetsArray = selectedIds.map(id => ({ id }));
    setDeleteDialog({
      open: true,
      datasets: datasetsArray,
      batch: true,
      count: selectedIds.length
    });
  };

  const resetProgress = () => {
    setDeteleProgress({
      total: deleteDialog.count,
      completed: 0,
      percentage: 0
    });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.batch) {
      setDeleteDialog({
        ...deleteDialog,
        deleting: true
      });
      await handleBatchDelete();
      resetProgress();
    } else {
      const [dataset] = deleteDialog.datasets;
      if (!dataset) return;
      await handleDelete(dataset);
    }
    setselectedIds([]);
    // 刷新数据
    getDatasetsList();
    // 关闭确认框
    handleCloseDeleteDialog();
  };

  // 批量删除数据集
  const handleBatchDelete = async () => {
    try {
      await processInParallel(
        selectedIds,
        async datasetId => {
          await fetch(`/api/projects/${projectId}/datasets?id=${datasetId}`, {
            method: 'DELETE'
          });
        },
        3,
        (cur, total) => {
          setDeteleProgress({
            total,
            completed: cur,
            percentage: Math.floor((cur / total) * 100)
          });
        }
      );

      toast.success(t('common.deleteSuccess'));
    } catch (error) {
      console.error('批量删除失败:', error);
      toast.error(error.message || t('common.deleteFailed'));
    }
  };

  // 删除数据集
  const handleDelete = async dataset => {
    try {
      const response = await fetch(`/api/projects/${projectId}/datasets?id=${dataset.id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error(t('datasets.deleteFailed'));

      toast.success(t('datasets.deleteSuccess'));
    } catch (error) {
      toast.error(error.message || t('datasets.deleteFailed'));
    }
  };

  // 使用自定义 Hook 处理数据集导出逻辑
  const { exportDatasets, exportDatasetsStreaming } = useDatasetExport(projectId);

  // 使用自定义 Hook 处理数据集评估逻辑
  const { evaluatingIds, batchEvaluating, handleEvaluateDataset, handleBatchEvaluate } = useDatasetEvaluation(
    projectId,
    getDatasetsList
  );

  // 处理导出数据集 - 智能选择导出方式
  const handleExportDatasets = async exportOptions => {
    try {
      // 如果有选中数据集，则传递选中的 ID 列表，否则传递筛选条件
      const exportOptionsWithSelection = {
        ...exportOptions,
        ...(selectedIds.length > 0 && { selectedIds })
      };

      // 获取数据总量：如果有选中数据集则使用选中数量，否则使用当前筛选条件下的数据总量
      const totalCount = selectedIds.length > 0 ? selectedIds.length : datasets.total || 0;

      // 设置阈值：超过2000条数据使用流式导出
      const STREAMING_THRESHOLD = 1000;

      // 检查是否需要包含文本块内容
      const needsChunkContent = exportOptions.formatType === 'custom' && exportOptions.customFields?.includeChunk;

      let success = false;

      // 如果数据量大于阈值或需要查询文本块内容，使用流式导出
      if (totalCount > STREAMING_THRESHOLD || needsChunkContent) {
        // 使用流式导出，显示进度
        setExportProgress({ show: true, processed: 0, total: totalCount });

        success = await exportDatasetsStreaming(exportOptionsWithSelection, progress => {
          setExportProgress(prev => ({
            ...prev,
            processed: progress.processed,
            hasMore: progress.hasMore
          }));
        });

        // 隐藏进度
        setExportProgress({ show: false, processed: 0, total: 0 });
      } else {
        // 使用传统导出方式
        success = await exportDatasets(exportOptionsWithSelection);
      }

      if (success) {
        // 关闭export对话框
        handleCloseExportDialog();
      }
    } catch (error) {
      console.error('Export failed:', error);
      setExportProgress({ show: false, processed: 0, total: 0 });
    }
  };

  // 查看详情
  const handleViewDetails = id => {
    router.push(`/projects/${projectId}/datasets/${id}`);
  };

  // 处理全选/取消全选
  const handleSelectAll = async event => {
    if (event.target.checked) {
      // 获取所有符合当前筛选条件的数据，不受分页限制
      let url = `/api/projects/${projectId}/datasets?selectedAll=1`;

      if (filterConfirmed !== 'all') {
        url += `&status=${filterConfirmed}`;
      }

      if (debouncedSearchQuery) {
        url += `&input=${encodeURIComponent(debouncedSearchQuery)}&field=${searchField}`;
      }

      if (filterHasCot !== 'all') {
        url += `&hasCot=${filterHasCot}`;
      }

      if (filterIsDistill !== 'all') {
        url += `&isDistill=${filterIsDistill}`;
      }

      if (filterScoreRange[0] > 0 || filterScoreRange[1] < 5) {
        url += `&scoreRange=${filterScoreRange[0]}-${filterScoreRange[1]}`;
      }

      if (filterCustomTag) {
        url += `&customTag=${encodeURIComponent(filterCustomTag)}`;
      }

      if (filterNoteKeyword) {
        url += `&noteKeyword=${encodeURIComponent(filterNoteKeyword)}`;
      }

      const response = await axios.get(url);
      setselectedIds(response.data.map(dataset => dataset.id));
    } else {
      setselectedIds([]);
    }
  };

  // 处理单个选择
  const handleSelectItem = id => {
    setselectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '70vh'
          }}
        >
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            {t('datasets.loading')}
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      <Card
        elevation={0}
        sx={{
          mb: 4,
          p: 3,
          backgroundColor: alpha(theme.palette.primary.light, 0.05),
          borderRadius: 2
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <SearchBar
            searchQuery={searchQuery}
            searchField={searchField}
            onSearchQueryChange={value => {
              setSearchQuery(value);
              setPage(1);
            }}
            onSearchFieldChange={value => {
              setSearchField(value);
              setPage(1);
            }}
            onMoreFiltersClick={() => setFilterDialogOpen(true)}
            activeFilterCount={getActiveFilterCount()}
          />
          <ActionBar
            batchEvaluating={batchEvaluating}
            onBatchEvaluate={handleBatchEvaluate}
            onImport={handleOpenImportDialog}
            onExport={handleOpenExportDialog}
          />
        </Box>
      </Card>
      {selectedIds.length ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            marginTop: '10px',
            gap: 2
          }}
        >
          <Typography variant="body1" color="text.secondary">
            {t('datasets.selected', {
              count: selectedIds.length
            })}
          </Typography>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            sx={{ borderRadius: 2 }}
            onClick={handleBatchDeleteDataset}
          >
            {t('datasets.batchDelete')}
          </Button>
        </Box>
      ) : (
        ''
      )}

      <DatasetList
        datasets={datasets.data}
        onViewDetails={handleViewDetails}
        onDelete={handleOpenDeleteDialog}
        onEvaluate={handleEvaluateDataset}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        total={datasets.total}
        selectedIds={selectedIds}
        onSelectAll={handleSelectAll}
        onSelectItem={handleSelectItem}
        evaluatingIds={evaluatingIds}
      />

      <DeleteConfirmDialog
        open={deleteDialog.open}
        datasets={deleteDialog.datasets || []}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteConfirm}
        batch={deleteDialog.batch}
        progress={deleteProgress}
        deleting={deleteDialog.deleting}
      />

      <FilterDialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        filterConfirmed={filterConfirmed}
        filterHasCot={filterHasCot}
        filterIsDistill={filterIsDistill}
        filterScoreRange={filterScoreRange}
        filterCustomTag={filterCustomTag}
        filterNoteKeyword={filterNoteKeyword}
        availableTags={availableTags}
        onFilterConfirmedChange={setFilterConfirmed}
        onFilterHasCotChange={setFilterHasCot}
        onFilterIsDistillChange={setFilterIsDistill}
        onFilterScoreRangeChange={setFilterScoreRange}
        onFilterCustomTagChange={setFilterCustomTag}
        onFilterNoteKeywordChange={setFilterNoteKeyword}
        onResetFilters={() => {
          setFilterConfirmed('all');
          setFilterHasCot('all');
          setFilterIsDistill('all');
          setFilterScoreRange([0, 5]);
          setFilterCustomTag('');
          setFilterNoteKeyword('');
          getDatasetsList();
        }}
        onApplyFilters={() => {
          setFilterDialogOpen(false);
          setPage(1);
          getDatasetsList();
        }}
      />

      <ExportDatasetDialog
        open={exportDialog.open}
        onClose={handleCloseExportDialog}
        onExport={handleExportDatasets}
        projectId={projectId}
      />

      <ImportDatasetDialog
        open={importDialog.open}
        onClose={handleCloseImportDialog}
        onImportSuccess={handleImportSuccess}
        projectId={projectId}
      />

      {/* 导出进度对话框 */}
      <ExportProgressDialog open={exportProgress.show} progress={exportProgress} />
    </Container>
  );
}
