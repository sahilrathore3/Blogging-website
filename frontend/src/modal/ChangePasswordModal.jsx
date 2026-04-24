import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { changePasswordAction } from '../redux/thunk/userThunk';
import { toast } from 'react-toastify';


const ChangePasswordModal = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const { loading } = useSelector((state) => state.user);

    const formik = useFormik({
        initialValues: {
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
        validationSchema: Yup.object({
            oldPassword: Yup.string().required('Old password is required'),
            newPassword: Yup.string()
                .min(6, 'Password must be at least 6 characters')
                .required('New password is required'),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
                .required('Confirm password is required'),
        }),

        onSubmit: async (values, { resetForm }) => {
            try {
                // Thunk call kar rahe hain
                await dispatch(changePasswordAction({
                    oldPassword: values.oldPassword,
                    newPassword: values.newPassword
                })).unwrap();
                
                toast.success("Password changed successfully! 🚀");
                resetForm();
                onClose(); // Success ke baad modal close
            } catch (err) {
                toast.error(err || "Failed to change password");
            }
        },
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                <div className="p-8">
                    <h2 className="text-2xl font-black text-gray-800 mb-2">Change Password</h2>
                    <p className="text-gray-500 text-sm mb-6">Security maintain rakhne ke liye strong password use karein.</p>

                    <form onSubmit={formik.handleSubmit} className="space-y-4">
                        {/* Old Password */}
                        <div>
                            <input
                                type="password"
                                name="oldPassword"
                                placeholder="Current Password"
                                className={`w-full p-4 bg-gray-50 border ${formik.touched.oldPassword && formik.errors.oldPassword ? 'border-red-500' : 'border-gray-200'} rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
                                {...formik.getFieldProps('oldPassword')}
                            />
                            {formik.touched.oldPassword && formik.errors.oldPassword && (
                                <p className="text-red-500 text-xs mt-1 ml-2">{formik.errors.oldPassword}</p>
                            )}
                        </div>

                        {/* New Password */}
                        <div>
                            <input
                                type="password"
                                name="newPassword"
                                placeholder="New Password"
                                className={`w-full p-4 bg-gray-50 border ${formik.touched.newPassword && formik.errors.newPassword ? 'border-red-500' : 'border-gray-200'} rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
                                {...formik.getFieldProps('newPassword')}
                            />
                            {formik.touched.newPassword && formik.errors.newPassword && (
                                <p className="text-red-500 text-xs mt-1 ml-2">{formik.errors.newPassword}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm New Password"
                                className={`w-full p-4 bg-gray-50 border ${formik.touched.confirmPassword && formik.errors.confirmPassword ? 'border-red-500' : 'border-gray-200'} rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
                                {...formik.getFieldProps('confirmPassword')}
                            />
                            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                                <p className="text-red-500 text-xs mt-1 ml-2">{formik.errors.confirmPassword}</p>
                            )}
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-200 active:scale-95 disabled:bg-blue-300"
                            >
                                {loading ? "Updating..." : "Update"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChangePasswordModal;