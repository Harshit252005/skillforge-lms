import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_URL } from '../config';


function UserDashboard() {
    const navigate = useNavigate();
    
    // Core Datasets
    const [allCourses, setAllCourses] = useState([]);
    const [purchasedCourses, setPurchasedCourses] = useState([]);
    
    // Status & Active Sub-panel state
    const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' or 'mycourses'
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleLogout = () => {
        localStorage.removeItem('studentToken');
        navigate('/student/login');
    };

    // --- FETCH ALL GLOBAL COURSES ---
    const fetchCatalog = async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}/api/v1/user/courses`,);
            setAllCourses(response.data.courses || []);
        } catch (err) {
            console.error("Failed to load catalog:", err);
        }
    };

    // --- FETCH USER'S OWNED COURSES ---
    const fetchMyCourses = async () => {
        const token = localStorage.getItem('studentToken');
        try {
            const response = await axios.get('http://localhost:3000/api/v1/user/purchased', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setPurchasedCourses(response.data.purchasedCourses || []);
        } catch (err) {
            console.error("Failed to load purchases:", err);
        }
    };

    // --- EXECUTE COURSE PURCHASE INTERACTION ---
    const handlePurchase = async (courseId) => {
        const token = localStorage.getItem('studentToken');
        
        try {
            // 🚀 CRITICAL: Move courseId out of the body and append it directly to the URL!
            const response = await axios.post(`${BACKEND_URL}/api/v1/user/purchase/${courseId}`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
    
            if (response.data.message === "Course purchased successfully!") {
                alert("Course purchased successfully!");
                // Refresh or update state here if needed
            }
        } catch (err) {
            alert(err.response?.data?.message || "Purchase failed");
        }
    };

    // Initial Security Verification & Boot Setup
    useEffect(() => {
        const token = localStorage.getItem('studentToken');
        if (!token) {
            navigate('/student/login');
            return;
        }
        fetchCatalog();
        fetchMyCourses();
    }, [navigate]);

    return (
        <div className="w-full max-w-6xl min-h-[650px] bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl flex flex-col">
            {/* Navigation Header */}
            <div className="w-full px-6 py-4 bg-slate-900/50 border-b border-slate-700 flex justify-between items-center rounded-t-2xl">
                <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                        <span className="w-3 h-3 bg-indigo-400 rounded-full animate-pulse"></span>
                        <h1 className="text-xl font-bold text-white tracking-wide">
                            CourseCraft <span className="text-indigo-400">Student</span>
                        </h1>
                    </div>
                    {/* View Switcher Toggles */}
                    <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700/50">
                        <button 
                            onClick={() => { setActiveTab('catalog'); setMessage(''); setError(''); }}
                            className={`px-4 py-1.5 text-xs font-bold rounded-md transition ${activeTab === 'catalog' ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            Explore Catalog
                        </button>
                        <button 
                            onClick={() => { setActiveTab('mycourses'); setMessage(''); setError(''); }}
                            className={`px-4 py-1.5 text-xs font-bold rounded-md transition ${activeTab === 'mycourses' ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            My Courses ({purchasedCourses.length})
                        </button>
                    </div>
                </div>
                <button 
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white font-semibold rounded-xl border border-red-500/20 transition duration-200"
                >
                    Logout
                </button>
            </div>

            {/* Status Feedback Bars */}
            {(message || error) && (
                <div className="px-8 pt-4">
                    {message && <div className="p-3 text-center bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm font-medium">{message}</div>}
                    {error && <div className="p-3 text-center bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium">{error}</div>}
                </div>
            )}

            {/* Workspace Area */}
            <div className="p-8 flex-1 overflow-y-auto max-h-[540px]">
                {activeTab === 'catalog' ? (
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Available Masterclasses</h2>
                        <p className="text-gray-400 text-sm mb-6">Select a specialization module below to instant-unlock your access tracking.</p>
                        
                        {allCourses.length === 0 ? (
                            <p className="text-gray-500 italic text-center py-12">No courses available in the catalog right now.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {allCourses.map(course => {
                                    const isOwned = purchasedCourses.some(p => p._id === course._id);
                                    return (
                                        <div key={course._id} className="bg-slate-900 rounded-xl border border-slate-700/60 overflow-hidden shadow-lg flex flex-col hover:border-slate-600 transition">
                                            <img src={course.imageLink} alt={course.title} className="w-full h-40 object-cover bg-slate-800" onError={(e)=>{e.target.src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500"}}/>
                                            <div className="p-5 flex-1 flex flex-col justify-between">
                                                <div>
                                                    <h3 className="text-white font-bold text-lg truncate">{course.title}</h3>
                                                    <p className="text-gray-400 text-xs mt-2 line-clamp-3 leading-relaxed">{course.description}</p>
                                                </div>
                                                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                                                    <span className="text-indigo-400 font-extrabold text-lg">₹{course.price}</span>
                                                    <button
                                                        onClick={() => !isOwned && handlePurchase(course._id)}
                                                        disabled={isOwned}
                                                        className={`px-4 py-2 text-xs font-bold rounded-lg transition shadow-md ${isOwned ? 'bg-emerald-500/20 text-emerald-400 cursor-default border border-emerald-500/30' : 'bg-indigo-500 hover:bg-indigo-600 text-white'}`}
                                                    >
                                                        {isOwned ? '✓ Unlocked' : 'Buy Course'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">My Study Vault</h2>
                        <p className="text-gray-400 text-sm mb-6">Your active curriculum profiles currently saved in cloud record collections.</p>
                        
                        {purchasedCourses.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed border-slate-700 rounded-xl max-w-md mx-auto">
                                <p className="text-gray-400 text-sm">Your learning library is currently empty.</p>
                                <button onClick={()=>setActiveTab('catalog')} className="mt-3 text-xs font-bold text-indigo-400 hover:underline">Browse active catalog →</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {purchasedCourses.map(course => (
                                    <div key={course._id} className="bg-slate-900 rounded-xl border border-emerald-500/30 overflow-hidden shadow-lg flex flex-col">
                                        <img src={course.imageLink} alt={course.title} className="w-full h-40 object-cover bg-slate-800" onError={(e)=>{e.target.src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500"}}/>
                                        <div className="p-5 flex-1 flex flex-col justify-between bg-gradient-to-b from-slate-900 to-emerald-950/10">
                                            <div>
                                                <h3 className="text-white font-bold text-lg truncate">{course.title}</h3>
                                                <p className="text-gray-400 text-xs mt-2 line-clamp-3 leading-relaxed">{course.description}</p>
                                            </div>
                                            <div className="mt-5 pt-3 border-t border-slate-800 flex justify-between items-center">
                                                <span className="text-emerald-400 text-xs font-semibold tracking-wide uppercase">Active Access</span>
                                                <button 
                                                onClick={() => navigate(`/student/course/${course._id}`)}
                                                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-md transition"
                                                >
                                                    Enter Classroom
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserDashboard;