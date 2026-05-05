'use client';

import { useState, useMemo, useCallback } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import { DataGrid, GridColDef, GridRowsProp, GridPaginationModel } from '@mui/x-data-grid';
import { esES } from '@mui/x-data-grid/locales';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useTheme } from '@/contexts/ThemeContext';

interface EnhancedDataTableProps {
  rows: GridRowsProp;
  columns: GridColDef[];
  loading?: boolean;
  paginationModel?: GridPaginationModel;
  onPaginationModelChange?: (model: GridPaginationModel) => void;
  rowCount?: number;
  pageSizeOptions?: number[];
  autoHeight?: boolean;
  getRowId?: (row: Record<string, unknown>) => string | number;
  title?: string;
  compact?: boolean;
  showToolbar?: boolean;
}

export default function EnhancedDataTable({
  rows,
  columns,
  loading = false,
  paginationModel,
  onPaginationModelChange,
  rowCount,
  pageSizeOptions = [10, 25, 50, 100],
  autoHeight = false,
  getRowId,
  title,
  compact = false,
  showToolbar = true,
}: EnhancedDataTableProps) {
  const { mode } = useTheme();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [globalSearch, setGlobalSearch] = useState('');

  const filterableColumns = columns.filter(
    (col) => col.field !== 'actions' && col.field !== 'id'
  );

  const filteredRows = useMemo(() => {
    const activeFilters = Object.entries(filters).filter(([, v]) => v.trim());
    const hasGlobalSearch = globalSearch.trim().length > 0;

    if (!activeFilters.length && !hasGlobalSearch) return rows;

    return rows.filter((row) => {
      const rowObj = row as Record<string, unknown>;

      for (const [field, value] of activeFilters) {
        if (!value.trim()) continue;
        const col = columns.find((c) => c.field === field);
        let cellValue: unknown;

        if (col?.valueGetter) {
          cellValue = col.valueGetter(rowObj[field], row);
        } else {
          cellValue = rowObj[field];
        }

        if (cellValue == null) return false;

        const cellString = typeof cellValue === 'object'
          ? JSON.stringify(cellValue).toLowerCase()
          : String(cellValue).toLowerCase();

        if (!cellString.includes(value.toLowerCase())) return false;
      }

      if (hasGlobalSearch) {
        const search = globalSearch.toLowerCase();
        return filterableColumns.some((col) => {
          let cellValue: unknown;
          if (col.valueGetter) {
            cellValue = col.valueGetter(rowObj[col.field], row);
          } else {
            cellValue = rowObj[col.field];
          }
          if (cellValue == null) return false;
          const cellString = typeof cellValue === 'object'
            ? JSON.stringify(cellValue).toLowerCase()
            : String(cellValue).toLowerCase();
          return cellString.includes(search);
        });
      }

      return true;
    });
  }, [rows, filters, globalSearch, columns, filterableColumns]);

  const clearAllFilters = () => {
    setFilters({});
    setGlobalSearch('');
  };

  const activeFilterCount = Object.values(filters).filter(v => v.trim()).length + (globalSearch.trim() ? 1 : 0);

  const cellHeight = compact ? 32 : 48;

  const renderHeader = useCallback((col: GridColDef) => {
    if (col.field === 'actions' || col.field === 'id') {
      return col.headerName;
    }

    const filterValue = filters[col.field] || '';

    return (
      <Box sx={{ width: '100%' }}>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: compact ? '0.65rem' : '0.7rem',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: mode === 'dark' ? '#94a3b8' : '#64748b',
            mb: 0.5,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {col.headerName}
        </Typography>
        <TextField
          size="small"
          placeholder="..."
          value={filterValue}
          onChange={(e) => {
            setFilters(prev => ({ ...prev, [col.field]: e.target.value }));
          }}
          onClick={(e) => e.stopPropagation()}
          sx={{
            '& .MuiOutlinedInput-root': {
              height: compact ? 26 : 30,
              borderRadius: 2,
              bgcolor: mode === 'dark'
                ? 'rgba(15, 23, 42, 0.5)'
                : 'rgba(255, 255, 255, 0.8)',
              fontSize: compact ? '0.72rem' : '0.78rem',
              '& fieldset': {
                borderColor: mode === 'dark'
                  ? 'rgba(71, 85, 105, 0.4)'
                  : 'rgba(226, 232, 240, 0.6)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#6366f1',
              },
            },
            '& .MuiOutlinedInput-input': {
              padding: compact ? '3px 6px' : '4px 8px',
            },
          }}
          slotProps={{
            input: {
              endAdornment: filterValue && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFilters(prev => ({ ...prev, [col.field]: '' }));
                    }}
                    sx={{ padding: 0, mr: 0.5 }}
                  >
                    <ClearIcon sx={{ fontSize: compact ? 14 : 16, color: '#6366f1' }} />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>
    );
  }, [filters, mode, compact]);

  const enhancedColumns = useMemo(() => {
    return columns.map((col) => {
      if (col.field === 'actions' || col.field === 'id') return col;
      return {
        ...col,
        renderHeader: () => renderHeader(col),
        flex: col.flex ?? 1,
      };
    });
  }, [columns, renderHeader]);

  return (
    <Paper
      sx={{
        width: '100%',
        overflow: 'hidden',
        animation: 'slideUp 0.5s ease',
        border: mode === 'dark'
          ? '1px solid rgba(71, 85, 105, 0.4)'
          : '1px solid rgba(226, 232, 240, 0.6)',
        boxShadow: mode === 'dark'
          ? '0 4px 20px rgba(0, 0, 0, 0.2)'
          : '0 4px 20px rgba(0, 0, 0, 0.04)',
      }}
    >
      {showToolbar && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 3,
            py: compact ? 1 : 1.5,
            borderBottom: mode === 'dark'
              ? '1px solid rgba(71, 85, 105, 0.4)'
              : '1px solid rgba(226, 232, 240, 0.6)',
            background: mode === 'dark'
              ? 'linear-gradient(to right, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95))'
              : 'linear-gradient(to right, rgba(248, 250, 252, 0.95), rgba(241, 245, 249, 0.95))',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {title && (
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {title}
              </Typography>
            )}
            <Box
              sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                bgcolor: mode === 'dark'
                  ? 'rgba(99, 102, 241, 0.15)'
                  : 'rgba(99, 102, 241, 0.1)',
                border: mode === 'dark'
                  ? '1px solid rgba(99, 102, 241, 0.2)'
                  : '1px solid rgba(99, 102, 241, 0.15)',
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#6366f1', fontSize: '0.85rem' }}>
                {filteredRows.length} {filteredRows.length === 1 ? 'registro' : 'registros'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                px: 2,
                py: compact ? 0.5 : 0.75,
                borderRadius: 3,
                bgcolor: mode === 'dark'
                  ? 'rgba(15, 23, 42, 0.6)'
                  : 'rgba(248, 250, 252, 0.8)',
                border: mode === 'dark'
                  ? '1px solid rgba(71, 85, 105, 0.4)'
                  : '1px solid rgba(226, 232, 240, 0.6)',
              }}
            >
              <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 18 }} />
              <TextField
                size="small"
                placeholder="Buscar en todo..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: compact ? 24 : 28,
                    '& fieldset': { border: 'none' },
                  },
                  '& .MuiOutlinedInput-input': {
                    padding: compact ? '2px 0' : '4px 0',
                    fontSize: '0.85rem',
                  },
                }}
              />
            </Box>

            {activeFilterCount > 0 && (
              <Tooltip title="Limpiar filtros">
                <IconButton
                  size="small"
                  onClick={clearAllFilters}
                  sx={{
                    color: '#6366f1',
                    bgcolor: mode === 'dark'
                      ? 'rgba(99, 102, 241, 0.15)'
                      : 'rgba(99, 102, 241, 0.1)',
                  }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      )}

      <Box sx={{ width: '100%', height: compact ? 'auto' : autoHeight ? 'auto' : 'calc(100vh - 280px)', minHeight: compact ? 200 : 400 }}>
        <DataGrid
          rows={filteredRows}
          columns={enhancedColumns}
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
              py: compact ? 0.5 : 1.5,
              transition: 'all 0.2s ease',
              fontSize: compact ? '0.78rem' : '0.9rem',
              minHeight: cellHeight,
              '&:hover': {
                bgcolor: mode === 'dark'
                  ? 'rgba(99, 102, 241, 0.08)'
                  : 'rgba(99, 102, 241, 0.04)',
              },
            },
            '& .MuiDataGrid-row': {
              '&:hover': {
                backgroundColor: mode === 'dark'
                  ? 'rgba(99, 102, 241, 0.08)'
                  : 'rgba(99, 102, 241, 0.04)',
              },
            },
            '& .MuiDataGrid-columnHeaders': {
              background: mode === 'dark'
                ? 'linear-gradient(to bottom, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95))'
                : 'linear-gradient(to bottom, rgba(248, 250, 252, 0.95), rgba(241, 245, 249, 0.95))',
              borderBottom: mode === 'dark'
                ? '2px solid rgba(71, 85, 105, 0.5)'
                : '2px solid rgba(226, 232, 240, 1)',
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: mode === 'dark'
                ? '1px solid rgba(71, 85, 105, 0.3)'
                : '1px solid rgba(241, 245, 249, 1)',
              bgcolor: mode === 'dark'
                ? 'rgba(15, 23, 42, 0.5)'
                : 'rgba(248, 250, 252, 0.5)',
              py: 1,
            },
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-cell:focus-within': {
              outline: 'none',
            },
            '& .MuiDataGrid-checkboxInput': {
              color: '#6366f1',
            },
            '& .MuiDataGrid-sortIcon': {
              color: '#6366f1',
            },
            '& .MuiDataGrid-menuIcon': {
              color: '#6366f1',
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
