import { useEffect, useState } from 'react';
import API from '../api/axios';
import { Plus, Trash2, Edit3, Video } from 'lucide-react';

export default function AdminDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [thumbnail, setThumbnail] = useState(null);
  const [video, setVideo] = useState(null);
  const [fileKey, setFileKey] = useState(Date.now());
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
 
  useEffect(() => {
    fetchAdminCourses();
  }, []);

  const fetchAdminCourses = async () => {
    try {
      const res = await API.get('/api/v1/admin/courses');
      setCourses(res.data.courses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    setError('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', Number(price));
    
    if (thumbnail) {
      formData.append('thumbnail', thumbnail);
    }
    
    if (video) {
      formData.append('video', video);
    }

    try {
      if (editingId) {
        await API.put(`/api/v1/admin/courses/${editingId}`, formData);
      } else {
        await API.post('/api/v1/admin/courses', formData);
      }

      resetForm();
      fetchAdminCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save course.');
    }
  };

  const handleEdit = (course) => {
    setEditingId(course._id);
    setTitle(course.title);
    setDescription(course.description);
    setPrice(course.price);
  };

  const handleDelete = async (courseId) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      await API.delete(`/api/v1/admin/courses/${courseId}`);
      fetchAdminCourses();
    } catch (err) {
      alert('Failed to delete course');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setPrice('');
    setThumbnail(null);
    setVideo(null);
    setFileKey(Date.now());
    setError('');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
      <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl h-fit shadow-xl">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          {editingId ? <Edit3 className="w-5 h-5 text-amber-400" /> : <Plus className="w-5 h-5 text-indigo-400" />}
          {editingId ? 'Edit Course' : 'Create New Course'}
        </h2>

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg mb-4">{error}</div>}

        <form onSubmit={handleSaveCourse} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Description</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Price ($)</label>
            <input
              type="number"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Course Thumbnail (Image)</label>
            <input
              type="file"
              key={fileKey}
              accept="image/*"
              required={!editingId}
              onChange={(e) => setThumbnail(e.target.files[0])}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1 flex items-center gap-1">
              <Video className="w-3 h-3" /> Main Course Video
            </label>
            <input
              type="file"
              key={fileKey}
              accept="video/*"
              required={!editingId}
              onChange={(e) => setVideo(e.target.files[0])}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-rose-500/10 file:text-rose-400 hover:file:bg-rose-500/20"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl transition text-sm"
            >
              {editingId ? 'Update' : 'Publish Course'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold px-4 py-2.5 rounded-xl transition text-sm"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="lg:col-span-2">
        <h2 className="text-xl font-bold text-white mb-6">Managed Courses</h2>
        {loading ? (
          <div className="text-slate-400">Loading admin courses...</div>
        ) : courses.length === 0 ? (
          <div className="p-8 text-center bg-slate-800/40 border border-slate-700/50 rounded-2xl text-slate-400">
            No courses published yet. Use the form on the left to create your first course!
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => (
              <div
                key={course._id}
                className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-4 justify-between"
              >
                <img src={course.imageLink} alt={course.title} className="w-full sm:w-24 h-20 object-cover rounded-xl" />
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-bold text-white">{course.title}</h3>
                  <p className="text-slate-400 text-xs line-clamp-1">{course.description}</p>
                  <span className="text-indigo-400 font-bold text-sm">₹{course.price}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(course)}
                    className="p-2 bg-slate-700 hover:bg-slate-600 text-amber-400 rounded-lg transition"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(course._id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}