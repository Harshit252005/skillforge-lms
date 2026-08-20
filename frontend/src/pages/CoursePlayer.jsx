import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { ArrowLeft, PlayCircle } from 'lucide-react';

export default function CoursePlayer() {
  const { courseId } = useParams(); 
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const res = await API.get(`/user/courses/${courseId}`); 
        setCourse(res.data.course);
      } catch (err) {
        console.error("Error fetching course details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <button 
        onClick={() => navigate('/my-courses')} 
        className="text-slate-400 hover:text-indigo-400 mb-8 flex items-center gap-2 transition"
      >
        <ArrowLeft className="w-5 h-5" /> Back to My Courses
      </button>

      {loading ? (
        <div className="text-center py-20 text-slate-400 animate-pulse">
          Loading classroom...
        </div>
      ) : (
        <div className="bg-slate-800/60 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
          {/* The Actual Video Player */}
          <div className="w-full aspect-video bg-black flex flex-col items-center justify-center border-b border-slate-700 relative">
            {course?.videoLink ? (
              <video 
                controls 
                autoPlay
                className="w-full h-full object-contain bg-black"
                poster={course?.imageLink}
              >
                <source src={course.videoLink} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              // Demo video for your interview if no video is uploaded yet!
              <video 
                controls 
                className="w-full h-full object-contain bg-black"
                poster={course?.imageLink}
              >
                <source src="https://res.cloudinary.com/demo/video/upload/v1604049033/elephants.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>

          <div className="p-8">
            <h1 className="text-3xl font-bold text-white mb-4">
              {course?.title || "Course Title Loading..."}
            </h1>
            <p className="text-slate-400 text-lg">
              {course?.description || "Course description will appear here once connected."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}