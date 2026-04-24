import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { verifyOtpAndSignup } from '../redux/thunk/authThunk';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

const VerifyOtp = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { loading } = useSelector((state) => state.auth);
    
    const email = location.state?.email; 

    const formik = useFormik({
        initialValues: { otp: '' },
        validationSchema: Yup.object({
            otp: Yup.string().length(6, 'OTP must be 6 digits').required('Required'),
        }),
        onSubmit: async (values) => {
            if (!email) {
                toast.error("Email not found. Please signup again.");
                return;
            }

            try {
                // .unwrap() use karne se aapko match() ki zaroorat nahi padegi
                // Seedha success data milega ya catch block mein error jayega
                await dispatch(verifyOtpAndSignup({ 
                    email, 
                    otpCode: values.otp 
                })).unwrap();
                
                toast.success("Account Verified! You can now login.");
                navigate('/login');
            } catch (error) {
                // Backend ka 500 ya 400 error yahan handle hoga
                toast.error(error || "Verification Failed");
            } 
        },
    });

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-bold text-center mb-2">Verify Your Email</h2>
                <p className="text-center text-gray-500 mb-8 text-sm">
                    Enter the 6-digit code sent to <br />
                    <span className="font-bold text-gray-800">{email || "your email"}</span>
                </p>

                <form onSubmit={formik.handleSubmit} className="space-y-6">
                    <div>
                        <input
                            type="text"
                            maxLength="6"
                            placeholder="000000"
                            className={`w-full px-4 py-4 text-center text-2xl tracking-[1em] font-bold border-2 rounded-xl focus:outline-none transition 
                                ${formik.touched.otp && formik.errors.otp ? 'border-red-500' : 'border-gray-200 focus:border-blue-600'}`}
                            {...formik.getFieldProps('otp')}
                        />
                        {formik.touched.otp && formik.errors.otp && (
                            <p className="text-red-500 text-xs mt-2 text-center">{formik.errors.otp}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition disabled:bg-gray-400 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Verifying...</span>
                            </>
                        ) : "Verify OTP"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default VerifyOtp;