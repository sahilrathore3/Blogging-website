import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { createBlog, fetchBlogById, updateBlog } from "../redux/thunk/blogThunk";
import { clearBlogStatus } from "../redux/slice/blogSlice";
import { toast } from "react-toastify";

const BlogForm = () => {
    const { id } = useParams();
    const isEditMode = Boolean(id);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const isInitialized = useRef(false);
    const toastShown = useRef(false);

    // ✨ Get specific success flags from slice
    const { 
        loading, 
        error, 
        createSuccess, 
        updateSuccess, 
        singleBlog 
    } = useSelector((state) => state.blog);

    const base_url = "http://localhost:3000";
    const categories = ["Food", "Travel", "Health & Fitness", "Lifestyle", "Fashion & Beauty", "DIY Craft", "Parenting", "Business", "Personal Finance", "Sports", "Other"];

    const validationSchema = Yup.object({
        title: Yup.string().min(5, "Title at least 5 chars").required("Title is required"),
        content: Yup.string().min(20, "Content too short.Please write atleast 20 characters").required("Content is required"),
        category: Yup.string().required("Category is required"),
        image: Yup.mixed().test("required", "Cover image is required", (value) => {
            if (isEditMode) return true;
            return value != null;
        }),
    });

    const formik = useFormik({
        initialValues: {
            title: "",
            content: "",
            category: "Other",
            image: null,
            preview: null,
        },
        validationSchema,
        onSubmit: (values) => {
            const formData = new FormData();
            formData.append("title", values.title);
            formData.append("content", values.content);
            formData.append("category", values.category);
            if (values.image) formData.append("coverImage", values.image);

            if (isEditMode) {
                dispatch(updateBlog({ id, formData }));
            } else {
                formData.append("status", "published");
                formData.append("type", "text");
                dispatch(createBlog(formData));
            }
        },
    });

    // 1. Initial Load: Cleanup and Fetch
    useEffect(() => {
        dispatch(clearBlogStatus());
        isInitialized.current = false; // Allow form to be filled
        
        if (isEditMode) {
            dispatch(fetchBlogById(id));
        }
        
        return () => dispatch(clearBlogStatus());
    }, [id, isEditMode, dispatch]);

    // 2. Fill Form Data (Edit Mode)
    useEffect(() => {
        if (isEditMode && singleBlog && !isInitialized.current) {
            formik.setValues({
                title: singleBlog.title || "",
                content: singleBlog.content || "",
                category: singleBlog.category || "Other",
                image: null,
                preview: singleBlog.coverImage ? `${base_url}${singleBlog.coverImage}` : null,
            });
            isInitialized.current = true;
        }
    }, [singleBlog, isEditMode]);

    // 3. Handle specific Success/Error flags
    useEffect(() => {
        const hasSucceeded = createSuccess || updateSuccess;

        if (hasSucceeded && !toastShown.current) {
            toastShown.current = true;
            toast.success(updateSuccess ? "Blog Updated!" : "Blog Published!", {
                toastId: "blog-success",
                onClose: () => { toastShown.current = false; }
            });
            dispatch(clearBlogStatus());
            navigate("/profile");
        }

        if (error && !toastShown.current) {
            toastShown.current = true;
            toast.error(error, {
                toastId: "blog-error",
                onClose: () => { toastShown.current = false; }
            });
            dispatch(clearBlogStatus());
        }
    }, [createSuccess, updateSuccess, error, dispatch, navigate]);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <div className={`${isEditMode ? 'bg-indigo-600' : 'bg-blue-600'} py-6 text-center`}>
                    <h1 className="text-2xl font-bold text-white uppercase tracking-widest">
                        {isEditMode ? "Edit Your Post" : "Create New Post"}
                    </h1>
                </div>

                <form onSubmit={formik.handleSubmit} className="p-8 space-y-6">
                    <div>
                        <label className="text-sm font-bold text-gray-600 uppercase ml-1">Title</label>
                        <input
                            name="title"
                            type="text"
                            placeholder="Enter blog title"
                            className={`w-full mt-2 p-4 bg-gray-50 rounded-xl border-none focus:ring-2 outline-none text-lg ${formik.touched.title && formik.errors.title ? 'ring-2 ring-red-500' : 'focus:ring-blue-500'}`}
                            {...formik.getFieldProps('title')}
                        />
                        {formik.touched.title && formik.errors.title && <p className="text-red-500 text-xs mt-1 ml-1">{formik.errors.title}</p>}
                    </div>

                    <div>
                        <label className="text-sm font-bold text-gray-600 uppercase ml-1">Category</label>
                        <select
                            name="category"
                            className="w-full mt-2 p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none"
                            {...formik.getFieldProps('category')}
                        >
                            {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-bold text-gray-600 uppercase ml-1">Cover Image</label>
                        <div className="mt-2 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-4 bg-gray-50">
                            {formik.values.preview ? (
                                <div className="relative w-full">
                                    <img src={formik.values.preview} alt="Preview" className="h-72 w-full object-cover rounded-xl shadow-md" />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            formik.setFieldValue("image", null);
                                            formik.setFieldValue("preview", null);
                                        }}
                                        className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                                    >✕</button>
                                </div>
                            ) : (
                                <label className="cursor-pointer text-center py-10 w-full">
                                    <p className="text-gray-500">Click to upload cover image</p>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.currentTarget.files[0];
                                            if (file) {
                                                formik.setFieldValue("image", file);
                                                formik.setFieldValue("preview", URL.createObjectURL(file));
                                            }
                                        }}
                                    />
                                </label>
                            )}
                        </div>
                        {formik.touched.image && formik.errors.image && <p className="text-red-500 text-xs mt-1 ml-1">{formik.errors.image}</p>}
                    </div>

                    <div>
                        <label className="text-sm font-bold text-gray-600 uppercase ml-1">Content</label>
                        <textarea
                            name="content"
                            rows="10"
                            placeholder="Write your story here..."
                            className={`w-full mt-2 p-4 bg-gray-50 rounded-xl border-none focus:ring-2 outline-none resize-none ${formik.touched.content && formik.errors.content ? 'ring-2 ring-red-500' : 'focus:ring-blue-500'}`}
                            {...formik.getFieldProps('content')}
                        ></textarea>
                        {formik.touched.content && formik.errors.content && <p className="text-red-500 text-xs mt-1 ml-1">{formik.errors.content}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-5 rounded-2xl font-black text-xl tracking-tighter shadow-xl transition-all ${loading ? "bg-gray-300 cursor-not-allowed" : (isEditMode ? "bg-indigo-600 hover:bg-indigo-700" : "bg-blue-600 hover:bg-blue-700")
                            } text-white`}
                    >
                        {loading ? "SAVING..." : (isEditMode ? "UPDATE BLOG" : "PUBLISH BLOG")}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default BlogForm;