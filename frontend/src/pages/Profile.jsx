import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMyProfile } from '../redux/thunk/userThunk';
import { Link ,useNavigate} from 'react-router-dom';
import UserFormModal from '../modal/UserFormModal';
import ChangePasswordModal from '../modal/ChangePasswordModal'; 
import { fetchMyBlogs , deleteBlog , updateBlog } from '../redux/thunk/blogThunk';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { clearBlogStatus } from '../redux/slice/blogSlice';


const Profile = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const base_url = "http://localhost:3000";
    
    const { profile, loading: userLoading } = useSelector((state) => state.user);
    const { myBlogs, loading: blogLoading } = useSelector((state) => state.blog);
    
    const user = profile?.data || profile; 

    const [currentPage, setCurrentPage] = useState(1);
    const blogsPerPage = 5;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    useEffect(() => {
        dispatch(clearBlogStatus())
        dispatch(fetchMyProfile());
        dispatch(fetchMyBlogs());
    }, [dispatch]);

    //  DELETE Blog
    const handleDelete = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ec1313', 
            cancelButtonColor:'#4f46e5' , 
            confirmButtonText: 'Yes, delete it!',
            background: '#ffffff',
            borderRadius: '1.5rem'
        }).then((result) => {
            if (result.isConfirmed) {
                dispatch(deleteBlog(id)).unwrap()
                    .then(() => {
                        Swal.fire({
                            title: 'Deleted!',
                            text: 'Your blog has been removed.',
                            icon: 'success',
                            borderRadius: '1.5rem',
                            confirmButtonColor: '#4f46e5'
                        });
                    })
                    .catch((err) => toast.error(err));
            }
        });
    };

    //  TOGGLE STATUS HANDLER
    const handleToggleStatus = (blog) => {
        const newStatus = blog.status === 'published' ? 'draft' : 'published';
        const formData = new FormData();
        formData.append('status', newStatus);

        dispatch(updateBlog({ id: blog._id, formData }))
            .unwrap()
            .then(() => toast.info(`Status changed to ${newStatus}`))
            .catch(() => toast.error("Failed to update status"));
    };

    const allMyBlogs = Array.isArray(myBlogs) ? myBlogs : []; 
    const indexOfLastBlog = currentPage * blogsPerPage;
    const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
    const currentBlogs = allMyBlogs.slice(indexOfFirstBlog, indexOfLastBlog);
    const totalPages = Math.ceil(allMyBlogs.length / blogsPerPage);

    const formatDate = (date) => {
        if (!date) return 'Not Set';
        return new Date(date).toLocaleDateString('en-US', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
    };

    if (userLoading && !user) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-10 px-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 border border-gray-100 overflow-hidden">
                
                {/* Header Section */}
                <div className="h-56 bg-gradient-to-br from-indigo-700 via-blue-600 to-cyan-500 relative">
                    <div className="absolute -bottom-16 left-10 flex items-end gap-6">
                        <div className="relative">
                            <img 
                                src={user?.profilePic?.startsWith('http') ? user.profilePic : `${base_url}${user?.profilePic}`} 
                                onError={(e) => { e.target.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' }}
                                alt="Avatar" 
                                className="w-44 h-44 rounded-[2rem] border-8 border-white object-cover shadow-2xl bg-gray-50"
                            />
                            <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
                        </div>
                        <div className="mb-4">
                            <h1 className="text-4xl font-black text-black drop-shadow-lg tracking-tight">
                                {user?.firstName ? `${user.firstName} ${user.lastName}` : user?.username || "Guest User"}
                            </h1>
                        </div>
                    </div>
                </div>

                <div className="mt-24 px-6 md:px-12 pb-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        
                        <div className="lg:col-span-2 space-y-10">
                            {/* Account Details */}
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                                    <span className="w-2.5 h-8 bg-indigo-600 rounded-full"></span>
                                    Account Overview
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50/50 p-8 rounded-[2rem] border border-gray-100">
                                    <DetailItem label="First Name" value={user?.firstName} />
                                    <DetailItem label="Last Name" value={user?.lastName} />
                                    <DetailItem label="Username" value={user?.username} />
                                    <DetailItem label="Email Address" value={user?.email} />
                                    <DetailItem label="Gender" value={user?.gender} isTag />
                                    <DetailItem label="Country" value={user?.country} />
                                    <DetailItem label="Date of Birth" value={formatDate(user?.dob)} />
                                    <DetailItem label="Status" value={user?.isVerified ? "Verified" : "Pending"} isTag color={user?.isVerified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"} />
                                </div>
                            </div>

                            {/* Bio Section */}
                            <div className="bg-indigo-50/40 p-8 rounded-[2rem] border border-indigo-100/50">
                                <h3 className="text-xs font-black text-indigo-900 uppercase tracking-[0.2em] mb-4">Bio </h3>
                                <p className="text-gray-700 leading-relaxed text-xl font-medium italic">
                                    "{user?.bio || "No bio available. Add one!"}"
                                </p>
                            </div>

                            {/* My Blogs Section */}
                            <div className="pt-10 border-t border-gray-100">
                                <h3 className="text-2xl font-black text-gray-900 mb-6">My Blogs</h3>
                                {blogLoading ? (
                                    <p>Loading blogs...</p>
                                ) : (
                                    <div className="space-y-4">
                                        {currentBlogs?.length > 0 ? (
                                            currentBlogs.map((blog) => (
                                                <div key={blog._id} className="group bg-white p-4 rounded-[1.5rem] border border-gray-100 shadow-sm flex justify-between items-center transition-all hover:shadow-md">
                                                    <div className="flex gap-4 items-center">
                                                        <img src={`${base_url}${blog.coverImage}`} className="w-20 h-20 rounded-xl object-cover" alt="cover" />
                                                        <div>
                                                            <Link to={`/blog/${blog._id}`} className="font-bold text-lg hover:text-indigo-600 block">{blog.title}</Link>
                                                            <div className="flex items-center gap-2">
                                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${blog.status === 'published' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                                                    {blog.status}
                                                                </span>
                                                                <p className="text-xs text-gray-400">{new Date(blog.createdAt).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* ✨ NEW: Action Buttons */}
                                                    <div className="flex gap-2">
                                                        <button onClick={() => {dispatch(clearBlogStatus()), navigate(`/edit-blog/${blog._id}`)}} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                        </button>
                                                        <button onClick={() => handleToggleStatus(blog)} className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-600 hover:text-white transition">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                        </button>
                                                        <button onClick={() => handleDelete(blog._id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-400 italic">No blogs found.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions Side Column */}
                        <div className="space-y-6">
                            <button onClick={() => setIsModalOpen(true)} className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 transition active:scale-95">EDIT PROFILE</button>
                            <button onClick={() => setIsPasswordModalOpen(true)} className="w-full py-5 bg-gray-900 text-white font-black rounded-2xl hover:bg-black transition active:scale-95">CHANGE PASSWORD</button>
                        </div>

                    </div>
                </div>
            </div>

            <UserFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} initialData={user} isAdminMode={false} />
            <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />
        </div>
    );
};

const DetailItem = ({ label, value, isTag, color = "bg-indigo-100 text-indigo-700" }) => (
    <div className="group">
        <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">{label}</label>
        {isTag ? (
            <span className={`px-3 py-1 rounded-lg text-[11px] font-black uppercase ${color}`}>{value || 'N/A'}</span>
        ) : (
            <p className="text-gray-900 font-extrabold text-md">{value || '---'}</p>
        )}
    </div>
);

export default Profile;