'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, IconButton, Switch, FormControlLabel } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import 'github-markdown-css/github-markdown-light.css';

/**
 * 可编辑字段组件，支持 Markdown 和原始文本两种展示方式
 */
export default function EditableField({
  label,
  value,
  multiline = true,
  editing,
  onEdit,
  onChange,
  onSave,
  onCancel,
  onOptimize,
  tokenCount
}) {
  const { t } = useTranslation();
  const theme = useTheme();

  // 从 localStorage 读取 Markdown 展示设置，默认为 false
  const [useMarkdown, setUseMarkdown] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dataset-use-markdown');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });

  // 当 useMarkdown 状态改变时，保存到 localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dataset-use-markdown', JSON.stringify(useMarkdown));
    }
  }, [useMarkdown]);

  const toggleMarkdown = () => {
    setUseMarkdown(!useMarkdown);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mr: 1 }}>
          {label}
        </Typography>
        {!editing && value && (
          <>
            {/* 字符数标签 */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                borderRadius: '12px',
                bgcolor: 'info.50',
                color: 'info.main',
                px: 1,
                py: 0.25,
                fontSize: '0.75rem',
                fontWeight: 500,
                border: '1px solid',
                borderColor: 'info.100',
                mr: 1
              }}
            >
              {value.length} Characters
            </Box>

            {/* Token 标签 */}
            {tokenCount > 0 && (
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  borderRadius: '12px',
                  bgcolor: 'primary.50',
                  color: 'primary.main',
                  px: 1,
                  py: 0.25,
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  border: '1px solid',
                  borderColor: 'primary.100',
                  mr: 1
                }}
              >
                {tokenCount} Tokens
              </Box>
            )}
          </>
        )}
        {!editing && (
          <>
            <IconButton size="small" onClick={onEdit}>
              <EditIcon fontSize="small" />
            </IconButton>
            {onOptimize && (
              <IconButton size="small" onClick={onOptimize} sx={{ ml: 0.5 }}>
                <AutoFixHighIcon fontSize="small" />
              </IconButton>
            )}
            <FormControlLabel
              control={<Switch size="small" checked={useMarkdown} onChange={toggleMarkdown} sx={{ ml: 1 }} />}
              label={<Typography variant="caption">{useMarkdown ? 'Markdown' : 'Text'}</Typography>}
              sx={{ ml: 1 }}
            />
          </>
        )}
      </Box>
      {editing ? (
        <>
          <TextField
            fullWidth
            multiline={multiline}
            rows={10}
            value={value}
            onChange={onChange}
            variant="outlined"
            sx={{
              mb: 2,
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button variant="outlined" onClick={onCancel}>
              {t('common.cancel')}
            </Button>
            <Button variant="contained" onClick={onSave}>
              {t('common.save')}
            </Button>
          </Box>
        </>
      ) : (
        <Box
          sx={{
            p: 2,
            borderRadius: 1,
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
            '& img': {
              maxWidth: '100%'
            }
          }}
        >
          {value ? (
            useMarkdown ? (
              <div className="markdown-body">
                <ReactMarkdown>{value}</ReactMarkdown>
              </div>
            ) : (
              <Typography variant="body1">{value}</Typography>
            )
          ) : (
            <Typography variant="body2" color="text.secondary">
              {t('common.noData')}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}
