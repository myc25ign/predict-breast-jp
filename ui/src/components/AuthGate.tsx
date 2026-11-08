import { useCallback, useState, type FormEvent, type ReactNode } from 'react';
import { clearSession, isAuthenticated, verifyPassword } from '../lib/auth';

interface Props {
  children: ReactNode;
}

export function AuthGate({ children }: Props) {
  const [authed, setAuthed] = useState(isAuthenticated);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const onSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError(null);
      setPending(true);
      try {
        const ok = await verifyPassword(password);
        if (ok) {
          setAuthed(true);
          setPassword('');
        } else {
          setError('パスワードが正しくありません。');
        }
      } finally {
        setPending(false);
      }
    },
    [password]
  );

  const onLogout = useCallback(() => {
    clearSession();
    setAuthed(false);
    setPassword('');
  }, []);

  if (authed) {
    return (
      <>
        <button type="button" className="auth-logout" onClick={onLogout} title="ログアウト">
          終了
        </button>
        {children}
      </>
    );
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <p className="auth-card__badge">関係者向け</p>
        <h1 className="auth-card__title">PREDICT Breast デモ</h1>
        <p className="auth-card__sub">
          プレゼン・検証用の限定公開です。パスワードを入力してください。
        </p>
        <form className="auth-form" onSubmit={onSubmit}>
          <label className="auth-form__label" htmlFor="access-password">
            アクセスパスワード
          </label>
          <input
            id="access-password"
            type="password"
            className="auth-form__input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            autoFocus
            disabled={pending}
          />
          {error && <p className="auth-form__error">{error}</p>}
          <button type="submit" className="auth-form__submit" disabled={pending || !password}>
            {pending ? '確認中…' : '入室'}
          </button>
        </form>
        <p className="auth-card__note">
          静的サイトのため、完全なサーバー認証ではありません。関係者以外への共有はお控えください。
        </p>
      </div>
    </div>
  );
}
