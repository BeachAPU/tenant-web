import { forwardRef, useState, type ComponentProps } from 'react';
import { EyeCloseIcon, EyeIcon } from 'src/icons';
import { AuthInput } from './AuthFormParts';

// DESIGN.md §11.5: sign-in password field with a 20px eye toggle inside,
// 16px from the right edge (crossed-out eye while hidden, open while
// visible), using admin's EyeCloseIcon / EyeIcon (§12).
const PasswordInput = forwardRef<HTMLInputElement, Omit<ComponentProps<typeof AuthInput>, 'type'>>(
  ({ className = '', ...props }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <div className="relative">
        <AuthInput ref={ref} type={visible ? 'text' : 'password'} className={`pr-11 ${className}`} {...props} />
        <button
          type="button"
          tabIndex={-1}
          aria-label={visible ? 'Hide password' : 'Show password'}
          onClick={() => setVisible((v) => !v)}
          className="light-auth-eye absolute right-4 top-1/2 z-30 -translate-y-1/2 cursor-pointer"
        >
          {visible ? <EyeIcon className="size-5 fill-current" /> : <EyeCloseIcon className="size-5 fill-current" />}
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
