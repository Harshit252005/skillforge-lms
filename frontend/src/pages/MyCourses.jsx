import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Imported useNavigate
import API from '../api/axios';
import { BookOpen } from 'lucide-react';

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // 2. Initialized it here

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      const res = await API.get('/user/purchasedCourses');
      setCourses(res.data.purchasedCourses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
        <BookOpen className="w-8 h-8 text-indigo-400" /> My Enrolled Courses
      </h1>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading your courses...</div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 bg-slate-800/40 border border-slate-700/50 rounded-2xl">
          <p className="text-slate-400 text-lg mb-2">You haven't enrolled in any courses yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div key={course._id} className="bg-slate-800/60 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
              <img
                src={course.imageLink || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97'}
                alt={course.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{course.title}</h3>
                <p className="text-slate-400 text-sm line-clamp-3 mb-4">{course.description}</p>
                
                {/* 3. The button now has the onClick event! */}
                <button 
                  onClick={() => navigate(`/course/${course._id}`)}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl font-semibold text-sm transition"
                >
                  Start Learning
                </button>
                
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}