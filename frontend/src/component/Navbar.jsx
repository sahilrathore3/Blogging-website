import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slice/authSlice';
import { toast } from 'react-toastify';
import { clearBlogStatus } from '../redux/slice/blogSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  const handleCreateClick = () => {
    if (user) {
      dispatch(clearBlogStatus());
      navigate("/create-blog");
    } else {
      toast.warn("Please Login first!");
      navigate("/login");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.info("Logged out successfully");
    navigate('/login');
  };

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white shadow-sm sticky top-0 z-50">
      {/* Logo */}
      <Link to="/" className="text-2xl font-black tracking-tighter text-blue-600">
        Blog<span className="text-gray-900">APP</span>
      </Link>

      {/* Navigation Links */}
      <div className="flex items-center space-x-6">
        <Link to="/" className="font-medium hover:text-blue-600 transition">Home</Link>


        {/* ✨ "Write Post" Button - Visible to everyone */}
        <button
          onClick={handleCreateClick}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition shadow-md active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span>Write Blog</span>
        </button>

        {user ? (
          <>
            {/* 🟢Agar Admin hai to Dashboard dikhega */}
            {user.role === 'admin' ? (
              <Link
                to="/dashboard"
                className="font-medium hover:text-blue-600 transition"
              >
                Dashboard
              </Link>
            ) : (
              /* 🔵 Agar Normal User hai to "My Profile" dikhega */
              <Link
                to="/profile"
                className="font-medium hover:text-blue-600 transition"
              >
                My Profile
              </Link>
            )}

            {/* User Info & Logout */}
            <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-200">
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-gray-700">
                  Hi, {user.username}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-100 transition"
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <div className="space-x-4">
            <Link to="/login" className="font-bold text-gray-700 hover:text-blue-600">Log In</Link>
            <Link
              to="/signup"
              className="px-5 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;