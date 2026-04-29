import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchRecentBlogs } from '../redux/thunk/blogThunk';
import ReactPaginateModule from 'react-paginate';
const ReactPaginate = ReactPaginateModule.default || ReactPaginateModule;
import { Link } from 'react-router-dom';

const AllBlogs = () => {
    const dispatch = useDispatch();

    // Redux State
    const { blogs = [], loading, pagination = {} } = useSelector((state) => state.blog);

    // --- Local States for Filtering ---
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategories, setSelectedCategories] = useState([]);

    const itemsPerPage = 12;

    // Hardcoded categories (Aap inhe backend se bhi fetch kar sakte hain)
    const categories = ["Food", "Travel", "Sports", "Health & Fitness", "Technology", "Science", "Lifestyle", "Fashion & Beauty", "DIY Craft", "Parenting", "Business", "Other"];

    useEffect(() => {
        dispatch(fetchRecentBlogs({ page: 1, limit: itemsPerPage }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [dispatch]);

    const handlePageChange = (data) => {
        const selectedPage = data.selected + 1;
        dispatch(fetchRecentBlogs({ page: selectedPage, limit: itemsPerPage }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // --- Category Toggle Logic ---
    const toggleCategory = (category) => {
        if (selectedCategories.includes(category)) {
            setSelectedCategories(selectedCategories.filter(c => c !== category));
        } else {
            setSelectedCategories([...selectedCategories, category]);
        }
    };

    // --- Combined Filter Logic ---
    const filteredBlogs = blogs.filter((blog) => {
        const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(blog.category);
        return matchesSearch && matchesCategory;
    });

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
                <div className="text-center mb-10">
                    <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tight">
                        Our <span className="text-indigo-600">Archive</span>
                    </h1>
                </div>

                {/* --- SEARCH & FILTER SECTION --- */}
                <div className="max-w-3xl mx-auto mb-12">
                    {/* Search Bar */}
                    <div className="relative mb-6">
                        <span className="absolute inset-y-0 left-5 flex items-center text-gray-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Search blogs by title..."
                            className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-3xl shadow-sm focus:ring-4 focus:ring-indigo-50 outline-none transition-all text-gray-700"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Category Pills (Multi-select) */}
                    <div className="flex flex-wrap justify-center gap-2">
                        <button
                            onClick={() => setSelectedCategories([])}
                            className={`px-5 py-2 rounded-full text-xs font-bold transition-all border ${selectedCategories.length === 0 ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white text-gray-500 border-gray-100 hover:border-indigo-200'}`}
                        >
                            ALL
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => toggleCategory(cat)}
                                className={`px-5 py-2 rounded-full text-xs font-bold transition-all border ${selectedCategories.includes(cat) ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white text-gray-500 border-gray-100 hover:border-indigo-200'}`}
                            >
                                {cat.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- Blogs Grid --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {filteredBlogs.length > 0 ? (
                        filteredBlogs.map((blog) => (
                            <div key={blog._id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 group flex flex-col h-full">
                                <div className="relative h-64 overflow-hidden">
                                    <img
                                        src={`http://localhost:3000${blog.coverImage}`}
                                        alt={blog.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        onError={(e) => { e.target.src = "https://placehold.co/600x400?text=No+Image"; }}
                                    />
                                    <div className="absolute top-5 left-5 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black text-indigo-600 uppercase tracking-widest shadow-sm">
                                        {blog.category || "General"}
                                    </div>

                                    {/* --- VIEWS COUNTER (Ye wala section check karein) --- */}
                                    <div className="absolute top-5 right-5 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white shadow-sm flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        {blog.viewsCount || 0}
                                    </div>
                                </div>

                                <div className="p-8 flex-1 flex flex-col">
                                    <div className="flex items-center gap-3 mb-4">
                                        <img
                                            src={blog.authorId?.profilePic ? `http://localhost:3000${blog.authorId.profilePic}` : `https://ui-avatars.com/api/?name=${blog.authorId?.username}`}
                                            className="w-7 h-7 rounded-full object-cover border border-indigo-100"
                                            alt="author"
                                        />
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-tight">
                                            {blog.authorId?.username || "Anonymous"}
                                        </span>
                                    </div>

                                    <h2 className="text-xl font-black mb-3 text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-tight">
                                        {blog.title}
                                    </h2>

                                    <p className="text-gray-500 leading-relaxed mb-6 line-clamp-2 text-sm flex-1">
                                        {blog.content ? blog.content.replace(/<[^>]*>/g, '').substring(0, 120) : "No content available..."}
                                    </p>

                                    <Link
                                        to={`/blog/${blog.slug}`}
                                        className="flex items-center justify-center w-full py-4 bg-gray-50 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-900 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 mt-auto"
                                    >
                                        READ STORY
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                            <h3 className="text-xl font-bold text-gray-300 italic">No matches found for your search or filters.</h3>
                            <button onClick={() => { setSearchQuery(""); setSelectedCategories([]); }} className="mt-4 text-indigo-600 font-bold hover:underline">Clear all filters</button>
                        </div>
                    )}
                </div>

                {/* --- Pagination Section --- */}
                {pagination?.totalPages > 1 && searchQuery === "" && selectedCategories.length === 0 && (
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