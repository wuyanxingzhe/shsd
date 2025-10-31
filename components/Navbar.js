'use client';

import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  MenuItem,
  FormControl,
  Select,
  Tabs,
  Tab,
  IconButton,
  useTheme as useMuiTheme,
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import ModelSelect from './ModelSelect';
import LanguageSwitcher from './LanguageSwitcher';
import UpdateChecker from './UpdateChecker';
import TaskIcon from './TaskIcon';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

// 图标
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import StorageIcon from '@mui/icons-material/Storage';
import GitHubIcon from '@mui/icons-material/GitHub';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import TokenOutlinedIcon from '@mui/icons-material/TokenOutlined';
import QuestionAnswerOutlinedIcon from '@mui/icons-material/QuestionAnswerOutlined';
import DatasetOutlinedIcon from '@mui/icons-material/DatasetOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ChatIcon from '@mui/icons-material/Chat';
import { toast } from 'sonner';
import axios from 'axios';
import { useSetAtom } from 'jotai/index';
import { modelConfigListAtom, selectedModelInfoAtom } from '@/lib/store';

export default function Navbar({ projects = [], currentProject }) {
  const [selectedProject, setSelectedProject] = useState(currentProject || '');
  const { t, i18n } = useTranslation();
  const pathname = usePathname();
  const theme = useMuiTheme();
  const { resolvedTheme, setTheme } = useTheme();
  const setConfigList = useSetAtom(modelConfigListAtom);
  const setSelectedModelInfo = useSetAtom(selectedModelInfoAtom);
  // 只在项目详情页显示模块选项卡
  const isProjectDetail = pathname.includes('/projects/') && pathname.split('/').length > 3;
  // 更多菜单状态
  const [moreMenuAnchor, setMoreMenuAnchor] = useState(null);
  const isMoreMenuOpen = Boolean(moreMenuAnchor);

  // 数据集菜单状态
  const [datasetMenuAnchor, setDatasetMenuAnchor] = useState(null);
  const isDatasetMenuOpen = Boolean(datasetMenuAnchor);

  // 处理更多菜单打开
  const handleMoreMenuOpen = event => {
    setMoreMenuAnchor(event.currentTarget);
  };

  // 处理更多菜单悬浮打开
  const handleMoreMenuHover = event => {
    setMoreMenuAnchor(event.currentTarget);
  };

  // 关闭更多菜单
  const handleMoreMenuClose = () => {
    setMoreMenuAnchor(null);
  };

  // 处理菜单区域的鼠标离开
  const handleMenuMouseLeave = () => {
    setMoreMenuAnchor(null);
  };

  // 处理数据集菜单悬浮打开
  const handleDatasetMenuHover = event => {
    setDatasetMenuAnchor(event.currentTarget);
  };

  // 关闭数据集菜单
  const handleDatasetMenuClose = () => {
    setDatasetMenuAnchor(null);
  };

  // 处理数据集菜单区域的鼠标离开
  const handleDatasetMenuMouseLeave = () => {
    setDatasetMenuAnchor(null);
  };

  const handleProjectChange = event => {
    const newProjectId = event.target.value;
    setSelectedProject(newProjectId);
    axios
      .get(`/api/projects/${newProjectId}/model-config`)
      .then(response => {
        setConfigList(response.data.data);
        if (response.data.defaultModelConfigId) {
          setSelectedModelInfo(response.data.data.find(item => item.id === response.data.defaultModelConfigId));
        } else {
          setSelectedModelInfo('');
        }
      })
      .catch(error => {
        toast.error('get model list error');
      });
    // 跳转到新选择的项目页面
    window.location.href = `/projects/${newProjectId}/text-split`;
  };

  const toggleTheme = () => {
    // 主题切换逻辑：支持默认主题和Vibrant主题，同时保留明暗模式
    // 解析当前主题信息
    const parts = resolvedTheme.split('-');
    let currentMode = 'light';
    let currentTheme = 'default';
    
    if (parts.length === 2) {
      if (['light', 'dark'].includes(parts[0])) {
        currentMode = parts[0];
        currentTheme = parts[1];
      } else {
        currentTheme = parts[0];
        currentMode = parts[1];
      }
    } else if (['light', 'dark'].includes(resolvedTheme)) {
      currentMode = resolvedTheme;
    } else {
      currentTheme = resolvedTheme;
    }
    
    // 切换主题：先在default和vibrant之间切换，然后是明暗模式
    const themes = ['default', 'vibrant'];
    const currentThemeIndex = themes.indexOf(currentTheme);
    const nextTheme = themes[(currentThemeIndex + 1) % themes.length];
    
    // 设置新主题，保留当前模式
    setTheme(`${nextTheme}-${currentMode}`);
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        borderBottom: `1px solid ${theme.palette.divider}`,
        bgcolor: theme.palette.background.paper,
        backdropFilter: 'blur(10px)',
        backgroundColor: theme.palette.mode === 'dark' 
          ? 'rgba(17, 24, 39, 0.95)' 
          : 'rgba(255, 255, 255, 0.95)'
      }}
      style={{ zIndex: 99000 }}
    >
      <Toolbar
        sx={{
          height: '56px',
          minHeight: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
        style={{ zIndex: 99000 }}
      >
        {/* 左侧Logo和项目选择 */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 0 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mr: 2,
              '&:hover': { opacity: 0.9 }
            }}
            style={{ cursor: 'pointer', '&:hover': { opacity: 0.9 } }}
            onClick={() => {
              window.location.href = '/';
            }}
          >
            <Box
              component="img"
              src="/imgs/logo.png"
              alt="Triple Harmony Entropy Motion Logo"
              sx={{
                width: 36,
                height: 36,
                mr: 1.5,
                borderRadius: 1,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease'
              }}
            />
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 700,
                letterSpacing: '-0.5px',
                fontSize: '1.1rem',
                background: theme.palette.mode === 'dark' 
                  ? 'linear-gradient(90deg, #6366f1, #8b5cf6)' 
                  : 'linear-gradient(90deg, #4f46e5, #7c3aed)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textFillColor: 'transparent',
                display: 'inline-block'
              }}
            >
              Triple Harmony Entropy Motion
            </Typography>
          </Box>

          {isProjectDetail && (
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <Select
                value={selectedProject}
                onChange={handleProjectChange}
                displayEmpty
                variant="outlined"
                sx={{
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  color: theme.palette.mode === 'dark' ? 'inherit' : 'white',
                  '& .MuiSelect-icon': {
                    color: theme.palette.mode === 'dark' ? 'inherit' : 'white'
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'transparent'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'transparent'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main'
                  }
                }}
                MenuProps={{
                  PaperProps: {
                    elevation: 2,
                    sx: { mt: 1, borderRadius: 2 }
                  }
                }}
              >
                <MenuItem value="" disabled>
                  {t('projects.selectProject')}
                </MenuItem>
                {projects.map(project => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>

        {/* 中间的功能模块导航 - 使用Flex布局居中 */}
        {isProjectDetail && (
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', ml: 2, mr: 2 }}>
            <Tabs
              value={
                pathname.includes('/settings') || pathname.includes('/playground') || pathname.includes('/datasets-sq')
                  ? 'more'
                  : pathname.includes('/datasets') || pathname.includes('/multi-turn')
                    ? 'datasets'
                    : pathname
              }
              TabIndicatorProps={{
                style: {
                  backgroundColor: theme.palette.primary.main,
                  height: 3,
                  borderRadius: 1.5,
                  marginBottom: 1
                }
              }}
              sx={{
                '& .MuiTab-root': {
                  minWidth: 120,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  color: theme.palette.text.secondary,
                  padding: '8px 16px',
                  minHeight: '48px',
                  '&:hover': {
                    color: theme.palette.primary.main,
                    bgcolor: theme.palette.mode === 'dark' 
                      ? 'rgba(99, 102, 241, 0.1)' 
                      : 'rgba(99, 102, 241, 0.08)'
                  }
                },
                '& .Mui-selected': {
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                  bgcolor: theme.palette.mode === 'dark' 
                    ? 'rgba(99, 102, 241, 0.08)' 
                    : 'rgba(99, 102, 241, 0.05)'
                }
              }}
            >
              <Tab
                icon={
                  <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                    <DescriptionOutlinedIcon fontSize="small" />
                  </Box>
                }
                iconPosition="start"
                label={t('textSplit.title')}
                value={`/projects/${selectedProject}/text-split`}
                component={Link}
                href={`/projects/${selectedProject}/text-split`}
              />
              <Tab
                icon={
                  <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                    <TokenOutlinedIcon fontSize="small" />
                  </Box>
                }
                iconPosition="start"
                label={t('distill.title')}
                value={`/projects/${selectedProject}/distill`}
                component={Link}
                href={`/projects/${selectedProject}/distill`}
              />
              <Tab
                icon={
                  <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                    <QuestionAnswerOutlinedIcon fontSize="small" />
                  </Box>
                }
                iconPosition="start"
                label={t('questions.title')}
                value={`/projects/${selectedProject}/questions`}
                component={Link}
                href={`/projects/${selectedProject}/questions`}
              />
              <Tab
                icon={
                  <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                    <ArrowDropDownIcon fontSize="small" sx={{ ml: 0.5 }} />
                  </Box>
                }
                iconPosition="start"
                label={t('datasets.management')}
                value="datasets"
                onMouseEnter={handleDatasetMenuHover}
              />
              <Tab
                icon={
                  <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                    <ArrowDropDownIcon fontSize="small" sx={{ ml: 0.5 }} />
                  </Box>
                }
                iconPosition="start"
                label={t('common.more')}
                onMouseEnter={handleMoreMenuHover}
                value="more"
              />
            </Tabs>
          </Box>
        )}

        {/* 数据集菜单 */}
        <Menu
          anchorEl={datasetMenuAnchor}
          open={isDatasetMenuOpen}
          onClose={handleDatasetMenuClose}
          PaperProps={{
            elevation: 2,
            sx: { mt: 1.5, borderRadius: 2, minWidth: 200 },
            onMouseLeave: handleDatasetMenuMouseLeave
          }}
          transformOrigin={{ horizontal: 'center', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
          MenuListProps={{
            dense: true,
            onMouseLeave: handleDatasetMenuMouseLeave
          }}
        >
          <MenuItem
            component={Link}
            href={`/projects/${selectedProject}/datasets`}
            onClick={handleDatasetMenuClose}
            selected={pathname === `/projects/${selectedProject}/datasets`}
          >
            <ListItemIcon>
              <DatasetOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={t('datasets.singleTurn', '单轮问答数据集')} />
          </MenuItem>
          <MenuItem
            component={Link}
            href={`/projects/${selectedProject}/multi-turn`}
            onClick={handleDatasetMenuClose}
            selected={pathname === `/projects/${selectedProject}/multi-turn`}
          >
            <ListItemIcon>
              <ChatIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={t('datasets.multiTurn', '多轮对话数据集')} />
          </MenuItem>
        </Menu>

        {/* 更多菜单 */}
        <Menu
          anchorEl={moreMenuAnchor}
          open={isMoreMenuOpen}
          onClose={handleMoreMenuClose}
          PaperProps={{
            elevation: 2,
            sx: { mt: 1.5, borderRadius: 2, minWidth: 180 },
            onMouseLeave: handleMenuMouseLeave
          }}
          transformOrigin={{ horizontal: 'center', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
          MenuListProps={{
            dense: true,
            onMouseLeave: handleMenuMouseLeave
          }}
        >
          <MenuItem
            component={Link}
            href={`/projects/${selectedProject}/settings`}
            onClick={handleMoreMenuClose}
            selected={pathname === `/projects/${selectedProject}/settings`}
          >
            <ListItemIcon>
              <SettingsOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={t('settings.title')} />
          </MenuItem>
          <Divider />
          <MenuItem
            component={Link}
            href={`/projects/${selectedProject}/playground`}
            onClick={handleMoreMenuClose}
            selected={pathname === `/projects/${selectedProject}/playground`}
          >
            <ListItemIcon>
              <ScienceOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={t('playground.title')} />
          </MenuItem>
          <Divider />
          <MenuItem
            component={Link}
            href="/dataset-square"
            onClick={handleMoreMenuClose}
            selected={pathname === `/dataset-square`}
          >
            <ListItemIcon>
              <StorageIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={t('datasetSquare.title')} />
          </MenuItem>
        </Menu>

        {/* 右侧的操作区 - 从右到左排列 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* 模型选择 */}
          {location.pathname.includes('/projects/') && <ModelSelect projectId={selectedProject} />}
          {/* 任务图标 - 仅在项目页面显示 */}
          {location.pathname.includes('/projects/') && <TaskIcon theme={theme} projectId={selectedProject} />}

          {/* 语言切换器 */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LanguageSwitcher />
          </Box>
          {/* 主题切换按钮 - 现代化设计 */}
          <Tooltip title={`切换到${resolvedTheme.includes('vibrant') ? '默认' : 'Vibrant'}主题`}>
            <IconButton
              onClick={toggleTheme}
              size="small"
              sx={{
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                color: theme.palette.text.secondary,
                p: 1.2,
                borderRadius: '50%',
                minWidth: 36,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  bgcolor: theme.palette.primary.main,
                  color: 'white',
                  transform: 'scale(1.05)'
                }
              }}
            >
              {resolvedTheme === 'dark' ? (
                <LightModeOutlinedIcon fontSize="small" />
              ) : (
                <DarkModeOutlinedIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>

          {/* 用户头像按钮 - 现代化设计 */}
          <Tooltip title={t('userProfile') || '个人中心'}>
            <IconButton
              size="small"
              sx={{
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                color: theme.palette.primary.main,
                p: 1.2,
                borderRadius: '50%',
                minWidth: 36,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  bgcolor: theme.palette.primary.main,
                  color: 'white',
                  transform: 'scale(1.05)'
                }
              }}
            >
              <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: theme.palette.primary.main, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ color: 'white', fontSize: '0.75rem', fontWeight: 600 }}>TH</Typography>
              </Box>
            </IconButton>
          </Tooltip>

          {/* 更新检查器 */}
          <UpdateChecker />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
