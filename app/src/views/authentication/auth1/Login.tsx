import CardBox from 'src/components/shared/CardBox';

import AuthLogin from '../authforms/AuthLogin';

import FullLogo from 'src/layouts/full/shared/logo/FullLogo';

const Login = () => {
  return (
    <>
      <div className="relative overflow-hidden h-screen bg-lightprimary dark:bg-darkprimary">
        <div className="flex h-full justify-center items-center px-4">
          <CardBox className="md:w-[450px] w-full border-none">
            <div className="mx-auto mb-6">
              <FullLogo />
            </div>
            <AuthLogin />
          </CardBox>
        </div>
      </div>
    </>
  );
};

export default Login;
