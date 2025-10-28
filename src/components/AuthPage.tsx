import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function AuthPage() {
	const { login, register } = useAuth();
	const [mode, setMode] = useState<'login' | 'register'>('login');
	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		try {
			if (mode === 'login') {
				await login(email || username, password);
			} else {
				if (!username || !email) {
					setError('Username and email are required');
					setLoading(false);
					return;
				}
				await register(username, email, password);
			}
			window.location.href = '/';
		} catch (err: any) {
			console.error('Auth error:', err);
			const errorMessage = err?.response?.data?.message || err?.message || 'Authentication failed';
			const errorDetails = err?.response?.data?.details ? JSON.stringify(err.response.data.details) : '';
			setError(errorMessage + (errorDetails ? ` - ${errorDetails}` : ''));
		} finally {
			setLoading(false);
		}
	};

	return (
		<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
			<form onSubmit={handleSubmit} style={{ width: 360, padding: 24, border: '1px solid #333', borderRadius: 8 }}>
				<h2 style={{ marginBottom: 16 }}>{mode === 'login' ? 'Login' : 'Register'}</h2>
				{mode === 'register' && (
					<div style={{ marginBottom: 12 }}>
						<label style={{ display: 'block', marginBottom: 6 }}>Username</label>
						<input value={username} onChange={(e) => setUsername(e.target.value)} style={{ width: '100%' }} />
					</div>
				)}
				<div style={{ marginBottom: 12 }}>
					<label style={{ display: 'block', marginBottom: 6 }}>{mode === 'login' ? 'Email or Username' : 'Email'}</label>
					<input value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%' }} />
				</div>
				<div style={{ marginBottom: 16 }}>
					<label style={{ display: 'block', marginBottom: 6 }}>Password</label>
					<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%' }} />
				</div>
				{error && <div style={{ color: 'tomato', marginBottom: 12 }}>{error}</div>}
				<button disabled={loading} type="submit" style={{ width: '100%' }}>
					{loading ? 'Please wait…' : mode === 'login' ? 'Login' : 'Register'}
				</button>
				<div style={{ marginTop: 12, textAlign: 'center' }}>
					<a href="#" onClick={(e) => { e.preventDefault(); setMode(mode === 'login' ? 'register' : 'login'); }}>
						{mode === 'login' ? 'Need an account? Register' : 'Have an account? Login'}
					</a>
				</div>
			</form>
		</div>
	);
}
