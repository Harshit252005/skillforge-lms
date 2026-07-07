import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { BACKEND_URL } from '../config';

function UserLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            // Unprotected core POST authentication flow
            const response = await axios.post(`${BACKEND_URL}/api/v1/user/login`, {
                username,
                password
            });

            if (response.data.token) {
                // 🚀 Stored isolated under studentToken key to separate roles smoothly
                localStorage.setItem('studentToken', response.data.token);
                
                setUsername('');
                setPassword('');
                
                // Forward straight to student dashboard workspace
                navigate('/student/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid student username or password');
        }
    };

    return (
        <div className="w-full max-w-md bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
            
            <div className="text-center mb-8">
                <h1 className="text-3xl font-black text-white tracking-tight">
                    Student <span className="text-indigo-400 font-extrabold">Login</span>
                </h1>
                <p className="text-gray-400 text-sm mt-2">
                    Sign in to track progress and purchase new cohorts
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
                        placeholder="student@example.com"
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition duration-200"
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
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition duration-200"
                        required
                    />
                </div>

                <button 
                    type="submit"
                    className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl transition duration-200 shadow-lg shadow-indigo-500/10 active:scale-[0.98] transform"
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
                    Don't have a student account?{' '}
                    <Link to="/student/signup" className="text-indigo-400 hover:underline font-semibold ml-1">
                        Register Here
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default UserLogin;