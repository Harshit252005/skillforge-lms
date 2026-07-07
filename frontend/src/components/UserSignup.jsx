import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { BACKEND_URL } from '../config';

function UserSignup() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        try {
            // Unprotected endpoint: Direct POST request with zero headers required
            const response = await axios.post(`${BACKEND_URL}/api/v1/user/signup`, {
                username,
                password
            });
        
            if (response.data.message || response.status === 200) {
                setMessage(response.data.message || "Account created successfully!");
                setUsername('');
                setPassword('');
                
                // 🚀 Automatically route the student to the login gate
                navigate('/student/login'); 
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Student registration failed');
        }
    };

    return (
        <div className="w-full max-w-md bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
            
            <div className="text-center mb-8">
                <h1 className="text-3xl font-black text-white tracking-tight">
                    Student <span className="text-indigo-400 font-extrabold">Portal</span>
                </h1>
                <p className="text-gray-400 text-sm mt-2">
                    Sign up to explore, purchase, and learn from top courses
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
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
                    Create Student Account
                </button>
            </form>

            {message && (
                <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-lg text-center font-medium">
                    {message}
                </div>
            )}

            {error && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg text-center font-medium">
                    {error}
                </div>
            )}

            <div className="mt-6 text-center border-t border-slate-700/50 pt-4">
                <p className="text-gray-400 text-xs">
                    Already have a student account?{' '}
                    <Link to="/student/login" className="text-indigo-400 hover:underline font-semibold ml-1">
                        Sign In Here
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default UserSignup;