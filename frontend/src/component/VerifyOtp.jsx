import React, { useRef, useEffect } from 'react';
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
    const inputRefs = useRef([]);

    const formik = useFormik({
        initialValues: { otp: Array(6).fill("") }, // 6 empty strings ka array
        validationSchema: Yup.object({
            otp: Yup.array()
                .of(Yup.string().required("").matches(/^[0-9]$/, ""))
                .length(6, "Enter all digits"),
        }),
        onSubmit: async (values) => {
            const finalOtp = values.otp.join("");
            if (!email) {
                toast.error("Email not found. Please signup again.");
                return;
            }

            try {
                await dispatch(verifyOtpAndSignup({ 
                    email, 
                    otpCode: finalOtp 
                })).unwrap();
                
                toast.success("Account Verified! You can now login.");
                navigate('/login');
            } catch (error) {
                toast.error(error || "Verification Failed");
            } 
        },
    });

    // Handle Input Change
    const handleChange = (e, index) => {
        const value = e.target.value;
        if (isNaN(value)) return; // Only numbers allowed

        const newOtp = [...formik.values.otp];
        // Sirf last character lena agar user ne multiple characters type kiye hon
        newOtp[index] = value.substring(value.length - 1);
        formik.setFieldValue("otp", newOtp);

        // Move to next box
        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    // Handle Backspace
    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !formik.values.otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    // Handle Paste (Bonus Feature)
    const handlePaste = (e) => {
        const pasteData = e.clipboardData.getData("text").slice(0, 6).split("");
        if (pasteData.every(char => !isNaN(char))) {
            const newOtp = [...formik.values.otp];
            pasteData.forEach((char, index) => {
                newOtp[index] = char;
            });
            formik.setFieldValue("otp", newOtp);
            // Focus last filled box
            inputRefs.current[Math.min(pasteData.length - 1, 5)].focus();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-2xl">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-black text-gray-900 mb-3">Security Code</h2>
                    <p className="text-gray-500 text-sm">
                        Sent to <span className="font-bold text-blue-600">{email || "your email"}</span>
                    </p>
                </div>

                <form onSubmit={formik.handleSubmit} className="space-y-8">
                    <div className="flex justify-between gap-2" onPaste={handlePaste}>
                        {formik.values.otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handleChange(e, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                className={`w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-black border-2 rounded-2xl focus:outline-none transition-all
                                    ${formik.errors.otp && formik.touched.otp 
                                        ? 'border-red-500 bg-red-50' 
                                        : 'border-gray-100 bg-gray-50 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100'
                                    }`}
                            />
                        ))}
                    </div>

                    {formik.touched.otp && typeof formik.errors.otp === 'string' && (
                        <p className="text-red-500 text-xs text-center font-bold">{formik.errors.otp}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading || formik.values.otp.some(v => v === "")}
                        className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all transform hover:scale-[1.02] active:scale-95 disabled:bg-gray-300 disabled:transform-none shadow-xl flex items-center justify-center gap-3"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Verifying...</span>
                            </>
                        ) : "Verify Account"}
                    </button>

                    <div className="text-center">
                        <button type="button" className="text-sm font-bold text-blue-600 hover:underline">
                            Resend Code
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VerifyOtp;