import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyBlogs, deleteBlog } from '../redux/thunk/blogThunk';
import { clearBlogStatus } from '../redux/slice/blogSlice';
import { ArrowLeft, Trash2, BookOpen, Clock, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';

const UserBlogsManager = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const base_url = "http://localhost:3000";
    
    // Redux State from blogSlice
    const { myBlogs, loading, deleteSuccess } = useSelector((state) => state.blog);

    useEffect(() => {
        if (userId) {
            dispatch(fetchMyBlogs(userId)); // Admin mode: ID pass kar rahe hain
        }
        return () => dispatch(clearBlogStatus());
    }, [dispatch, userId]);

    // Delete Handler for Admin
    const handleDeleteBlog = async (id) => {
        const result = await Swal.fire({
            title: "Delete Blog?",
            text: "As an admin, you are removing this content permanently.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ff0606",
            confirmButtonText: "Yes, Delete!"
        });

        if (result.isConfirmed) {
            await dispatch(deleteBlog(id));
            if (deleteSuccess) {
                Swal.fire("Deleted!", "The blog has been removed.", "success");
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f9fc] p-6 md:p-10">
            <div className="max-w-6xl mx-auto">
                {/* Top Navigation */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-bold transition-colors mb-6 group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    BACK TO USERS
                </button>

                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 italic uppercase">User Publications</h1>
                        <p className="text-gray-500 font-medium">Manage and moderate blogs posted by this user.</p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-2xl border shadow-sm font-bold text-indigo-600">
                        Total: {myBlogs?.length || 0}
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        <p className="mt-4 font-bold text-gray-400">Fetching User Content...</p>
                    </div>
                ) : myBlogs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myBlogs.map((blog) => (
                            <div key={blog._id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all group">
                                {/* Image Container */}
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={`${base_url}${blog.coverImage} `}

                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        alt={blog.title}
                                    />
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-600">
                                        {blog.category || 'General'}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-2 mb-3 h-12">
                                        {blog.title}
                                    </h3>

                                    <div className="flex items-center gap-4 text-gray-400 text-xs font-bold mb-5">
                                        <span className="flex items-center gap-1"><Clock size={14} /> {new Date(blog.createdAt).toLocaleDateString()}</span>
                                        <span className="flex items-center gap-1"><BookOpen size={14} /> {blog.viewsCount || 0} Views</span>
                                    </div>

                                    {/* Admin Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => navigate(`/blog/${blog.slug}`)}
                                            className="flex-1 py-2.5 bg-gray-50 text-gray-700 rounded-xl font-bold text-xs hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                                        >
                                            VIEW BLOG
                                        </button>
                                        <button
                                            onClick={() => handleDeleteBlog(blog._id)}
                                            className="px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-gray-100">
                        <div className="inline-flex p-4 bg-gray-50 rounded-2xl text-gray-300 mb-4">
                            <AlertCircle size={40} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">No Blogs Found</h2>
                        <p className="text-gray-400 font-medium">This user hasn't published any blogs yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserBlogsManager;