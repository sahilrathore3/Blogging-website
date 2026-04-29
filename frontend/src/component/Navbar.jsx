import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slice/authSlice';
import { toast } from 'react-toastify';
import { clearBlogStatus } from '../redux/slice/blogSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false); // Mobile menu state

  const { user } = useSelector((state) => state.auth);

  const handleCreateClick = () => {
    setIsOpen(false);
    if (user) {
      dispatch(clearBlogStatus());
      navigate("/create-blog");
    } else {
      toast.warn("Please Login first!");
      navigate("/login");
    }
  };

  const handleLogout = () => {
    setIsOpen(false);
    dispatch(logout());
    toast.info("Logged out successfully");
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* 1. Logo */}
          <Link to="/" className="text-2xl font-black tracking-tighter text-blue-600">
            Blog<span className="text-gray-900">APP</span>
          </Link>

          {/* 2. Desktop Navigation (Hidden on Mobile) */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="font-medium hover:text-blue-600 transition">Home</Link>

            <button
              onClick={handleCreateClick}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition shadow-md active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Write Blog</span>
            </button>

            {user ? (
              <div className="flex items-center space-x-4 border-l border-gray-200 pl-4">
                <Link to={user.role === 'admin' ? "/dashboard" : "/profile"} className="font-medium hover:text-blue-600 transition">
                  {user.role === 'admin' ? 'Dashboard' : 'My Profile'}
                </Link>
                <span className="text-sm font-semibold text-gray-700">Hi, {user.username}</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-100 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-x-4">
                <Link to="/login" className="font-bold text-gray-700 hover:text-blue-600">Log In</Link>
                <Link to="/signup" className="px-5 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* 3. Mobile Hamburger Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Mobile Menu Overlay (Visible only when isOpen is true) */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pt-2 pb-6 space-y-4 shadow-lg animate-in slide-in-from-top duration-300">
          <Link to="/" onClick={() => setIsOpen(false)} className="block py-2 font-medium text-gray-700">Home</Link>
          
          <button
            onClick={handleCreateClick}
            className="w-full flex justify-center items-center space-x-2 py-3 bg-blue-600 text-white font-bold rounded-xl"
          >
            <span>Write Blog</span>
          </button>

          {user ? (
            <div className="space-y-4 pt-2 border-t border-gray-100">
              <p className="text-center font-bold text-gray-500 uppercase text-xs tracking-widest">User Menu</p>
              <Link 
                to={user.role === 'admin' ? "/dashboard" : "/profile"} 
                onClick={() => setIsOpen(false)}
                className="block text-center py-2 font-bold text-gray-800"
              >
                {user.role === 'admin' ? 'Admin Dashboard' : 'View Profile'}
              </Link>
              <button
                onClick={handleLogout}
                className="w-full py-3 bg-red-50 text-red-600 font-black rounded-xl"
              >
                Logout ({user.username})
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 pt-2">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="py-3 text-center font-bold text-gray-700 border border-gray-200 rounded-xl"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                onClick={() => setIsOpen(false)}
                className="py-3 text-center font-bold bg-blue-600 text-white rounded-xl"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;