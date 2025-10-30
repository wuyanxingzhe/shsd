'use client';

import { Container, Typography, Box, Card, useTheme, alpha } from '@mui/material';
import { Chat as ChatIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

// 导入拆分后的组件
import SearchBar from './components/SearchBar';
import ConversationTable from './components/ConversationTable';
import FilterDialog from './components/FilterDialog';
import { useMultiTurnData } from './hooks/useMultiTurnData';

export default function MultiTurnDatasetPage({ params }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { projectId } = params;

  // 使用自定义Hook管理状态和逻辑
  const {
    conversations,
    loading,
    page,
    rowsPerPage,
    total,
    searchKeyword,
    filterDialogOpen,
    exportLoading,
    filters,
    selectedIds,
    isAllSelected,
    batchDeleteLoading,
    setSearchKeyword,
    setFilterDialogOpen,
    setFilters,
    fetchConversations,
    handleExport,
    handleDelete,
    handleView,
    applyFilters,
    resetFilters,
    handleSearch,
    handlePageChange,
    handleRowsPerPageChange,
    handleBatchDelete,
    handleSelectionChange,
    handleSelectAll
  } = useMultiTurnData(projectId);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      <Card
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          backgroundColor: alpha(theme.palette.primary.light, 0.05),
          borderRadius: 2
        }}
      >
        {/* <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <ChatIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            {t('datasets.multiTurnConversations')}
          </Typography>
        </Box> */}

        <SearchBar
          searchKeyword={searchKeyword}
          onSearchChange={setSearchKeyword}
          onSearch={handleSearch}
          onFilterClick={() => setFilterDialogOpen(true)}
          onExportClick={handleExport}
          exportLoading={exportLoading}
          selectedCount={isAllSelected ? total : selectedIds.length}
          onBatchDelete={handleBatchDelete}
          batchDeleteLoading={batchDeleteLoading}
        />
      </Card>

      <ConversationTable
        conversations={conversations}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        total={total}
        onView={handleView}
        onDelete={handleDelete}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        selectedIds={selectedIds}
        onSelectionChange={handleSelectionChange}
        isAllSelected={isAllSelected}
        onSelectAll={handleSelectAll}
      />

      <FilterDialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
        onReset={resetFilters}
        onApply={applyFilters}
      />
    </Container>
  );
}
