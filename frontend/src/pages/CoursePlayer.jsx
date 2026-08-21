import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react';

// AI Explainer Component built right in or imported
function AIExplainerWidget({ courseTitle }) {
  const [term, setTerm] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExplain = async (e) => {
    e.preventDefault();
    if (!term.trim() || loading) return;

    setLoading(true);
    setExplanation('');

    try {
      const res = await API.post('/api/v1/user/ai/explain', {
        term: term,
        courseContext: courseTitle
      });
      setExplanation(res.data.explanation);
    } catch (err) {
      setExplanation('Oops! Could not fetch the AI explanation. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 shadow-xl h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-2">
          <Sparkles className="w-5 h-5" /> AI Concept Explainer (ELI5)
        </div>
        <p className="text-slate-400 text-xs mb-4">
          Stuck on a confusing word or term? Type it below for an instant, simple breakdown tailored to this course!
        </p>

        <form onSubmit={handleExplain} className="flex gap-2 mb-4">
          <input
            type="text"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="e.g., JWT, Middleware..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition flex items-center justify-center min-w-[70px]"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Explain'}
          </button>
        </form>
      </div>

      {explanation && (
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 text-sm text-slate-300 leading-relaxed mt-2">
          <span className="text-indigo-300 font-semibold block mb-1 text-xs uppercase tracking-wider">AI Breakdown:</span>
          {explanation}
        </div>
      )}
    </div>
  );
}

export default function CoursePlayer() {
  const { courseId } = useParams(); 
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const res = await API.get(`/api/v1/user/courses/${courseId}`); 
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side: Video & Description (Takes up 2 columns) */}
          <div className="lg:col-span-2 bg-slate-800/60 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
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

          {/* Right Side: AI Assistant Widget (Takes up 1 column) */}
          <div className="lg:col-span-1">
            <AIExplainerWidget courseTitle={course?.title} />
          </div>
        </div>
      )}
    </div>
  );
}