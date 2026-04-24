import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { verifyOtpAndSignup, resendVerificationOTP } from '../redux/thunk/authThunk';
import { toast } from 'react-toastify';

const VerifyModal = ({ isOpen, email, onClose }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  const formik = useFormik({
    initialValues: { otpCode: '' },
    validationSchema: Yup.object({
      otpCode: Yup.string().length(6, "Must be 6 digits").required("Required"),
    }),
    onSubmit: async (values) => {
      try {
        // Aapka existing Signup wala logic yahan verify kar dega
        await dispatch(verifyOtpAndSignup({ 
            email: email, 
            otpCode: values.otpCode 
        })).unwrap();
        
        toast.success("Account verified! Now you can login.");
        onClose();
      } catch (err) {
        toast.error(err || "Invalid OTP");
      }
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white p-8 rounded-3xl w-full max-w-sm shadow-2xl text-center">
        <h2 className="text-2xl font-bold text-gray-900">Verify Email</h2>
        <p className="text-gray-500 text-sm mt-2 mb-6">Enter the 6-digit code sent to <br/><b>{email}</b></p>
        
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <input
            name="otpCode"
            maxLength="6"
            {...formik.getFieldProps('otpCode')}
            className="w-full text-center py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-2xl font-bold focus:border-blue-500 outline-none transition-all"
            placeholder="000000"
          />
          {formik.touched.otpCode && formik.errors.otpCode && (
             <p className="text-red-500 text-xs font-bold">{formik.errors.otpCode}</p>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all"
          >
            {loading ? "Verifying..." : "Verify Now"}
          </button>
        </form>

        <button 
          onClick={() => dispatch(resendVerificationOTP(email)).unwrap().then(() => toast.success("OTP Sent!"))}
          className="mt-6 text-sm font-bold text-blue-600 hover:underline block w-full"
        >
          Resend OTP
        </button>
      </div>
    </div>
  );
};

export default VerifyModal;