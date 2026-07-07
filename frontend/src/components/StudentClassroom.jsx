import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_URL } from '../config';

function StudentClassroom() {
    const { courseId } = useParams(); // Grabs the ID straight from the browser URL path
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('studentToken');
        
        if (!token) {
            navigate('/student/login');
            return;
        }

        const fetchClassroomData = async () => {
            try {
                // Hits the global catalog endpoint to fetch the specific course content safely
                const response = await axios.get(`${BACKEND_URL}/api/v1/user/courses`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                // Find the specific course out of the student's available courses array
                const allCourses = response.data.courses || [];
                const currentCourse = allCourses.find(c => c._id === courseId);

                if (currentCourse) {
                    setCourse(currentCourse);
                } else {
                    setError('Classroom access mismatch or invalid ID.');
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to authenticate classroom access permissions.');
            } finally {
                setLoading(false);
            }
        };

        if (courseId) {
            fetchClassroomData();
        }
    }, [courseId, navigate]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                <span className="ml-3 font-medium">Validating security clearances...</span>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="w-full max-w-md bg-slate-800 rounded-2xl border border-slate-700 p-8 text-center shadow-2xl">
                <p className="text-red-400 font-bold mb-4">{error || 'Classroom access mismatch or invalid ID.'}</p>
                <Link to="/student/dashboard" className="text-indigo-400 hover:underline font-semibold text-sm">
                    Return to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden text-white">
            <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 flex justify-between items-center">
                <div>
                    <span className="text-xs font-bold uppercase tracking-widest bg-black/20 px-3 py-1 rounded-full text-indigo-200">
                        Live Classroom Terminal
                    </span>
                    <h1 className="text-2xl font-black mt-2 tracking-tight">{course.title}</h1>
                </div>
                <Link to="/student/dashboard" className="px-4 py-2 bg-slate-900/40 hover:bg-slate-900/60 rounded-xl font-bold text-xs border border-white/10 transition duration-200">
                    Exit Classroom
                </Link>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <div className="aspect-video w-full bg-slate-950 rounded-xl flex items-center justify-center border border-slate-700/60 relative overflow-hidden group">
                        <img src={course.imageLink} alt="Course Content" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition duration-500" />
                        <button className="relative z-10 w-16 h-16 bg-indigo-500 hover:bg-indigo-600 rounded-full flex items-center justify-center shadow-xl shadow-indigo-500/20 transform active:scale-95 transition duration-200">
                            <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        </button>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-indigo-400 mb-2">About this Cohort</h3>
                        <p className="text-gray-300 text-sm leading-relaxed">{course.description}</p>
                    </div>
                </div>

                <div className="md:col-span-1 bg-slate-900/50 border border-slate-700/40 rounded-xl p-4 h-fit space-y-3">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Classroom Resources</h4>
                    <div className="p-3 bg-slate-800 rounded-lg text-xs font-medium cursor-pointer hover:bg-slate-700/50 transition">📚 Syllabus & Documents</div>
                    <div className="p-3 bg-slate-800 rounded-lg text-xs font-medium cursor-pointer hover:bg-slate-700/50 transition">💬 Discord Lounge Link</div>
                    <div className="p-3 bg-slate-800 rounded-lg text-xs font-medium cursor-pointer hover:bg-slate-700/50 transition">💻 GitHub Repository Matrix</div>
                </div>
            </div>
        </div>
    );
}

export default StudentClassroom;