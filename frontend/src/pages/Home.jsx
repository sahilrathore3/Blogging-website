import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecentBlogs } from '../redux/thunk/blogThunk';

const Home = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { blogs, loading } = useSelector((state) => state.blog);

  // Backend Base URL
  const base_url = "http://localhost:3000";

  useEffect(() => {
    // Home page ke liye top 10 trending blogs
    dispatch(fetchRecentBlogs({ page: 1, limit: 10,sort: "views" }));
  }, [dispatch]);

  return (
    <div className="bg-white min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative px-6 py-24 bg-gradient-to-b from-blue-50 to-white overflow-hidden text-center">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-6xl font-black tracking-tighter text-gray-900 sm:text-8xl mb-6">
            Stay <span className="text-blue-600">Curious.</span>
          </h1>
          <p className="text-lg font-medium text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Discover stories, thinking, and expertise from writers on any topic. 
            The top 10 most trending stories, updated in real-time.
          </p>

          {!user && (
            <Link
              to="/signup"
              className="rounded-full bg-gray-900 px-10 py-4 text-lg font-bold text-white hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl inline-block"
            >
              Start Reading
            </Link>
          )}
        </div>
      </section>

      {/* 2. Trending Blogs Section */}
      <section className="py-16 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-14 border-b border-gray-100 pb-6">
          <div className="p-3 bg-blue-600 rounded-full text-white shadow-lg shadow-blue-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            </svg>
          </div>
          <h2 className="text-2xl font-black uppercase tracking-widest text-gray-800">
            Trending on BlogApp
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4 animate-pulse">
                <div className="bg-gray-200 aspect-video rounded-2xl"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
              {blogs && blogs.map((blog, index) => (
                <div key={blog._id} className="flex flex-col group cursor-pointer">
                  
                  {/* 🖼️ 1. Cover Image */}
                  <div className="relative mb-6 overflow-hidden rounded-2xl aspect-video bg-gray-100 shadow-sm border border-gray-50">
                    <img 
                      src={`${base_url}${blog.coverImage}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      alt="blog cover"
                      onError={(e) => { e.target.src = "https://placehold.co/600x400?text=Blog+Cover"; }}
                    />
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-3 py-1 rounded-full shadow-md">
                      <span className="text-sm font-black text-blue-600">0{index + 1}</span>
                    </div>
                  </div>

                  {/* 👤 2. Author Info */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-full bg-gray-100 border border-gray-200 overflow-hidden">
                      <img 
                        src={blog.authorId?.profilePic ? `${base_url}${blog.authorId.profilePic}` : `https://ui-avatars.com/api/?name=${blog.authorId?.username}&background=random`} 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition duration-300" 
                        alt={blog.authorId?.username}
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-800 tracking-tight">{blog.authorId?.username || "Anonymous"}</span>
                  </div>

                  {/* 📝 3. Title & Excerpt */}
                  <Link to={`/blog/${blog._id}`} className="flex-1">
                    <h3 className="font-extrabold text-xl leading-tight text-gray-900 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2 mb-3">
                      {blog.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-3 font-medium leading-relaxed">
                      {blog.content.replace(/<[^>]*>/g, '')}
                    </p>
                  </Link>

                  {/* 📊 4. Meta Info */}
                  <div className="flex items-center gap-4 mt-6 pt-5 border-t border-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">
                    <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span className="text-gray-200">•</span>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {blog.viewsCount}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* ✨ 5. View All Blogs Button (Added Here) ✨ */}
            <div className="mt-24 text-center">
              <Link
                to="/all-blogs"
                className="group relative inline-flex items-center gap-3 px-12 py-5 bg-white border-2 border-gray-900 rounded-full font-black text-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-300 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]"
              >
                <span className="text-lg uppercase tracking-wider">Explore All Stories</span>
                <svg 
                  className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="3" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <p className="mt-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">
                 Browse through our full library
              </p>
            </div>
          </>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-black-100 py-16 mt-20 text-center">
        <p className="text-black text-[10px] font-bold uppercase tracking-[0.2em]">
          © 2026 BlogApp • Stay Informed • Built with Passion 
        </p>
      </footer>
    </div>
  );
};

export default Home;