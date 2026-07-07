import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { BACKEND_URL } from '../config';

function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        try {
            // 🚀 Clean, explicit POST execution sequence to your authentication router
            const response = await axios.post(`${BACKEND_URL}/api/v1/admin/login`, {
                username,
                password
            });

            if (response.data.token) {
                // Store the admin token securely in local storage
                localStorage.setItem('adminToken', response.data.token);
                
                // Clear inputs and route forward directly to the functional workspace
                setUsername('');
                setPassword('');
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid username or password');
        }
    };

    return (
        <div className="w-full max-w-md bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-teal-500 to-indigo-500"></div>
            
            <div className="text-center mb-8">
                <h1 className="text-3xl font-black text-white tracking-tight">
                    Admin <span className="text-teal-400 font-extrabold">Login</span>
                </h1>
                <p className="text-gray-400 text-sm mt-2">
                    Sign in to access your administrative workspace dashboard
                </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
                <div>
                    <label className="block text-gray-300 text-xs font-bold uppercase tracking-wider mb-2">
                        Username / Email
                    </label>
                    <input 
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="admin@example.com"
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition duration-200"
                        required
                    />
                </div>

                <div>
                    <label className="block text-gray-300 text-xs font-bold uppercase tracking-wider mb-2">
                        Password
                    </label>
                    <input 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition duration-200"
                        required
                    />
                </div>

                <button 
                    type="submit"
                    className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold rounded-xl transition duration-200 shadow-lg shadow-teal-500/10 active:scale-[0.98] transform"
                >
                    Sign In
                </button>
            </form>

            {error && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg text-center font-medium">
                    {error}
                </div>
            )}

            <div className="mt-6 text-center border-t border-slate-700/50 pt-4">
                <p className="text-gray-400 text-xs">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-teal-400 hover:underline font-semibold ml-1">
                        Register Here
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default AdminLogin;