import './globals.css';
import ThemeRegistry from '@/components/ThemeRegistry';
import I18nProvider from '@/components/I18nProvider';
import { Toaster } from 'sonner';
import { Provider } from 'jotai';

export const metadata = {
  title: 'Triple Harmony Entropy Motion',
  description: '一个强大的 LLM 数据集生成工具',
  icons: {
    icon: '/imgs/shsd_logo.png',
    apple: '/imgs/shsd_logo.png',
    shortcut: '/imgs/shsd_logo.png'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Provider>
          <ThemeRegistry>
            <I18nProvider>
              {children}
              <Toaster richColors position="top-center" />
            </I18nProvider>
          </ThemeRegistry>
        </Provider>
      </body>
    </html>
  );
}
