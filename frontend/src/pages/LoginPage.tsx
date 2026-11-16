import { FormEvent, useState } from 'react';
import { ApiError } from '../api';
import { useAuth } from '../auth';
import { useTheme } from '../theme';
import { Moon, Sun } from 'lucide-react';

export function LoginPage() {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof ApiError || err instanceof Error ? err.message : 'Sign-in failed');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-stone-100 text-stone-900 dark:bg-stone-950 dark:text-stone-100 lg:grid-cols-2">
      <section className="flex flex-col justify-between bg-teal-900 px-6 py-8 text-teal-50 lg:px-12">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-white/15 text-sm font-bold">AT</span>
            <p className="text-lg font-semibold">AssetTrack</p>
          </div>
          <button type="button" className="btn-ghost border-white/20 text-white hover:bg-white/10" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
        <div className="max-w-md py-10">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Know what the fleet is worth, who holds it, and what needs work.</h1>
          <p className="mt-4 text-teal-100/90">Inventory, assignments, licenses, and maintenance against the AssetTrack API.</p>
        </div>
        <p className="text-sm text-teal-100/80">Enterprise IT asset operations</p>
      </section>
      <section className="flex items-center justify-center px-4 py-10">
        <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <h2 className="text-xl font-semibold">Sign in</h2>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">Use your AssetTrack email and password. The username field is the email address.</p>
          <label className="mt-5 block text-sm font-semibold" htmlFor="email">
            Email
          </label>
          <input id="email" className="field mt-1" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <label className="mt-4 block text-sm font-semibold" htmlFor="password">
            Password
          </label>
          <input id="password" className="field mt-1" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          {error ? (
            <p className="mt-4 text-sm text-rose-700 dark:text-rose-300" role="alert">
              {error}
            </p>
          ) : null}
          <button type="submit" className="btn-primary mt-5 w-full" disabled={pending}>
            {pending ? 'Signing in…' : 'Sign in'}
          </button>
          <p className="mt-4 rounded-lg bg-stone-100 px-3 py-2 text-xs text-stone-600 dark:bg-stone-800 dark:text-stone-300">
            Development hint from the published seed: admin@assettrack.io / Admin123!Secure
          </p>
        </form>
      </section>
    </div>
  );
}
