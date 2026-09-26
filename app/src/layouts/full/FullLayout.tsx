import { FC } from 'react';
import { Outlet } from 'react-router';
import Sidebar from './vertical/sidebar/Sidebar';
import Header from './vertical/header/Header';
import { SidebarStateProvider, useSidebarState } from './SidebarState';

const Shell = () => {
  const { isRail } = useSidebarState();

  return (
    <>
      <div className="flex w-full min-h-screen">
        <div className={`page-wrapper flex w-full ${isRail ? 'page-wrapper-rail' : ''}`}>
          {/* Header/sidebar */}
          <div className="xl:block hidden">
            <Sidebar />
          </div>
          <div className="body-wrapper w-full bg-background dark:bg-transparent">
            {/* Top Header  */}
            <Header />

            {/* Body Content  */}
            <div className={'container mx-auto px-6 py-30'}>
              <main className="grow">
                <Outlet />
              </main>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const FullLayout: FC = () => (
  <SidebarStateProvider>
    <Shell />
  </SidebarStateProvider>
);

export default FullLayout;
