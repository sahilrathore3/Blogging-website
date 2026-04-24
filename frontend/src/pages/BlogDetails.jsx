import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlogById } from '../redux/thunk/blogThunk';

const BlogDetails = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    
    const { singleBlog, isFullContent, loading, error } = useSelector((state) => state.blog);
    
    const base_url = "http://localhost:3000";

    useEffect(() => {
        if (id) {
            dispatch(fetchBlogById(id));
        }
        // Scroll to top when opening a new blog
        window.scrollTo(0, 0);
    }, [dispatch, id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                <span className="ml-3 font-bold text-gray-600">Loading Story...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-20 text-center">
                <h2 className="text-2xl font-bold text-red-500">Error</h2>
                <p className="text-gray-600">{error}</p>
                <Link to="/" className="text-blue-600 underline mt-4 inline-block">Back to Home</Link>
            </div>
        );
    }

    if (!singleBlog) return null;

    return (
        <div className="bg-white min-h-screen pb-20">
            {/* Main Content Container */}
            <article className="max-w-3xl mx-auto px-6 pt-12">
                
                {/* Category & Title */}
                <div className="mb-8">
                    <span className="text-blue-600 font-bold text-xs uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
                        {singleBlog.category || "Trending"}
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mt-6 leading-[1.1] tracking-tight">
                        {singleBlog.title}
                    </h1>
                </div>

                {/* Author Info Section */}
                <div className="flex items-center justify-between mb-10 py-6 border-y border-gray-100">
                    <div className="flex items-center gap-3">
                        <img 
                            src={singleBlog.authorId?.profilePic ? `${base_url}${singleBlog.authorId.profilePic}` : `https://ui-avatars.com/api/?name=${singleBlog.authorId?.username || 'User'}`} 
                            className="w-12 h-12 rounded-full object-cover border border-gray-200" 
                            alt="author"
                        />
                        <div>
                            <p className="text-sm font-bold text-gray-900">{singleBlog.authorId?.username || "Unknown Author"}</p>
                            <p className="text-xs text-gray-500 font-medium">
                                {new Date(singleBlog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                        <span className="text-xs font-bold">{singleBlog.viewsCount}</span>
                    </div>
                </div>

                {/* Main Cover Image */}
                <figure className="mb-12">
                    <img 
                        src={`${base_url}${singleBlog.coverImage}`} 
                        className="w-full rounded-3xl object-cover shadow-lg max-h-[500px]" 
                        alt="blog cover"
                    />
                </figure>

                {/* Blog Text Content */}
                <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed font-serif text-xl whitespace-pre-line">
                    {singleBlog.content}
                </div>

                {/* 🔒 Paywall Overlay (Based on your Backend Logic) */}
                {!isFullContent && (
                    <div className="relative mt-[-150px] pt-[200px] pb-10 bg-gradient-to-t from-white via-white/98 to-transparent text-center">
                        <div className="bg-gray-900 text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                            {/* Decorative element */}
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.5h7c-.47 4.14-3.1 7.91-7 9.12V11.5H5V6.3l7-3.11v8.31z"/></svg>
                            </div>
                            
                            <h3 className="text-3xl font-black mb-4">Read the full story.</h3>
                            <p className="text-gray-400 mb-8 max-w-md mx-auto text-lg">
                                You're reading a preview. Sign up or login to unlock the complete article and join the discussion.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                                <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-full font-bold transition transform hover:scale-105 shadow-lg">
                                    Login to Read More
                                </Link>
                                <Link to="/signup" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-10 py-4 rounded-full font-bold transition">
                                    Create Account
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

            </article>
            
            {/* Footer space */}
            <div className="mt-20 border-t border-gray-100 pt-10 text-center">
                <Link to="/" className="text-sm font-bold text-gray-400 hover:text-blue-600 transition tracking-widest uppercase">
                    ← Back to all stories
                </Link>
            </div>
        </div>
    );
};

export default BlogDetails;