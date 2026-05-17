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
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
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

  const cellHeight = compact ? 36 : 48;

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
            fontSize: compact ? '0.62rem' : '0.68rem',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: mode === 'dark' ? '#8b90a8' : '#7c8098',
            mb: 0.75,
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
              height: compact ? 26 : 28,
              borderRadius: '7px',
              bgcolor: mode === 'dark' ? 'rgba(13, 15, 26, 0.5)' : 'rgba(255, 255, 255, 0.8)',
              fontSize: compact ? '0.72rem' : '0.76rem',
              '& fieldset': {
                borderColor: mode === 'dark' ? 'rgba(38, 42, 64, 0.6)' : 'rgba(228, 230, 239, 0.8)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#6c5ce7',
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
                    <ClearIcon sx={{ fontSize: compact ? 14 : 15, color: '#6c5ce7' }} />
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
        animation: 'slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
        border: `1px solid ${mode === 'dark' ? '#262a40' : '#e4e6ef'}`,
        bgcolor: mode === 'dark' ? '#151828' : '#ffffff',
        boxShadow: mode === 'dark'
          ? '0 1px 3px rgba(0, 0, 0, 0.15)'
          : '0 1px 3px rgba(0, 0, 0, 0.04)',
      }}
    >
      {showToolbar && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2.5,
            py: compact ? 1 : 1.5,
            borderBottom: `1px solid ${mode === 'dark' ? '#262a40' : '#e4e6ef'}`,
            bgcolor: mode === 'dark' ? 'rgba(13, 15, 26, 0.4)' : 'rgba(247, 248, 252, 0.6)',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {title && (
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  letterSpacing: '-0.02em',
                }}
              >
                {title}
              </Typography>
            )}
            <Box
              sx={{
                px: 1.25,
                py: 0.375,
                borderRadius: '6px',
                bgcolor: mode === 'dark' ? 'rgba(108, 92, 231, 0.12)' : 'rgba(108, 92, 231, 0.07)',
                border: `1px solid ${mode === 'dark' ? 'rgba(108, 92, 231, 0.2)' : 'rgba(108, 92, 231, 0.12)'}`,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: mode === 'dark' ? '#a78bfa' : '#6c5ce7',
                  fontSize: '0.72rem',
                }}
              >
                {filteredRows.length} {filteredRows.length === 1 ? 'registro' : 'registros'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                px: 1.5,
                py: compact ? 0.5 : 0.625,
                borderRadius: '8px',
                bgcolor: mode === 'dark' ? 'rgba(13, 15, 26, 0.5)' : 'rgba(240, 241, 245, 0.6)',
                border: `1px solid ${mode === 'dark' ? 'rgba(38, 42, 64, 0.5)' : 'rgba(228, 230, 239, 0.6)'}`,
              }}
            >
              <SearchIcon sx={{ color: mode === 'dark' ? '#8b90a8' : '#7c8098', mr: 1, fontSize: 16 }} />
              <TextField
                size="small"
                placeholder="Buscar en todo..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: compact ? 22 : 26,
                    '& fieldset': { border: 'none' },
                  },
                  '& .MuiOutlinedInput-input': {
                    padding: compact ? '2px 0' : '3px 0',
                    fontSize: '0.82rem',
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
                    width: 32,
                    height: 32,
                    color: mode === 'dark' ? '#a78bfa' : '#6c5ce7',
                    bgcolor: mode === 'dark' ? 'rgba(108, 92, 231, 0.1)' : 'rgba(108, 92, 231, 0.06)',
                    '&:hover': {
                      bgcolor: mode === 'dark' ? 'rgba(108, 92, 231, 0.18)' : 'rgba(108, 92, 231, 0.1)',
                    },
                  }}
                >
                  <FilterListOffIcon sx={{ fontSize: '1rem' }} />
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
            fontFamily: '"Plus Jakarta Sans", "Source Sans 3", sans-serif',
            '& .MuiDataGrid-cell': {
              borderBottom: `1px solid ${mode === 'dark' ? 'rgba(38, 42, 64, 0.5)' : 'rgba(240, 241, 245, 1)'}`,
              py: compact ? 0.5 : 1.25,
              transition: 'background-color 0.2s ease',
              fontSize: compact ? '0.78rem' : '0.85rem',
              minHeight: cellHeight,
              fontWeight: 400,
              '&:hover': {
                bgcolor: mode === 'dark' ? 'rgba(108, 92, 231, 0.05)' : 'rgba(108, 92, 231, 0.02)',
              },
            },
            '& .MuiDataGrid-row': {
              '&:hover': {
                backgroundColor: mode === 'dark' ? 'rgba(108, 92, 231, 0.05)' : 'rgba(108, 92, 231, 0.02)',
              },
            },
            '& .MuiDataGrid-columnHeaders': {
              background: mode === 'dark'
                ? 'linear-gradient(to bottom, rgba(21, 24, 40, 0.95), rgba(13, 15, 26, 0.95))'
                : 'linear-gradient(to bottom, rgba(247, 248, 252, 0.95), rgba(240, 241, 245, 0.95))',
              borderBottom: `1.5px solid ${mode === 'dark' ? '#262a40' : '#e4e6ef'}`,
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: `1px solid ${mode === 'dark' ? 'rgba(38, 42, 64, 0.5)' : 'rgba(240, 241, 245, 1)'}`,
              bgcolor: mode === 'dark' ? 'rgba(13, 15, 26, 0.3)' : 'rgba(247, 248, 252, 0.3)',
              py: 0.75,
            },
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-cell:focus-within': {
              outline: 'none',
            },
            '& .MuiDataGrid-checkboxInput': {
              color: mode === 'dark' ? '#8b90a8' : '#7c8098',
            },
            '& .MuiDataGrid-sortIcon': {
              color: mode === 'dark' ? '#8b90a8' : '#7c8098',
            },
            '& .MuiDataGrid-menuIcon': {
              color: mode === 'dark' ? '#8b90a8' : '#7c8098',
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
