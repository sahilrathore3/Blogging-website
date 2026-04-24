import React, { useState } from 'react';
import { useFormik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { signup } from '../redux/thunk/authThunk';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import signupSchema from '../validation/signupSchema';

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const formik = useFormik({
    initialValues: {
      username: "",
      email: "",
      password: ""
    },
    validationSchema: signupSchema,

    onSubmit: async (values, { resetForm }) => {
      try {
        await dispatch(signup(values)).unwrap();
        toast.success("OTP sent! Please check your email.");
        navigate("/verifyandsignup", { state: { email: values.email } });
        resetForm();
      } catch (error) {
        toast.error(error || "Registration failed. Please try again.");
      } 
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-5">
          {/* Username */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
            <input
              type="text"
              className={`w-full px-4 py-3 rounded-xl border transition-all outline-none focus:ring-2 
                ${formik.touched.username && formik.errors.username ? 'border-red-500 focus:ring-red-100' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500'}`}
              placeholder="sahil_rathore"
              {...formik.getFieldProps('username')}
            />
            {formik.touched.username && formik.errors.username && (
              <p className="mt-1 text-xs text-red-500 font-medium">{formik.errors.username}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              className={`w-full px-4 py-3 rounded-xl border transition-all outline-none focus:ring-2 
                ${formik.touched.email && formik.errors.email ? 'border-red-500 focus:ring-red-100' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500'}`}
              placeholder="sahil@example.com"
              {...formik.getFieldProps('email')}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="mt-1 text-xs text-red-500 font-medium">{formik.errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className={`w-full px-4 py-3 rounded-xl border transition-all outline-none focus:ring-2 
                  ${formik.touched.password && formik.errors.password ? 'border-red-500 focus:ring-red-100' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500'}`}
                placeholder="••••••••"
                {...formik.getFieldProps('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-600 uppercase"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {formik.touched.password && formik.errors.password && (
              <p className="mt-1 text-xs text-red-500 font-medium">{formik.errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-100 transition-all active:scale-[0.98] disabled:opacity-70 mt-2"
          >
            { loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Registering...</span>
              </div>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-green-600 font-bold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;