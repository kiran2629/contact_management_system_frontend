import { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { ModernLayout } from './ModernLayout';
import { SidebarLayout } from './SidebarLayout';
import { MinimalLayout } from './MinimalLayout';
import { BottomBarLayout } from './BottomBarLayout';
import { CommandBarLayout } from './CommandBarLayout';

interface LayoutRouterProps {
  children: ReactNode;
}

export const LayoutRouter = ({ children }: LayoutRouterProps) => {
  const { currentLayout } = useSelector((state: RootState) => state.layout);

  switch (currentLayout) {
    case 'sidebar':
      return <SidebarLayout>{children}</SidebarLayout>;
    case 'minimal':
      return <MinimalLayout>{children}</MinimalLayout>;
    case 'bottom':
      return <BottomBarLayout>{children}</BottomBarLayout>;
    case 'command':
      return <CommandBarLayout>{children}</CommandBarLayout>;
    case 'floating':
    default:
      return <ModernLayout>{children}</ModernLayout>;
  }
};

