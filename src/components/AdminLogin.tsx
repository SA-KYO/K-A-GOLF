import { useState, FormEvent } from 'react';
import { Lock } from 'lucide-react';

interface AdminLoginProps {
  onLogin: () => void;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;

    if (password === adminPassword) {
      sessionStorage.setItem('adminAuth', 'authenticated');
      onLogin();
    } else {
      setError('パスワードが正しくありません');
      setPassword('');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-yellow-300 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white border-4 border-black p-8 md:p-12" style={{ boxShadow: '8px 8px 0 0 var(--shadow-color)' }}>
          <div className="flex items-center justify-center gap-3 mb-8">
            <Lock className="w-10 h-10 text-black" />
            <h1 className="text-3xl font-black text-black uppercase">管理者ログイン</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-black text-black mb-2 uppercase">
                パスワード
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:ring-0 font-bold"
                placeholder="パスワードを入力"
                required
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-400 border-4 border-black text-black px-4 py-3 font-bold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-yellow-300 text-black px-6 py-3 border-4 border-black text-lg font-black uppercase hover:translate-x-1 hover:translate-y-1 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ boxShadow: '6px 6px 0 0 var(--shadow-color)' }}
            >
              {isLoading ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t-4 border-black">
            <a
              href="/"
              className="text-black hover:underline font-black transition-all block text-center uppercase"
            >
              トップページに戻る
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
