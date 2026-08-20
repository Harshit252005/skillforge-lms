import { useEffect, useState } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ShoppingCart, Sparkles } from 'lucide-react';

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [purchasedIds, setPurchasedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
    if (user && user.role === 'user') {
      fetchPurchasedCourses();
    }
  }, [user]);

  const fetchCourses = async () => {
    try {
      const res = await API.get('/api/v1/user/courses');
      setCourses(res.data.courses || []);
    } catch (err) {
      setError('Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchasedCourses = async () => {
    try {
      const res = await API.get('/api/v1/user/purchasedCourses');
      const ids = (res.data.purchasedCourses || []).map((c) => c._id);
      setPurchasedIds(ids);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePurchase = async (courseId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'admin') {
      alert('Admins cannot purchase courses. Please log in as a student.');
      return;
    }

    try {
      // 1. Tell backend to create a Razorpay order
      const orderResponse = await API.post(`/api/v1/user/create-order`, { courseId });
      const { order, course } = orderResponse.data;

      // 2. Open the Razorpay Checkout Modal
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
        handler: async function (response) {
          try {
            await API.post(`/api/v1/user/courses/${courseId}`);
            setPurchasedIds((prev) => [...prev, courseId]);
            alert('Payment successful! Course purchased!');
          } catch (error) {
            alert("Error adding course to your account.");
          }
        },
        theme: {
          color: "#4f46e5",
        },
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response){
        alert("Payment failed or was cancelled.");
      });

      rzp.open();

    } catch (err) {
      alert(err.response?.data?.message || 'Failed to initialize payment.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-4 py-1.5 rounded-full text-xs font-semibold mb-4">
          <Sparkles className="w-4 h-4" /> Welcome to SkillForge
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
          Master Modern Tech with Hands-On Courses
        </h1>
        <p className="text-slate-400 text-lg">
          Learn directly from industry engineers with practical projects, production-grade tools, and clear paths to mastery.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading courses...</div>
      ) : error ? (
        <div className="text-center py-20 text-red-400">{error}</div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 text-slate-500">No courses available yet. Check back soon!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => {
            const isPurchased = purchasedIds.includes(course._id);
            return (
              <div
                key={course._id}
                className="bg-slate-800/60 border border-slate-700/60 rounded-2xl overflow-hidden hover:border-slate-600 transition duration-300 flex flex-col shadow-xl"
              >
                <img
                  src={course.imageLink || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97'}
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{course.title}</h3>
                    <p className="text-slate-400 text-sm line-clamp-3 mb-6">{course.description}</p>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-700/60 pt-4">
                    <span className="text-2xl font-black text-indigo-400">${course.price}</span>
                    {isPurchased ? (
                      <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-xl text-sm font-semibold">
                        <CheckCircle2 className="w-4 h-4" /> Enrolled
                      </span>
                    ) : (
                      <button
                        onClick={() => handlePurchase(course._id)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg shadow-indigo-600/30"
                      >
                        <ShoppingCart className="w-4 h-4" /> Enroll Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}