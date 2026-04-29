import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { createBlog, fetchBlogById, updateBlog } from "../redux/thunk/blogThunk";
import { clearBlogStatus } from "../redux/slice/blogSlice";
import { toast } from "react-toastify";
import { X, Plus, Hash, Image as ImageIcon, LayoutGrid, Type } from 'lucide-react';

const createValidationSchema = () => Yup.object({
    title: Yup.string()
        .trim()
        .min(5, "Title must be at least 5 characters")
        .max(100, "Title cannot exceed 100 characters")
        .required("A blog must have a title"),

    content: Yup.string()
        .min(20, "Content must be at least 20 characters")
        .required("Content cannot be empty"),

    category: Yup.string()
        .oneOf([
            "Food", "Travel", "Health & Fitness", "Lifestyle",
            "Fashion & Beauty", "DIY Craft", "Parenting",
            "Business", "Personal Finance", "Sports", "Other"
        ], "Invalid category selected")
        .required("Please specify a category"),

    tags: Yup.string()
        .nullable()
        .test("valid-tags", "Each tag must be at least 2 characters", (value) => {
            if (!value || value.trim() === "") return true;
            const tags = value.split(",").map(t => t.trim()).filter(Boolean);
            return tags.every(tag => tag.length >= 2);
        }),

    coverImageFile: Yup.mixed()
        .nullable()
        .test("coverImage-format", "Only image files are allowed (jpg, png, webp, gif)", (value) => {
            if (!value || !(value instanceof File)) return true;
            return ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(value.type);
        })
        .test("coverImage-size", "Cover image must be less than 5MB", (value) => {
            if (!value || !(value instanceof File)) return true;
            return value.size <= 5 * 1024 * 1024;
        }),
});

const BlogForm = () => {
    const { id } = useParams();
    const isEditMode = Boolean(id);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const isInitialized = useRef(false);
    const toastShown = useRef(false);

    const { loading, error, createSuccess, updateSuccess, singleBlog } = useSelector((state) => state.blog);

    const base_url = "http://localhost:3000";
    const categories = ["Food", "Travel","Sports", "Health & Fitness", "Technology", "Science","Lifestyle", "Fashion & Beauty", "DIY Craft", "Parenting", "Business", "Other"];

    const formik = useFormik({
        initialValues: {
            title: "",
            content: "",
            category: "Other",
            tags: "",

            // Cover Image — maps to coverImage (String) in DB
            coverImageFile: null,       // File | null — new file picked by user
            coverImagePreview: null,    // string | null — blob URL or server URL

            // Gallery Images — maps to images ([String]) in DB
            galleryFiles: [],           // File[] — only newly added files
            galleryPreviews: [],        // { url: string, isNew: boolean }[]
        },
        validationSchema: createValidationSchema(),
        onSubmit: (values) => {
            const formData = new FormData();
            formData.append("title", values.title);
            formData.append("content", values.content);
            formData.append("category", values.category);

            // Cover image — only send if user picked a NEW file
            // If null, backend keeps existing or uses default-cover.jpg
            if (values.coverImageFile instanceof File) {
                formData.append("coverImage", values.coverImageFile);
            }

            // Existing gallery images that user did NOT remove
            const existingImages = values.galleryPreviews
                .filter(item => !item.isNew)
                .map(item => item.url.replace(base_url, ""));
            formData.append("existingImages", JSON.stringify(existingImages));

            // Newly added gallery files
            values.galleryFiles.forEach((file) => {
                formData.append("images", file);
            });

            // Tags
            const tagsArray = typeof values.tags === 'string'
                ? values.tags.split(',').map(t => t.trim()).filter(Boolean)
                : values.tags;
            formData.append("tags", JSON.stringify(tagsArray));

            if (isEditMode) {
                dispatch(updateBlog({ id, formData }));
            } else {
                formData.append("status", "published");
                formData.append("type", "text");
                dispatch(createBlog(formData));
            }
        }
    });

    // Add new gallery images
    const handleGalleryImages = (e) => {
        const files = Array.from(e.target.files);
        const newEntries = files.map(file => ({
            url: URL.createObjectURL(file),
            isNew: true
        }));
        formik.setFieldValue("galleryFiles", [...formik.values.galleryFiles, ...files]);
        formik.setFieldValue("galleryPreviews", [...formik.values.galleryPreviews, ...newEntries]);
    };

    // Remove gallery image by index
    const removeGalleryImage = (index) => {
        const item = formik.values.galleryPreviews[index];
        const updatedPreviews = formik.values.galleryPreviews.filter((_, i) => i !== index);
        formik.setFieldValue("galleryPreviews", updatedPreviews);

        if (item.isNew) {
            const newFileIndex = formik.values.galleryPreviews
                .slice(0, index)
                .filter(p => p.isNew).length;
            const updatedFiles = formik.values.galleryFiles.filter((_, i) => i !== newFileIndex);
            formik.setFieldValue("galleryFiles", updatedFiles);
        }
    };

    // Reset and fetch on mount
    useEffect(() => {
        dispatch(clearBlogStatus());
        isInitialized.current = false;
        toastShown.current = false;
        if (isEditMode) dispatch(fetchBlogById(id));
        return () => dispatch(clearBlogStatus());
    }, [id, isEditMode, dispatch]);

    // Populate form in edit mode once singleBlog is loaded
    useEffect(() => {
        if (isEditMode && singleBlog && !isInitialized.current) {
            formik.setValues({
                title: singleBlog.title || "",
                content: singleBlog.content || "",
                category: singleBlog.category || "Other",
                tags: Array.isArray(singleBlog.tags)
                    ? singleBlog.tags.join(", ")
                    : (singleBlog.tags || ""),

                coverImageFile: null,
                coverImagePreview: singleBlog.coverImage
                    ? `${base_url}${singleBlog.coverImage}`
                    : null,

                galleryFiles: [],
                galleryPreviews: singleBlog.images?.map(img => ({
                    url: `${base_url}${img}`,
                    isNew: false
                })) || [],
            });
            isInitialized.current = true;
        }
    }, [singleBlog, isEditMode]);

    // Toast on success or error
    useEffect(() => {
        if ((createSuccess || updateSuccess) && !toastShown.current) {
            toastShown.current = true;
            toast.success(updateSuccess ? "Blog Updated Successfully!" : "Blog Published Successfully!");
            navigate("/profile");
        }
        if (error && !toastShown.current) {
            toastShown.current = true;
            toast.error(error);
        }
    }, [createSuccess, updateSuccess, error, navigate]);

    return (
        <div className="min-h-screen bg-[#f9fafb] py-12 px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-[2rem] shadow-2xl shadow-gray-200/50 overflow-hidden border border-gray-100">

                {/* Header */}
                <div className={`${isEditMode ? 'bg-indigo-600' : 'bg-blue-600'} py-8 text-center`}>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">
                        {isEditMode ? "Modify Publication" : "Create New Story"}
                    </h1>
                </div>

                <form onSubmit={formik.handleSubmit} className="p-10 space-y-8">

                    {/* 1. Title */}
                    <div>
                        <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                            <Type size={14} /> Blog Title
                        </label>
                        <input
                            name="title"
                            type="text"
                            placeholder="A Catchy Title..."
                            className={`w-full p-5 bg-gray-50 rounded-2xl border-none outline-none text-xl font-bold transition-all ${formik.touched.title && formik.errors.title ? 'ring-2 ring-red-500' : 'focus:ring-2 focus:ring-blue-500'}`}
                            {...formik.getFieldProps('title')}
                        />
                        {formik.touched.title && formik.errors.title && (
                            <p className="text-red-500 text-xs mt-2 font-bold">{formik.errors.title}</p>
                        )}
                    </div>

                    {/* 2. Category & Tags */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                                <LayoutGrid size={14} /> Category
                            </label>
                            <select
                                name="category"
                                className={`w-full p-5 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500 font-bold appearance-none cursor-pointer ${formik.touched.category && formik.errors.category ? 'ring-2 ring-red-500' : ''}`}
                                {...formik.getFieldProps('category')}
                            >
                                {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                            {formik.touched.category && formik.errors.category && (
                                <p className="text-red-500 text-xs mt-2 font-bold">{formik.errors.category}</p>
                            )}
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                                <Hash size={14} /> Tags (Separated by comma)
                            </label>
                            <input
                                name="tags"
                                placeholder="coding, travel, lifestyle"
                                className={`w-full p-5 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500 font-bold ${formik.touched.tags && formik.errors.tags ? 'ring-2 ring-red-500' : ''}`}
                                {...formik.getFieldProps('tags')}
                            />
                            {formik.touched.tags && formik.errors.tags && (
                                <p className="text-red-500 text-xs mt-2 font-bold">{formik.errors.tags}</p>
                            )}
                        </div>
                    </div>

                    {/* 3. Cover Image & Gallery */}
                    <div className="space-y-4">
                        <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                            <ImageIcon size={14} /> Visual Media
                        </label>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* Cover Image — maps to coverImage (String) in DB */}
                            <div className={`md:col-span-1 h-64 border-4 border-dashed rounded-[2rem] bg-gray-50 relative group overflow-hidden ${formik.touched.coverImageFile && formik.errors.coverImageFile ? 'border-red-300' : 'border-gray-100'}`}>
                                {formik.values.coverImagePreview ? (
                                    <>
                                        <img
                                            src={formik.values.coverImagePreview}
                                            alt="Cover"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    formik.setFieldValue("coverImageFile", null);
                                                    formik.setFieldValue("coverImagePreview", null);
                                                }}
                                                className="bg-white text-red-500 p-3 rounded-full shadow-xl hover:scale-110 transition-transform"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <label className="flex flex-col items-center justify-center h-full cursor-pointer hover:bg-gray-100 transition-colors">
                                        <div className="p-4 bg-white rounded-2xl shadow-sm text-blue-500 mb-2">
                                            <Plus />
                                        </div>
                                        <span className="text-[10px] font-black text-gray-400 uppercase">Set Cover Image</span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/jpeg,image/png,image/webp,image/gif"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    formik.setFieldValue("coverImageFile", file);
                                                    formik.setFieldValue("coverImagePreview", URL.createObjectURL(file));
                                                }
                                            }}
                                        />
                                    </label>
                                )}
                            </div>
                            {formik.touched.coverImageFile && formik.errors.coverImageFile && (
                                <p className="text-red-500 text-xs mt-1 font-bold md:col-span-3">
                                    {formik.errors.coverImageFile}
                                </p>
                            )}

                            {/* Gallery Images — maps to images ([String]) in DB */}
                            <div className="md:col-span-2 h-64 border-4 border-dashed border-gray-100 rounded-[2rem] bg-gray-50 p-4 overflow-y-auto">
                                <div className="grid grid-cols-3 gap-3">
                                    {formik.values.galleryPreviews.map((item, index) => (
                                        <div key={index} className="relative h-24 rounded-2xl overflow-hidden group shadow-md">
                                            <img
                                                src={item.url}
                                                className="w-full h-full object-cover"
                                                alt={`gallery-${index}`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeGalleryImage(index)}
                                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    <label className="h-24 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-blue-300 transition-all">
                                        <Plus className="text-gray-300" size={20} />
                                        <span className="text-[8px] font-black text-gray-400 uppercase mt-1">Add to Gallery</span>
                                        <input
                                            type="file"
                                            multiple
                                            className="hidden"
                                            accept="image/jpeg,image/png,image/webp,image/gif"
                                            onChange={handleGalleryImages}
                                        />
                                    </label>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* 4. Content */}
                    <div>
                        <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                            <Type size={14} /> Story Content
                        </label>
                        <textarea
                            name="content"
                            rows="12"
                            placeholder="Once upon a time..."
                            className={`w-full p-6 bg-gray-50 rounded-3xl border-none outline-none text-lg leading-relaxed focus:ring-2 focus:ring-blue-500 resize-none ${formik.touched.content && formik.errors.content ? 'ring-2 ring-red-500' : ''}`}
                            {...formik.getFieldProps('content')}
                        />
                        {formik.touched.content && formik.errors.content && (
                            <p className="text-red-500 text-xs mt-2 font-bold">{formik.errors.content}</p>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-6 rounded-3xl font-black text-2xl tracking-tighter shadow-2xl p cursor-pointer transition-all transform active:scale-[0.98] ${
                            loading
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : (isEditMode ? "bg-indigo-600 hover:bg-indigo-700" : "bg-blue-600 hover:bg-blue-700") + " text-white"
                        }`}
                    >
                        {loading ? "PROCESSING..." : (isEditMode ? "UPDATE PUBLICATION" : "PUBLISH STORY")}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default BlogForm;