'use client';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider as NextThemeProvider, useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

// 导入字体
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';

// 创建默认主题配置
const getDefaultTheme = mode => {
  // 主色调
  const mainBlue = '#2A5CAA';
  const darkGray = '#2D2D2D';

  // 辅助色 - 数据可视化色谱
  const dataVizColors = [
    '#6366F1', // 紫蓝色
    '#10B981', // 绿色
    '#F59E0B', // 琥珀色
    '#EC4899', // 粉色
    '#8B5CF6', // 紫色
    '#3B82F6' // 蓝色
  ];

  // 状态色
  const successColor = '#10B981'; // 翡翠绿
  const warningColor = '#F59E0B'; // 琥珀色
  const errorColor = '#EF4444'; // 珊瑚红

  // 渐变色
  const gradientPrimary = 'linear-gradient(90deg, #2A5CAA 0%, #8B5CF6 100%)';

  // 根据模式调整颜色
  return createTheme({
    palette: {
      mode,
      primary: {
        main: mainBlue,
        dark: '#1E4785',
        light: '#4878C6',
        contrastText: '#FFFFFF'
      },
      secondary: {
        main: '#8B5CF6',
        dark: '#7039F2',
        light: '#A78BFA',
        contrastText: '#FFFFFF'
      },
      error: {
        main: errorColor,
        dark: '#DC2626',
        light: '#F87171'
      },
      warning: {
        main: warningColor,
        dark: '#D97706',
        light: '#FBBF24'
      },
      success: {
        main: successColor,
        dark: '#059669',
        light: '#34D399'
      },
      background: {
        default: mode === 'dark' ? '#121212' : '#F8F9FA',
        paper: mode === 'dark' ? '#1E1E1E' : '#FFFFFF',
        subtle: mode === 'dark' ? '#2A2A2A' : '#F3F4F6'
      },
      text: {
        primary: mode === 'dark' ? '#F3F4F6' : darkGray,
        secondary: mode === 'dark' ? '#9CA3AF' : '#6B7280',
        disabled: mode === 'dark' ? '#4B5563' : '#9CA3AF'
      },
      divider: mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
      dataViz: dataVizColors,
      gradient: {
        primary: gradientPrimary
      }
    },
    typography: {
      fontFamily:
        '"Inter", "HarmonyOS Sans", "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      fontSize: 14,
      fontWeightLight: 300,
      fontWeightRegular: 400,
      fontWeightMedium: 500,
      fontWeightBold: 600,
      h1: {
        fontSize: '2rem', // 32px
        fontWeight: 600,
        lineHeight: 1.2,
        letterSpacing: '-0.01em'
      },
      h2: {
        fontSize: '1.5rem', // 24px
        fontWeight: 600,
        lineHeight: 1.3,
        letterSpacing: '-0.005em'
      },
      h3: {
        fontSize: '1.25rem', // 20px
        fontWeight: 600,
        lineHeight: 1.4
      },
      h4: {
        fontSize: '1.125rem', // 18px
        fontWeight: 600,
        lineHeight: 1.4
      },
      h5: {
        fontSize: '1rem', // 16px
        fontWeight: 600,
        lineHeight: 1.5
      },
      h6: {
        fontSize: '0.875rem', // 14px
        fontWeight: 600,
        lineHeight: 1.5
      },
      body1: {
        fontSize: '1rem', // 16px
        lineHeight: 1.5
      },
      body2: {
        fontSize: '0.875rem', // 14px
        lineHeight: 1.5
      },
      caption: {
        fontSize: '0.75rem', // 12px
        lineHeight: 1.5
      },
      code: {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '0.875rem'
      }
    },
    shape: {
      borderRadius: 8
    },
    spacing: 8, // 基础间距单位为8px
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarWidth: 'thin',
            scrollbarColor: mode === 'dark' ? '#4B5563 transparent' : '#9CA3AF transparent',
            '&::-webkit-scrollbar': {
              width: '8px',
              height: '8px'
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent'
            },
            '&::-webkit-scrollbar-thumb': {
              background: mode === 'dark' ? '#4B5563' : '#9CA3AF',
              borderRadius: '4px'
            }
          },
          // 确保代码块使用 JetBrains Mono 字体
          'code, pre': {
            fontFamily: '"JetBrains Mono", monospace'
          },
          // 自定义渐变文本的通用样式
          '.gradient-text': {
            background: gradientPrimary,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textFillColor: 'transparent'
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            borderRadius: '8px',
            padding: '6px 16px'
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)'
            }
          },
          containedPrimary: {
            background: mainBlue,
            '&:hover': {
              backgroundColor: '#1E4785'
            }
          },
          containedSecondary: {
            background: '#8B5CF6',
            '&:hover': {
              backgroundColor: '#7039F2'
            }
          },
          outlined: {
            borderWidth: '1.5px',
            '&:hover': {
              borderWidth: '1.5px'
            }
          }
        }
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            background: mode === 'dark' ? '#1A1A1A' : mainBlue
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            boxShadow: mode === 'dark' ? '0px 4px 8px rgba(0, 0, 0, 0.4)' : '0px 4px 8px rgba(0, 0, 0, 0.05)'
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: '12px'
          }
        }
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: '6px',
            fontWeight: 500
          }
        }
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-head': {
              fontWeight: 600,
              backgroundColor: mode === 'dark' ? '#2A2A2A' : '#F3F4F6'
            }
          }
        }
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            height: '3px',
            borderRadius: '3px 3px 0 0'
          }
        }
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            '&.Mui-selected': {
              fontWeight: 600
            }
          }
        }
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: '8px'
          }
        }
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            fontSize: '1.25rem',
            fontWeight: 600
          }
        }
      }
    }
  });
};

// 创建全新的Vibrant主题配置
const getVibrantTheme = mode => {
  // 主色调 - 全新的颜色方案
  const mainPurple = '#7C3AED';
  const darkPurple = '#6D28D9';
  const lightPurple = '#A78BFA';

  // 辅助色 - 更加鲜艳的数据可视化色谱
  const dataVizColors = [
    '#EC4899', // 粉红色
    '#F97316', // 橙红色
    '#10B981', // 绿色
    '#3B82F6', // 蓝色
    '#8B5CF6', // 紫色
    '#F59E0B'  // 琥珀色
  ];

  // 状态色 - 更加明显的对比
  const successColor = '#22C55E'; // 亮绿色
  const warningColor = '#F59E0B'; // 琥珀色
  const errorColor = '#EF4444';   // 红色

  // 渐变色 - 更加鲜艳的渐变
  const gradientPrimary = 'linear-gradient(90deg, #7C3AED 0%, #EC4899 100%)';

  // 根据模式调整颜色
  return createTheme({
    palette: {
      mode,
      primary: {
        main: mainPurple,
        dark: darkPurple,
        light: lightPurple,
        contrastText: '#FFFFFF'
      },
      secondary: {
        main: '#EC4899',
        dark: '#DB2777',
        light: '#F472B6',
        contrastText: '#FFFFFF'
      },
      error: {
        main: errorColor,
        dark: '#DC2626',
        light: '#F87171'
      },
      warning: {
        main: warningColor,
        dark: '#D97706',
        light: '#FBBF24'
      },
      success: {
        main: successColor,
        dark: '#16A34A',
        light: '#4ADE80'
      },
      background: {
        default: mode === 'dark' ? '#0F172A' : '#F8FAFC',
        paper: mode === 'dark' ? '#1E293B' : '#FFFFFF',
        subtle: mode === 'dark' ? '#334155' : '#F1F5F9'
      },
      text: {
        primary: mode === 'dark' ? '#F8FAFC' : '#1E293B',
        secondary: mode === 'dark' ? '#94A3B8' : '#64748B',
        disabled: mode === 'dark' ? '#475569' : '#94A3B8'
      },
      divider: mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
      dataViz: dataVizColors,
      gradient: {
        primary: gradientPrimary
      }
    },
    typography: {
      fontFamily:
        '"Inter", "HarmonyOS Sans", "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      fontSize: 14,
      fontWeightLight: 300,
      fontWeightRegular: 400,
      fontWeightMedium: 500,
      fontWeightBold: 700, // 加粗
      h1: {
        fontSize: '2.5rem', // 40px (更大)
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: '-0.02em'
      },
      h2: {
        fontSize: '2rem', // 32px (更大)
        fontWeight: 700,
        lineHeight: 1.3,
        letterSpacing: '-0.01em'
      },
      h3: {
        fontSize: '1.5rem', // 24px (更大)
        fontWeight: 700,
        lineHeight: 1.4
      },
      h4: {
        fontSize: '1.25rem', // 20px
        fontWeight: 700,
        lineHeight: 1.4
      },
      h5: {
        fontSize: '1.125rem', // 18px
        fontWeight: 600,
        lineHeight: 1.5
      },
      h6: {
        fontSize: '1rem', // 16px
        fontWeight: 600,
        lineHeight: 1.5
      },
      body1: {
        fontSize: '1rem', // 16px
        lineHeight: 1.6, // 增加行高
        fontWeight: 400
      },
      body2: {
        fontSize: '0.875rem', // 14px
        lineHeight: 1.6,
        fontWeight: 400
      },
      caption: {
        fontSize: '0.75rem', // 12px
        lineHeight: 1.5
      },
      code: {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '0.875rem'
      }
    },
    shape: {
      borderRadius: 12 // 更大的圆角
    },
    spacing: 8, // 基础间距单位为8px
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarWidth: 'thin',
            scrollbarColor: mode === 'dark' ? '#475569 transparent' : '#CBD5E1 transparent',
            '&::-webkit-scrollbar': {
              width: '10px',
              height: '10px'
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
              borderRadius: '5px'
            },
            '&::-webkit-scrollbar-thumb': {
              background: mode === 'dark' ? '#475569' : '#CBD5E1',
              borderRadius: '5px',
              border: '2px solid transparent',
              backgroundClip: 'padding-box'
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: mode === 'dark' ? '#64748B' : '#94A3B8',
              backgroundClip: 'padding-box'
            }
          },
          // 确保代码块使用 JetBrains Mono 字体
          'code, pre': {
            fontFamily: '"JetBrains Mono", monospace'
          },
          // 自定义渐变文本的通用样式 - 新渐变
          '.gradient-text': {
            background: gradientPrimary,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textFillColor: 'transparent',
            fontWeight: 700
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '12px',
            padding: '8px 20px',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          },
          contained: {
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            '&:hover': {
              boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
              transform: 'translateY(-1px)'
            },
            '&:active': {
              transform: 'translateY(0)'
            }
          },
          containedPrimary: {
            background: mainPurple,
            '&:hover': {
              backgroundColor: darkPurple,
              boxShadow: '0 6px 12px rgba(124, 58, 237, 0.3)'
            }
          },
          containedSecondary: {
            background: '#EC4899',
            '&:hover': {
              backgroundColor: '#DB2777',
              boxShadow: '0 6px 12px rgba(236, 72, 153, 0.3)'
            }
          },
          outlined: {
            borderWidth: '2px',
            '&:hover': {
              borderWidth: '2px',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }
          }
        }
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            background: mode === 'dark' ? '#1E293B' : mainPurple,
            borderRadius: '0 0 16px 16px'
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '16px',
            boxShadow: mode === 'dark' ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 8px 32px rgba(0, 0, 0, 0.08)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: mode === 'dark' ? '0 12px 40px rgba(0, 0, 0, 0.4)' : '0 12px 40px rgba(0, 0, 0, 0.12)'
            }
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
          }
        }
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            fontWeight: 600,
            padding: '2px 4px',
            height: '32px',
            fontSize: '0.875rem'
          }
        }
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-head': {
              fontWeight: 700,
              backgroundColor: mode === 'dark' ? '#334155' : '#F1F5F9',
              color: mode === 'dark' ? '#F8FAFC' : '#1E293B'
            }
          }
        }
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            height: '4px',
            borderRadius: '4px 4px 0 0',
            backgroundColor: mainPurple
          }
        }
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '1rem',
            padding: '12px 24px',
            '&.Mui-selected': {
              fontWeight: 700,
              color: mode === 'dark' ? lightPurple : darkPurple
            }
          }
        }
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            margin: '4px 0',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'translateX(4px)',
              backgroundColor: mode === 'dark' ? 'rgba(124, 58, 237, 0.1)' : 'rgba(124, 58, 237, 0.05)'
            }
          }
        }
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            fontSize: '1.5rem',
            fontWeight: 700,
            padding: '24px'
          }
        }
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: '20px'
          }
        }
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: '8px',
            padding: '10px 12px',
            fontSize: '0.875rem',
            fontWeight: 500,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }
        }
      }
    }
  });
};

// 主主题获取函数，支持多种主题
const getTheme = (resolvedTheme) => {
  // 从主题名称中解析出主题类型和模式
  // 格式: [themeType]-[mode] 或 [mode] 或 [themeType]
  let themeType = 'default';
  let mode = 'light';
  
  if (resolvedTheme.includes('-')) {
    const parts = resolvedTheme.split('-');
    if (['light', 'dark'].includes(parts[0])) {
      mode = parts[0];
      themeType = parts[1] || 'default';
    } else {
      themeType = parts[0];
      mode = parts[1] || 'light';
    }
  } else if (['light', 'dark'].includes(resolvedTheme)) {
    mode = resolvedTheme;
  } else {
    themeType = resolvedTheme;
  }
  
  // 根据主题类型返回对应的主题配置
  switch (themeType) {
    case 'vibrant':
      return getVibrantTheme(mode);
    case 'default':
    default:
      return getDefaultTheme(mode);
  }
};

export default function ThemeRegistry({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <NextThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <InnerThemeRegistry>{children}</InnerThemeRegistry>
    </NextThemeProvider>
  );
}

function InnerThemeRegistry({ children }) {
  const { resolvedTheme } = useTheme();
  const theme = getTheme(resolvedTheme);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
