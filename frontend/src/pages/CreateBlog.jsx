import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createBlog } from "../redux/thunk/blogThunk";
import { clearBlogStatus } from "../redux/slice/blogSlice";
import { toast } from "react-toastify";

const CreateBlog = () => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("Other"); 
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, success } = useSelector((state) => state.blog);

    // Schema Categories
    const categories = [
        "Food", "Travel", "Health & Fitness", "Lifestyle",
        "Fashion & Beauty", "DIY Craft", "Parenting",
        "Business", "Personal Finance", "Sports", "Other"
    ];

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!title || !content || !image) {
            return toast.error("Please fill all fields and upload a cover image");
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("content", content);
        formData.append("category", category);
        formData.append("coverImage", image);
        formData.append("status", "published"); // Hum direct publish kar rahe hain
        formData.append("type", "text"); // Default type as per your schema

        dispatch(createBlog(formData));
    };

    useEffect(() => {
        if (success) {
            toast.success("Blog Published Successfully!");
            dispatch(clearBlogStatus());
            navigate("/profile");
        }
        if (error) {
            toast.error(error);
            dispatch(clearBlogStatus());
        }
    }, [success, error, dispatch, navigate]);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-blue-600 py-6 text-center">
                    <h1 className="text-2xl font-bold text-white uppercase tracking-widest">Create New Post</h1>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="text-sm font-bold text-gray-600 uppercase ml-1">Title</label>
                        <input
                            type="text"
                            className="w-full mt-2 p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none text-lg font-medium"
                            placeholder="Give your blog a title..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    {/* Category Dropdown (Matches your Schema Enum) */}
                    <div>
                        <label className="text-sm font-bold text-gray-600 uppercase ml-1">Category</label>
                        <select
                            className="w-full mt-2 p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Image Upload Area */}
                    <div>
                        <label className="text-sm font-bold text-gray-600 uppercase ml-1">Cover Image</label>
                        <div className="mt-2 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-4 hover:border-blue-400 transition-all bg-gray-50">
                            {preview ? (
                                <div className="relative w-full">
                                    <img src={preview} alt="Preview" className="h-72 w-full object-cover rounded-xl shadow-md" />
                                    <button
                                        type="button"
                                        onClick={() => { setImage(null); setPreview(null); }}
                                        className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-full hover:scale-110 transition shadow-lg"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ) : (
                                <label className="cursor-pointer text-center py-10">
                                    <div className="bg-blue-100 p-4 rounded-full inline-block mb-3">
                                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-500 font-medium">Click to upload cover image</p>
                                    <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div>
                        <label className="text-sm font-bold text-gray-600 uppercase ml-1">Content</label>
                        <textarea
                            rows="10"
                            className="w-full mt-2 p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            placeholder="What's on your mind?..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        ></textarea>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-5 rounded-2xl font-black text-xl tracking-tighter shadow-xl transition-all active:scale-95 ${loading ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"
                            }`}
                    >
                        {loading ? "PUBLISHING..." : "PUBLISH BLOG"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateBlog;