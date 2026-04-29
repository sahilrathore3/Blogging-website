import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlogBySlug } from '../redux/thunk/blogThunk';
import CommentSection from './CommentSection';

const BlogDetails = () => {
    const { slug } = useParams();
    const dispatch = useDispatch();

    const { singleBlog, isFullContent, loading, error } = useSelector((state) => state.blog);
    const base_url = "http://localhost:3000";

    useEffect(() => {
        if (slug) {
            dispatch(fetchBlogBySlug(slug));
        }
        window.scrollTo(0, 0);
    }, [dispatch, slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                <span className="ml-3 font-bold text-gray-600">Loading Story...</span>
            </div>
        );
    }

    if (error || !singleBlog) {
        return (
            <div className="py-20 text-center">
                <h2 className="text-2xl font-bold text-red-500">Notice</h2>
                <p className="text-gray-600">{error || "Data not found"}</p>
                <Link to="/" className="text-blue-600 underline mt-4 inline-block">Back to Home</Link>
            </div>
        );
    }

    // Logic to split content into two parts
    const fullText = singleBlog.content || "";
    const words = fullText.split(" ");
    const midPoint = Math.floor(words.length / 2);

    const firstHalf = words.slice(0, midPoint).join(" ");
    const secondHalf = words.slice(midPoint).join(" ");

    return (
        <div className="bg-white min-h-screen pb-20 font-sans">
            <article className="max-w-3xl mx-auto px-6 pt-12">

                {/* 1. Header: Title & Category */}
                <div className="mb-8">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight tracking-tight">
                        {singleBlog.title}
                    </h1>
                    <span className="text-blue-600 font-bold text-xs uppercase tracking-widest bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">
                        {singleBlog.category || "Trending"}
                    </span>
                </div>

                {/* 2. Author Info */}
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
                    {/* VIEWS SECTION - Is hisse ko dhyan se check karein */}
                    <div className="flex items-center gap-2 text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span className="text-sm font-bold">
                            {singleBlog.viewsCount || singleBlog.views || 0}
                        </span>
                    </div>
                </div>

                {/* 3. PEHLE: Cover Image */}
                <figure className="mb-10">
                    <img
                        src={`${base_url}${singleBlog.coverImage}`}
                        className="w-full rounded-[2rem] object-cover shadow-2xl max-h-[550px]"
                        alt="blog cover"
                    />
                </figure>

                {/* 4. PHIR: Kuch Blog Text (First Half) */}
                <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed font-serif text-xl whitespace-pre-line mb-10">
                    {firstHalf}...
                </div>

                {/* 5. PHIR: Baki Images (Gallery) */}
                {singleBlog.images && singleBlog.images.length > 0 && (
                    <div className="my-14 space-y-6">
                        <div className="flex items-center gap-4 mb-8">
                            <span className="h-[1px] flex-1 bg-gray-100"></span>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Visual Highlights</span>
                            <span className="h-[1px] flex-1 bg-gray-100"></span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {singleBlog.images.map((img, index) => (
                                <div key={index} className="overflow-hidden rounded-[1.5rem] shadow-xl group bg-gray-50">
                                    <img
                                        src={`${base_url}${img}`}
                                        alt={`visual-${index}`}
                                        className="w-full h-72 object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 6. PHIR: Baki Ka Text (Second Half) */}
                {isFullContent && (
                    <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed font-serif text-xl whitespace-pre-line mt-10">
                        {secondHalf}
                    </div>
                )}

                {/* 7. Paywall Overlay */}
                {!isFullContent && (
                    <div className="relative mt-[-100px] pt-[150px] pb-10 bg-gradient-to-t from-white via-white/95 to-transparent text-center">
                        <div className="bg-gray-900 text-white p-12 rounded-[3rem] shadow-2xl">
                            <h3 className="text-3xl font-black mb-4 italic uppercase">Keep Reading...</h3>
                            <p className="text-gray-400 mb-8 max-w-md mx-auto">
                                Join our community to unlock the full depth of this story and access exclusive content.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-full font-bold transition-all shadow-lg hover:-translate-y-1">
                                    Login to Continue
                                </Link>
                                <Link to="/signup" className="bg-white/5 hover:bg-white/10 text-white border border-white/20 px-10 py-4 rounded-full font-bold transition-all">
                                    Create Free Account
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* 8. Comments */}
                {isFullContent && (
                    <div className="mt-20 border-t border-gray-100 pt-10">
                        <CommentSection blogId={singleBlog._id} />
                    </div>
                )}

            </article>

            <div className="mt-2 py-10 border-t border-gray-50 text-center">
                <Link to="/" className="text-xs font-black text-gray-400 hover:text-blue-600 transition-all tracking-[0.3em] uppercase underline-offset-8 hover:underline">
                    ← Return to Feed
                </Link>
            </div>
        </div>
    );
};

export default BlogDetails;