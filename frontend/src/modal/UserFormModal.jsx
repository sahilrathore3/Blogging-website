import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import { X, Upload, Loader2, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import { profileUpdateByAdmin, fetchAllUsers } from '../redux/thunk/adminThunk';
import { fetchMyProfile, updateUserProfile } from '../redux/thunk/userThunk';
import * as Yup from "yup";

const UserFormModal = ({ isOpen, onClose, initialData, isAdminMode = false }) => {
    const dispatch = useDispatch();

    // Redux state se loading uthana
    const { loading } = useSelector((state) => state.user);
    const { user } = useSelector((state) => state.auth)
    const [preview, setPreview] = useState(null);
    const [file, setFile] = useState(null);

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            firstName: initialData?.firstName || '',
            lastName: initialData?.lastName || '',
            username: initialData?.username || '',
            bio: initialData?.bio || '',
            gender: initialData?.gender || '',
            country: initialData?.country || '',
            dob: initialData?.dob ? new Date(initialData.dob).toISOString().split('T')[0] : '',
        },
        validationSchema: Yup.object({
            firstName: Yup.string().required("First name is required"),
            lastName: Yup.string().required("Last name is required"),
            username: Yup.string().min(3, "Too short").required("Username is required"),
            bio: Yup.string().max(200, "Bio is too long"),
        }),
        onSubmit: async (values) => {
            try {
                const data = new FormData();

                Object.keys(values).forEach(key => {
                    if (values[key]) data.append(key, values[key]);
                });
                if (file) data.append('profilePic', file);

                const targetId = user?._id;

                // console.log("Initial Data ID:", initialData?._id);

                if (isAdminMode) {
                    const targetId = isAdminMode ? initialData?._id : user?._id;
                    // Scenario: Admin updating from Dashboard
                    await dispatch(profileUpdateByAdmin({ id: targetId, formData: data })).unwrap();
                    toast.success("User updated by Admin");
                    dispatch(fetchAllUsers({ page: 1, limit: 10 })); // Refresh table
                } else {

                    if (!targetId) {
                        toast.error("User ID missing!");
                        return;
                    }

                    await dispatch(updateUserProfile({ id: targetId, formData: data })).unwrap();

                    for (let pair of data.entries()) {
                        console.log(pair[0] + ': ' + pair[1]);
                    }

                    toast.success("Profile updated successfully");
                    dispatch(fetchMyProfile());
                }
                onClose();
            } catch (error) {
                toast.error(error?.message || "Update failed");
            }
        },
    });

    // File selection handler
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    // Reset preview when modal opens/changes
    useEffect(() => {
        if (isOpen) {
            setPreview(initialData?.profilePic || null);
            setFile(null);
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">

                {/* Header */}
                <div className="px-8 py-5 border-b flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-xl font-black text-gray-800 tracking-tight italic uppercase">
                        {isAdminMode ? `Edit User: ${initialData?.username}` : 'Update Profile Settings'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-all">
                        <X size={22} />
                    </button>
                </div>

                <form onSubmit={formik.handleSubmit} className="p-8 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Profile Picture Upload Section */}
                        <div className="md:col-span-2 flex flex-col items-center mb-6">
                            <div className="relative group cursor-pointer">
                                <img
                                    src={preview || 'https://via.placeholder.com/150'}
                                    className="w-32 h-32 rounded-3xl object-cover border-4 border-indigo-50 shadow-lg group-hover:border-indigo-200 transition-all"
                                    alt="Preview"
                                />
                                <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-3xl transition-all">
                                    <Upload className="text-white" size={28} />
                                    <input type="file" hidden onChange={handleFileChange} accept="image/*" />
                                </label>
                            </div>
                            <span className="text-[10px] font-bold text-indigo-400 mt-3 uppercase tracking-widest">Change Photo</span>
                        </div>

                        {/* Form Inputs */}
                        <InputField label="First Name" name="firstName" formik={formik} />
                        <InputField label="Last Name" name="lastName" formik={formik} />
                        <InputField label="Username" name="username" formik={formik} />

                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Gender</label>
                            <select
                                name="gender"
                                {...formik.getFieldProps('gender')}
                                className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-indigo-500 font-bold text-gray-700 transition-all"
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Country</label>
                            <select
                                name="country"
                                {...formik.getFieldProps('country')}
                                className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-indigo-500 font-bold text-gray-700 transition-all shadow-inner"
                            >
                                <option value="">Select Country</option>
                                <option value="India">India</option>
                                <option value="USA">USA</option>
                                <option value="Canada">Canada</option>
                                <option value="Italy">Italy</option>
                                <option value="Russia">Russia</option>
                                <option value="China">China</option>
                                <option value="UK">UK</option>
                                <option value="Germany">Germany</option>
                            </select>
                        </div>

                        <InputField label="Date of Birth" name="dob" type="date" formik={formik} />

                        <div className="md:col-span-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Bio</label>
                            <textarea
                                name="bio"
                                rows="3"
                                {...formik.getFieldProps('bio')}
                                className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-indigo-500 font-semibold text-gray-700 resize-none transition-all shadow-inner"
                                placeholder="Write something about the user..."
                            />
                            <div className="flex justify-end mt-1">
                                <span className="text-[10px] font-bold text-gray-300">Max 200 chars</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-10 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 bg-white border-2 border-gray-100 text-gray-400 font-black rounded-2xl hover:bg-gray-50 transition-all uppercase tracking-widest"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2.5] py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <><Save size={20} /> {isAdminMode ? 'UPDATE USER DATA' : 'SAVE MY PROFILE'}</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Reusable Input Component for Modal
const InputField = ({ label, name, type = "text", formik }) => {
    const isError = formik.touched[name] && formik.errors[name];
    return (
        <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">{label}</label>
            <input
                type={type}
                name={name}
                {...formik.getFieldProps(name)}
                className={`w-full px-5 py-3 bg-gray-50 border-2 rounded-2xl outline-none font-bold text-gray-700 transition-all shadow-inner ${isError ? 'border-red-400 focus:border-red-500 bg-red-50/30' : 'border-gray-100 focus:border-indigo-500'
                    }`}
            />
            {isError && <p className="text-[10px] text-red-500 font-bold italic ml-1 tracking-wide">{formik.errors[name]}</p>}
        </div>
    );
};

export default UserFormModal;