import { Link } from 'react-router';
import { LogoMark } from './FullLogo';

const Logo = () => {
  return (
    <Link to={'/'}>
      <LogoMark width={32} height={29} className="text-[#153CAA] dark:text-white" />
    </Link>
  );
};

export default Logo;
