import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../redux/thunk/authThunk';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { loginSchema }from '../validation/loginSchema';
import VerifyModal from '../modal/VerifyModal';


const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [tempEmail, setTempEmail] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, token } = useSelector((state) => state.auth);
  useEffect(() => {
    if (token) return navigate("/");
  }, [token, navigate])

  const formik = useFormik({
    initialValues: {
      email: "",
      password: ""
    },

    validationSchema: loginSchema,

    onSubmit: async (values, { resetForm }) => {
      try {
        const result = await dispatch(login(values)).unwrap();
        // console.log("Login Success Data:", result);
        console.log("User Role:", result.user.role);
        toast.success("Welcome Back!");
        
        if(result.user && result.user.role === 'admin'){
          navigate('/dashboard');
        } else{
          navigate('/profile');
        }
        resetForm();

      } catch (error) {
        const errorMessage = error.toLowerCase()
        // toast.error(error || "Login failed. Please check your credentials.");
        if (errorMessage.includes("verify") || errorMessage.includes("verified")) {
          setTempEmail(values.email);
          setIsVerifyModalOpen(true);
          toast.info("Account not verified. OTP sent to your email!");
        } else {
          toast.error(error || "Login failed.");
        }
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-500 mt-2">Please enter your details to sign in</p>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              className={`w-full px-4 py-3 rounded-xl border transition-all outline-none focus:ring-2 
                ${formik.touched.email && formik.errors.email ? 'border-red-500 focus:ring-red-100' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500'}`}
              placeholder="name@company.com"
              {...formik.getFieldProps('email')}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="mt-1 text-xs text-red-500 font-medium">{formik.errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className={`w-full px-4 py-3 rounded-xl border transition-all outline-none focus:ring-2 
                  ${formik.touched.password && formik.errors.password ? 'border-red-500 focus:ring-red-100' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500'}`}
                placeholder="••••••••"
                {...formik.getFieldProps('password')}
              />
              {/* Toggle button using simple Text */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wider"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {formik.touched.password && formik.errors.password && (
              <p className="mt-1 text-xs text-red-500 font-medium">{formik.errors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                {/* CSS only spinner */}
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 font-bold hover:underline">Create one</Link>
        </p>
      </div>
      {isVerifyModalOpen && (
        <VerifyModal 
          isOpen={isVerifyModalOpen} 
          email={tempEmail} 
          onClose={() => setIsVerifyModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default Login;





