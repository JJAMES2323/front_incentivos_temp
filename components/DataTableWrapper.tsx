'use client';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { DataGrid, GridColDef, GridRowsProp, GridPaginationModel } from '@mui/x-data-grid';
import { esES } from '@mui/x-data-grid/locales';
import { useTheme } from '@/contexts/ThemeContext';

interface DataTableWrapperProps {
  rows: GridRowsProp;
  columns: GridColDef[];
  loading?: boolean;
  paginationModel?: GridPaginationModel;
  onPaginationModelChange?: (model: GridPaginationModel) => void;
  rowCount?: number;
  pageSizeOptions?: number[];
  autoHeight?: boolean;
  getRowId?: (row: Record<string, unknown>) => string | number;
}

export default function DataTableWrapper({
  rows,
  columns,
  loading = false,
  paginationModel,
  onPaginationModelChange,
  rowCount,
  pageSizeOptions = [10, 25, 50, 100],
  autoHeight = false,
  getRowId,
}: DataTableWrapperProps) {
  const { mode } = useTheme();

  return (
    <Paper
      sx={{
        width: '100%',
        overflow: 'hidden',
        p: 2,
        animation: 'slideUp 0.5s ease',
        border: mode === 'dark'
          ? '1px solid rgba(71, 85, 105, 0.4)'
          : '1px solid rgba(226, 232, 240, 0.6)',
        boxShadow: mode === 'dark'
          ? '0 4px 20px rgba(0, 0, 0, 0.2)'
          : '0 4px 20px rgba(0, 0, 0, 0.04)',
      }}
    >
      <Box sx={{ width: '100%', height: autoHeight ? 'auto' : 500 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          {...(paginationModel ? { paginationModel } : {})}
          {...(onPaginationModelChange ? { onPaginationModelChange } : {})}
          rowCount={rowCount}
          pageSizeOptions={pageSizeOptions}
          paginationMode={rowCount !== undefined ? 'server' : 'client'}
          disableRowSelectionOnClick
          getRowId={getRowId}
          localeText={esES.components.MuiDataGrid.defaultProps.localeText}
          sx={{
            border: 0,
            '& .MuiDataGrid-cell': {
              borderBottom: mode === 'dark'
                ? '1px solid rgba(71, 85, 105, 0.3)'
                : '1px solid rgba(241, 245, 249, 1)',
              py: 1,
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: mode === 'dark'
                  ? 'rgba(99, 102, 241, 0.05)'
                  : 'rgba(99, 102, 241, 0.03)',
              },
            },
            '& .MuiDataGrid-row': {
              borderRadius: 8,
              mx: 0.5,
              '&:hover': {
                backgroundColor: mode === 'dark'
                  ? 'rgba(99, 102, 241, 0.08)'
                  : 'rgba(99, 102, 241, 0.04)',
                transform: 'scale(1.005)',
              },
            },
            '& .MuiDataGrid-columnHeaders': {
              background: mode === 'dark'
                ? 'linear-gradient(to bottom, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95))'
                : 'linear-gradient(to bottom, rgba(248, 250, 252, 0.95), rgba(241, 245, 249, 0.95))',
              borderBottom: mode === 'dark'
                ? '2px solid rgba(71, 85, 105, 0.5)'
                : '2px solid rgba(226, 232, 240, 1)',
              borderRadius: '12px 12px 0 0',
              fontWeight: 700,
            },
            '& .MuiDataGrid-columnHeader': {
              fontWeight: 700,
              fontSize: '0.8rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: mode === 'dark' ? '#94a3b8' : '#64748b',
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: mode === 'dark'
                ? '1px solid rgba(71, 85, 105, 0.3)'
                : '1px solid rgba(241, 245, 249, 1)',
              borderRadius: '0 0 12px 12px',
              bgcolor: mode === 'dark'
                ? 'rgba(15, 23, 42, 0.5)'
                : 'rgba(248, 250, 252, 0.5)',
            },
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-cell:focus-within': {
              outline: 'none',
            },
            '& .MuiDataGrid-checkboxInput': {
              color: mode === 'dark' ? '#6366f1' : '#6366f1',
            },
            '& .MuiDataGrid-sortIcon': {
              color: mode === 'dark' ? '#6366f1' : '#6366f1',
            },
            '& .MuiDataGrid-menuIcon': {
              color: mode === 'dark' ? '#6366f1' : '#6366f1',
            },
          }}
          slotProps={{
            loadingOverlay: {
              variant: 'skeleton',
              noRowsVariant: 'skeleton',
            },
          }}
        />
      </Box>
    </Paper>
  );
}
