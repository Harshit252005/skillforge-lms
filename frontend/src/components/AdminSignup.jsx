import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { BACKEND_URL } from '../config';

function AdminSignup() {
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
            // Secure, dynamic endpoint lookup targeting your backend configuration matrix
            const response = await axios.post(`${BACKEND_URL}/api/v1/admin/signup`, {
                username,
                password
            });
        
            if (response.data.message === "Admin created successfully" || response.status === 200) {
                setMessage(response.data.message);
                setUsername('');
                setPassword('');
                
                // 🚀 Seamless UX routing shift directly to the authentication terminal
                navigate('/login'); 
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Admin registration failed');
        }
    };

    return (
        <div className="w-full max-w-md bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-teal-500 to-indigo-500"></div>
            
            <div className="text-center mb-8">
                <h1 className="text-3xl font-black text-white tracking-tight">
                    Admin <span className="text-teal-400 font-extrabold">Portal</span>
                </h1>
                <p className="text-gray-400 text-sm mt-2">
                    Create an admin account to manage and sell courses
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
                    Create Admin Account
                </button>
            </form>

            {/* Application Feedback Framework */}
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
                    Already registered?{' '}
                    <Link to="/login" className="text-teal-400 hover:underline font-semibold ml-1">
                        Sign In Here
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default AdminSignup;