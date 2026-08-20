import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, ShoppingCart, ArrowLeft, Layers, ShieldCheck } from 'lucide-react';

export default function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [isPurchased, setIsPurchased] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseDetails();
    if (user && user.role === 'user') {
      checkPurchaseStatus();
    }
  }, [courseId, user]);

  const fetchCourseDetails = async () => {
    try {
      const res = await API.get(`/api/v1/user/courses/${courseId}`);
      setCourse(res.data.course);
    } catch (err) {
      console.error('Failed to load course details', err);
    } finally {
      setLoading(false);
    }
  };

  const checkPurchaseStatus = async () => {
    try {
      const res = await API.get('/api/v1/user/purchasedCourses');
      const purchasedIds = (res.data.purchasedCourses || []).map((c) => c._id);
      if (purchasedIds.includes(courseId)) {
        setIsPurchased(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'admin') {
      alert('Admins cannot purchase courses.');
      return;
    }

    try {
      const orderResponse = await API.post(`/api/v1/user/create-order`, { courseId });
      const { order, course } = orderResponse.data;

      const options = {
        key: 'rzp_test_TRdDeQtQB4ExgB',
        amount: order.amount,
        currency: order.currency,
        name: "SkillForge Learning",
        description: `Purchasing: ${course.title}`,
        order_id: order.id,
        prefill: {
            name: "Test Student",
            email: "student@skillforge.com",
            contact: "9000090000"
        },
        handler: async function () {
          try {
            await API.post(`/api/v1/user/courses/${courseId}`);
            setIsPurchased(true);
            alert('Payment successful! You are now enrolled.');
          } catch (error) {
            alert("Error adding course to your account.");
          }
        },
        theme: {
          color: "#4f46e5",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to initialize payment.');
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-400">Loading course overview...</div>;
  }

  if (!course) {
    return <div className="text-center py-20 text-red-400">Course not found.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <button 
        onClick={() => navigate('/')} 
        className="text-slate-400 hover:text-indigo-400 mb-8 flex items-center gap-2 transition"
      >
        <ArrowLeft className="w-5 h-5" /> Back to All Courses
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Course Info */}
        <div className="lg:col-span-2 space-y-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">{course.title}</h1>
          <p className="text-slate-300 text-lg leading-relaxed">{course.description}</p>

          <div className="bg-slate-800/60 border border-slate-700 p-6 rounded-2xl space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" /> What's Included & Modules
            </h3>
            <ul className="space-y-3 text-slate-300">
              <li className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400" /> Full lifetime access to course videos and materials
              </li>
              <li className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400" /> Hands-on projects and source code included
              </li>
              <li className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400" /> Certificate of completion upon finishing
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Pricing & Sticky Purchase Card */}
        <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl h-fit shadow-2xl space-y-6 sticky top-24">
          <img
            src={course.imageLink || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97'}
            alt={course.title}
            className="w-full h-48 object-cover rounded-xl"
          />
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Price</span>
            <span className="text-3xl font-black text-indigo-400">₹{course.price}</span>
          </div>

          {isPurchased ? (
            <button
              onClick={() => navigate(`/course/${course._id}`)}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-semibold transition shadow-lg"
            >
              <CheckCircle2 className="w-5 h-5" /> Start Learning
            </button>
          ) : (
            <button
              onClick={handlePurchase}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-semibold transition shadow-lg shadow-indigo-600/30"
            >
              <ShoppingCart className="w-5 h-5" /> Enroll & Checkout
            </button>
          )}
        </div>
      </div>
    </div>
  );
}