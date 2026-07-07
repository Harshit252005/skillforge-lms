import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BACKEND_URL } from '../config';

function AdminDashboard() {
    const [courses, setCourses] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [imageLink, setImageLink] = useState('');
    
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    // 1. Unified mounting lifecycle guard hook
    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        
        // Safety lock: Redirect immediately if unauthenticated session detected
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchCourses = async () => {
            try {
                const response = await axios.get(`${BACKEND_URL}/api/v1/admin/courses`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setCourses(response.data.courses || []);
            } catch (err) {
                console.error("Dashboard fetch block intercepted:", err.response?.data?.message);
                if (err.response?.status === 401 || err.response?.status === 403) {
                    localStorage.removeItem('adminToken');
                    navigate('/login');
                }
            }
        };

        fetchCourses();
    }, [navigate]);

    // 2. Clear Session Handlers
    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/login');
    };

    // 3. Authenticated Admin Course Submission Handlers
    const handleCreateCourse = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const response = await axios.post(`${BACKEND_URL}/api/v1/admin/courses`, 
                { title, description, price: Number(price), imageLink },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (response.data.courseId) {
                setMessage("Course published successfully!");
                // Append newly created course smoothly to front state array array
                setCourses([...courses, { 
                    _id: response.data.courseId, 
                    title, 
                    description, 
                    price, 
                    imageLink 
                }]);
                
                // Clear Input state fields
                setTitle('');
                setDescription('');
                setPrice('');
                setImageLink('');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to publish new cohort course item');
        }
    };

    return (
        <div className="w-full max-w-6xl min-h-screen p-6 md:p-10 text-white bg-slate-900">
            {/* Header Platform Control Bar */}
            <header className="flex justify-between items-center pb-6 border-b border-slate-800 mb-10">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">
                        Admin <span className="text-teal-400">Workspace</span>
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">Manage and monitor live dynamic inventory cohorts</p>
                </div>
                <button 
                    onClick={handleLogout}
                    className="px-4 py-2 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-gray-300 font-semibold text-sm rounded-xl border border-slate-700 hover:border-red-500/30 transition duration-200"
                >
                    Log Out
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Panel Column: Content Creator Terminal form */}
                <div className="lg:col-span-1 bg-slate-800 border border-slate-700/70 p-6 rounded-2xl shadow-xl h-fit">
                    <h2 className="text-xl font-bold text-teal-400 mb-4">Publish New Cohort</h2>
                    <form onSubmit={handleCreateCourse} className="space-y-4">
                        <div>
                            <label className="block text-gray-400 text-xs font-bold uppercase mb-2">Course Title</label>
                            <input 
                                type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g., Ultimate Web Development 2026"
                                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-xs font-bold uppercase mb-2">Description</label>
                            <textarea 
                                rows="3" value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="Describe course items details..."
                                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-xs font-bold uppercase mb-2">Price (INR)</label>
                            <input 
                                type="number" value={price} onChange={(e) => setPrice(e.target.value)} required placeholder="4999"
                                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-xs font-bold uppercase mb-2">Image Cover Link</label>
                            <input 
                                type="url" value={imageLink} onChange={(e) => setImageLink(e.target.value)} required placeholder="https://images.unsplash.com/photo-..."
                                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                            />
                        </div>
                        <button type="submit" className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold rounded-xl shadow-lg transition duration-200">
                            Publish Live Course
                        </button>
                    </form>

                    {message && <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl text-center font-medium">{message}</div>}
                    {error && <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl text-center font-medium">{error}</div>}
                </div>

                {/* Right Panel Column: Interactive Catalog Streams */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-bold tracking-wide">Live Catalog Storage Feed ({courses.length})</h2>
                    {courses.length === 0 ? (
                        <div className="p-10 border border-dashed border-slate-700 rounded-2xl text-center text-gray-500">
                            No courses published yet. Use the left column engine form parameters to seed items.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {courses.map((course) => (
                                <div key={course._id} className="bg-slate-800 border border-slate-700/60 rounded-xl overflow-hidden flex flex-col justify-between shadow-md">
                                    <img src={course.imageLink || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3'} alt={course.title} className="w-full h-40 object-cover bg-slate-900" />
                                    <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-bold text-lg text-white line-clamp-1">{course.title}</h3>
                                            <p className="text-xs text-gray-400 line-clamp-2 mt-1">{course.description}</p>
                                        </div>
                                        <div className="flex justify-between items-center pt-3 border-t border-slate-700/50 mt-4">
                                            <span className="text-teal-400 font-extrabold text-sm">₹{course.price}</span>
                                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-slate-900 text-gray-400 rounded-md">ID: {course._id ? course._id.slice(-6) : 'Local'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;