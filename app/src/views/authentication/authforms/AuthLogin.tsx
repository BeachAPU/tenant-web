import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Alert, AlertDescription } from 'src/components/ui/alert';
import { useAuth } from 'src/context/auth-context';

const AuthLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);

    if (result.ok) navigate('/', { replace: true });
    else setError(result.error);
  };

  return (
    <form className="mt-6" onSubmit={handleSubmit}>
      {error && (
        <Alert variant="lighterror" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="mb-4">
        <div className="mb-2 block">
          <Label htmlFor="email">Email</Label>
        </div>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="mb-4">
        <div className="mb-2 block">
          <Label htmlFor="userpwd">Password</Label>
        </div>
        <Input
          id="userpwd"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full mt-2" disabled={submitting}>
        {submitting ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
};

export default AuthLogin;
