'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

/**
 * 多轮对话数据管理Hook
 * @param {string} projectId - 项目ID
 */
export const useMultiTurnData = projectId => {
  const { t } = useTranslation();
  const router = useRouter();

  // 状态管理
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [total, setTotal] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // 批量删除相关状态
  const [selectedIds, setSelectedIds] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [batchDeleteLoading, setBatchDeleteLoading] = useState(false);

  // 筛选条件
  const [filters, setFilters] = useState({
    roleA: '',
    roleB: '',
    scenario: '',
    scoreMin: '',
    scoreMax: '',
    confirmed: ''
  });

  // 获取多轮对话数据集列表
  const fetchConversations = async (newPage = page) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: newPage + 1,
        pageSize: rowsPerPage
      });

      if (searchKeyword) params.append('keyword', searchKeyword);
      if (filters.roleA) params.append('roleA', filters.roleA);
      if (filters.roleB) params.append('roleB', filters.roleB);
      if (filters.scenario) params.append('scenario', filters.scenario);
      if (filters.scoreMin) params.append('scoreMin', filters.scoreMin);
      if (filters.scoreMax) params.append('scoreMax', filters.scoreMax);
      if (filters.confirmed) params.append('confirmed', filters.confirmed);

      const response = await fetch(`/api/projects/${projectId}/dataset-conversations?${params.toString()}`);
      if (!response.ok) {
        throw new Error(t('datasets.fetchDataFailed'));
      }

      const data = await response.json();
      setConversations(data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('获取多轮对话数据集失败:', error);
      toast.error(error.message || t('datasets.fetchDataFailed'));
    } finally {
      setLoading(false);
    }
  };

  // 导出数据集
  const handleExport = async () => {
    try {
      setExportLoading(true);
      const response = await fetch(`/api/projects/${projectId}/dataset-conversations/export`);

      if (!response.ok) {
        throw new Error(t('datasets.exportFailed'));
      }

      const data = await response.json();

      // 创建下载链接
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `multi-turn-conversations-${projectId}-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(t('datasets.exportSuccess'));
    } catch (error) {
      console.error('导出失败:', error);
      toast.error(error.message || t('datasets.exportFailed'));
    } finally {
      setExportLoading(false);
    }
  };

  // 获取所有对话 ID
  const fetchAllConversationIds = async () => {
    try {
      const params = new URLSearchParams({ getAllIds: 'true' });

      // 添加筛选条件
      if (searchKeyword) params.append('keyword', searchKeyword);
      if (filters.roleA) params.append('roleA', filters.roleA);
      if (filters.roleB) params.append('roleB', filters.roleB);
      if (filters.scenario) params.append('scenario', filters.scenario);
      if (filters.scoreMin) params.append('scoreMin', filters.scoreMin);
      if (filters.scoreMax) params.append('scoreMax', filters.scoreMax);
      if (filters.confirmed) params.append('confirmed', filters.confirmed);

      const response = await fetch(`/api/projects/${projectId}/dataset-conversations?${params.toString()}`);
      if (!response.ok) {
        throw new Error(t('datasets.fetchDataFailed'));
      }

      const data = await response.json();
      return data.allConversationIds || [];
    } catch (error) {
      console.error('获取所有对话ID失败:', error);
      toast.error(error.message || t('datasets.fetchDataFailed'));
      return [];
    }
  };

  // 删除对话数据集
  const handleDelete = async conversationId => {
    if (!confirm(t('datasets.confirmDeleteConversation'))) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/dataset-conversations/${conversationId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(t('datasets.deleteFailed'));
      }

      toast.success(t('datasets.deleteSuccess'));
      fetchConversations();
    } catch (error) {
      console.error('删除失败:', error);
      toast.error(error.message || t('datasets.deleteFailed'));
    }
  };

  // 并发删除函数
  const deleteConversationsConcurrently = async (conversationIds, concurrency = 10) => {
    const results = [];
    const errors = [];

    for (let i = 0; i < conversationIds.length; i += concurrency) {
      const batch = conversationIds.slice(i, i + concurrency);
      const promises = batch.map(async id => {
        try {
          const response = await fetch(`/api/projects/${projectId}/dataset-conversations/${id}`, {
            method: 'DELETE'
          });
          if (!response.ok) {
            throw new Error(`删除对话 ${id} 失败`);
          }
          return { id, success: true };
        } catch (error) {
          errors.push({ id, error: error.message });
          return { id, success: false, error: error.message };
        }
      });

      const batchResults = await Promise.all(promises);
      results.push(...batchResults);
    }

    return { results, errors };
  };

  // 批量删除处理
  const handleBatchDelete = async () => {
    let idsToDelete = selectedIds;

    // 如果是全选，需要获取所有ID
    if (isAllSelected) {
      idsToDelete = await fetchAllConversationIds();
      if (idsToDelete.length === 0) {
        toast.error(t('datasets.noDataToDelete'));
        return;
      }
    }

    if (idsToDelete.length === 0) {
      toast.error(t('datasets.pleaseSelectData'));
      return;
    }

    if (!confirm(t('common.confirmDelete', { count: idsToDelete.length }))) {
      return;
    }

    try {
      setBatchDeleteLoading(true);
      const { results, errors } = await deleteConversationsConcurrently(idsToDelete);

      const successCount = results.filter(r => r.success).length;
      const failCount = errors.length;

      if (failCount === 0) {
        toast.success(t('common.deleteSuccess', { count: successCount }));
      } else {
        toast.warning(t('datasets.batchDeletePartialSuccess', { success: successCount, fail: failCount }));
      }

      // 清空选择状态
      setSelectedIds([]);
      setIsAllSelected(false);

      // 刷新数据
      fetchConversations();
    } catch (error) {
      console.error('批量删除失败:', error);
      toast.error(error.message || t('datasets.batchDeleteFailed'));
    } finally {
      setBatchDeleteLoading(false);
    }
  };

  // 处理选择变化
  const handleSelectionChange = newSelectedIds => {
    setSelectedIds(newSelectedIds);
    // 如果没有选中任何项，取消全选状态
    if (newSelectedIds.length === 0) {
      setIsAllSelected(false);
    }
  };

  // 处理全选
  const handleSelectAll = selectAll => {
    setIsAllSelected(selectAll);
    if (!selectAll) {
      setSelectedIds([]);
    }
  };

  // 查看详情
  const handleView = conversationId => {
    router.push(`/projects/${projectId}/multi-turn/${conversationId}`);
  };

  // 应用筛选
  const applyFilters = () => {
    setPage(0);
    setFilterDialogOpen(false);
    fetchConversations(0);
  };

  // 重置筛选
  const resetFilters = () => {
    setFilters({
      roleA: '',
      roleB: '',
      scenario: '',
      scoreMin: '',
      scoreMax: '',
      confirmed: ''
    });
    setSearchKeyword('');
    setPage(0);
    fetchConversations(0);
  };

  // 处理搜索
  const handleSearch = () => {
    setPage(0);
    fetchConversations(0);
  };

  // 处理页面变化
  const handlePageChange = newPage => {
    setPage(newPage);
  };

  // 处理每页行数变化
  const handleRowsPerPageChange = newRowsPerPage => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  // 页面初始化
  useEffect(() => {
    fetchConversations();
  }, [projectId, page, rowsPerPage]);

  return {
    // 状态
    conversations,
    loading,
    page,
    rowsPerPage,
    total,
    searchKeyword,
    filterDialogOpen,
    exportLoading,
    filters,

    // 批量删除相关状态
    selectedIds,
    isAllSelected,
    batchDeleteLoading,

    // 状态设置函数
    setSearchKeyword,
    setFilterDialogOpen,
    setFilters,

    // 操作函数
    fetchConversations,
    handleExport,
    handleDelete,
    handleView,
    applyFilters,
    resetFilters,
    handleSearch,
    handlePageChange,
    handleRowsPerPageChange,

    // 批量删除相关函数
    handleBatchDelete,
    handleSelectionChange,
    handleSelectAll
  };
};
