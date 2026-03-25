import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiAcademicCap, HiEye, HiEyeOff } from 'react-icons/hi';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPw, setShowPw] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await login(email, password);
            if (user.role === 'faculty') navigate('/faculty/dashboard');
            else if (user.role === 'student') navigate('/student/dashboard');
            else { setError('Access denied. This portal is for Students and Faculty only.'); setLoading(false); }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' }}>
            {/* Animated bg circles */}
            <div className="absolute w-96 h-96 rounded-full bg-indigo-500/10 -top-24 -left-24 animate-pulse" />
            <div className="absolute w-72 h-72 rounded-full bg-purple-500/10 -bottom-12 -right-12 animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute w-48 h-48 rounded-full bg-cyan-500/10 top-1/2 left-1/2 animate-pulse" style={{ animationDelay: '2s' }} />

            <div className="relative z-10 w-[420px] bg-[#1a2332]/95 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <HiAcademicCap className="text-3xl text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-100">CampusSync</h1>
                    <p className="text-gray-400 text-sm mt-1">Student & Faculty Portal</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">Email</label>
                        <input type="email" className="input-field" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" required />
                    </div>
                    <div className="relative">
                        <label className="label">Password</label>
                        <input type={showPw ? 'text' : 'password'} className="input-field pr-10" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" required />
                        <button type="button" className="absolute right-3 top-8 text-gray-400 hover:text-gray-200" onClick={() => setShowPw(!showPw)}>
                            {showPw ? <HiEyeOff size={18} /> : <HiEye size={18} />}
                        </button>
                    </div>
                    {error && <div className="text-red-400 text-sm text-center bg-red-500/10 rounded-lg p-2">{error}</div>}
                    <button type="submit" disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Sign In'}
                    </button>
                </form>
                <p className="text-center text-gray-500 text-xs mt-6">Student & Faculty Portal</p>
            </div>
        </div>
    );
}
