import { useEffect, type ReactNode } from 'react';
import { Link } from 'react-router';
import ThemeToggle from 'src/components/shared/ThemeToggle';
import { LogoMark } from 'src/layouts/full/shared/logo/FullLogo';

interface AuthPageLayoutProps {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
}

const GridShape = () => (
  <>
    <div className="absolute right-0 top-0 -z-1 w-full max-w-[250px] xl:max-w-[450px]">
      <img src="/images/shape/grid-01.svg" alt="" />
    </div>
    <div className="absolute bottom-0 left-0 -z-1 w-full max-w-[250px] rotate-180 xl:max-w-[450px]">
      <img src="/images/shape/grid-01.svg" alt="" />
    </div>
  </>
);

// DESIGN.md §11: a copy of admin-ui's login - form on the left half, brand
// panel on the right half (lg+ only; below lg the form shows alone). No app
// chrome; the round theme toggle sits bottom-right (sm+).
const AuthPageLayout = ({ title, subtitle, children }: AuthPageLayoutProps) => {
  // Each auth view names its own browser tab (DESIGN.md §11.6 "Page titles").
  useEffect(() => {
    document.title = `${title} | Házmester`;
    return () => {
      document.title = 'Házmester';
    };
  }, [title]);

  return (
    <div className="light-auth-page relative z-1 p-6 sm:p-0">
      <div className="relative flex h-screen w-full flex-col justify-center lg:flex-row">
        <div className="flex w-full flex-1 flex-col lg:w-1/2">
          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
            <div className="mb-5 sm:mb-8">
              <h1 className="light-auth-title mb-2 text-[30px] font-semibold leading-[38px] sm:text-[36px] sm:leading-[44px]">
                {title}
              </h1>
              {subtitle && <p className="light-auth-subtitle text-sm">{subtitle}</p>}
            </div>
            {children}
          </div>
        </div>

        <div className="light-auth-panel hidden h-full w-full items-center lg:grid lg:w-1/2">
          <div className="relative z-1 flex items-center justify-center">
            <GridShape />
            <div className="flex max-w-xs flex-col items-center">
              <Link to="/" className="mb-4 flex items-center justify-center gap-3">
                <LogoMark width={48} height={43} className="text-white" />
                <span className="text-3xl font-normal text-white">Házmester</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};

export default AuthPageLayout;
