import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchRecentBlogs } from '../redux/thunk/blogThunk';
import ReactPaginateModule from 'react-paginate';
const ReactPaginate = ReactPaginateModule.default || ReactPaginateModule;
import { Link } from 'react-router-dom';

const AllBlogs = () => {
    const dispatch = useDispatch();

    // State safety: Default values set kar di hain taaki undefined ka error na aaye
    const { blogs = [], loading, pagination = {} } = useSelector((state) => state.blog);

    const itemsPerPage = 12;

    useEffect(() => {
        dispatch(fetchRecentBlogs({ page: 1, limit: itemsPerPage }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [dispatch]);

    const handlePageChange = (data) => {
        const selectedPage = data.selected + 1;
        dispatch(fetchRecentBlogs({ page: selectedPage, limit: itemsPerPage }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
// console.log("Check Pagination Object:", pagination);
// console.log("Type of ReactPaginate:", typeof ReactPaginate);
// console.log("Value of ReactPaginate:", ReactPaginate);
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-white">
                
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600 border-solid"></div>
                    <p className="text-gray-500 font-bold animate-pulse">Loading Archive...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-16">
            <div className="max-w-7xl mx-auto px-4">

                {/* Header Section */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tight">
                        Our <span className="text-indigo-600">Archive</span>
                    </h1>
                    {/* totalBlogs ka check safe kar diya */}
                    <p className="text-gray-500 text-lg">
                        Exploring {pagination?.totalBlogs || 0} stories across the platform
                    </p>
                </div>

                {/* --- Blogs Grid --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-15">
                    {/* Array.isArray check taaki map() crash na ho */}
                    {Array.isArray(blogs) && blogs.length > 0 ? (
                        blogs.map((blog) => (
                            <div key={blog._id} className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 group flex flex-col">
                                <div className="relative h-60 overflow-hidden">
                                    <img
                                        src={`http://localhost:3000${blog.coverImage}`}
                                        alt={blog.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        onError={(e) => { e.target.src = "https://placehold.co/600x400?text=No+Image"; }}
                                    />
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-indigo-600 shadow-sm">
                                        {blog.viewsCount || 0} Views
                                    </div>
                                </div>

                                <div className="p-8 flex-1 flex flex-col">
                                    <div className="flex items-center gap-3 mb-4">
                                        <img
                                            src={blog.authorId?.profilePic ? `http://localhost:3000${blog.authorId.profilePic}` : `https://ui-avatars.com/api/?name=${blog.authorId?.username}`}
                                            className="w-8 h-8 rounded-full object-cover border border-indigo-100"
                                            alt="author"
                                        />
                                        <span className="text-sm font-medium text-gray-600">
                                            {blog.authorId?.username || "Anonymous"}
                                        </span>
                                    </div>

                                    <h2 className="text-2xl font-bold mb-3 text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                        {blog.title}
                                    </h2>

                                    <p className="text-gray-500 leading-relaxed mb-6 line-clamp-2 text-sm flex-1">
                                        {blog.content ? blog.content.replace(/<[^>]*>/g, '').substring(0, 100) : "No content available..."}
                                    </p>

                                    <Link
                                        to={`/blog/${blog.slug}`}
                                        className="flex items-center justify-center w-full py-4 bg-gray-50 rounded-2xl font-black text-gray-900 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 mt-auto"
                                    >
                                        READ Full Blog
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                            <h3 className="text-2xl text-gray-400 italic">No blogs found in our records.</h3>
                        </div>
                    )}
                </div>

                {/* --- Pagination Section --- */}
                {/* Pagination tabhi dikhe jab totalPages > 1 ho */}
                {pagination?.totalPages > 1 && (
                    <div className="mt-20">
                        <ReactPaginate
                            previousLabel={"←"}
                            nextLabel={"→"}
                            breakLabel={"..."}
                            pageCount={pagination.totalPages}
                            marginPagesDisplayed={2}
                            pageRangeDisplayed={3}
                            onPageChange={handlePageChange}
                            containerClassName={"flex justify-center items-center gap-2"}
                            pageLinkClassName={"w-12 h-12 flex items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600 font-bold hover:border-indigo-600 hover:text-indigo-600 transition-all"}
                            activeLinkClassName={"!bg-indigo-600 !text-white !border-indigo-600 shadow-lg shadow-indigo-100"}
                            previousLinkClassName={"w-12 h-12 flex items-center justify-center rounded-2xl border border-gray-200 bg-white text-indigo-600 font-bold hover:bg-indigo-50 transition-all"}
                            nextLinkClassName={"w-12 h-12 flex items-center justify-center rounded-2xl border border-gray-200 bg-white text-indigo-600 font-bold hover:bg-indigo-50 transition-all"}
                            disabledClassName={"opacity-30 cursor-not-allowed"}
                            forcePage={(pagination.currentPage || 1) - 1}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllBlogs;