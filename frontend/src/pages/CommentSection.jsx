import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlogComments, postComment, fetchCommentReplies } from '../redux/thunk/commentThunk';

// --- YouTube Style Recursive Comment Item ---
const CommentItem = ({ 
    comment, replies, replyingTo, setReplyingTo, 
    replyText, setReplyText, handlePostReply, 
    dispatch, base_url, depth = 0 
}) => {
    
    return (
        <div className="relative">
            {/* Curved Connector Line (Sirf Replies ke liye) */}
            {depth > 0 && (
                <div 
                    className="absolute -left-6 top-0 w-6 h-10 border-l-2 border-b-2 border-gray-200 rounded-bl-xl"
                    style={{ top: '-1.25rem' }} 
                ></div>
            )}

            <div className={`flex gap-3 items-start ${depth > 0 ? 'mt-6 ml-8' : 'mt-8'}`}>
                {/* User Avatar */}
                <img
                    src={
                        comment.authorId?.profilePic
                            ? `${base_url}${comment.authorId.profilePic}`
                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.authorId?.username || 'U')}`
                    }
                    className={`${depth > 0 ? 'w-6 h-6' : 'w-9 h-9'} rounded-full object-cover shrink-0 z-10`}
                    alt="avatar"
                />

                {/* Comment Content Area */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-gray-900">
                            @{comment.authorId?.username || "user"}
                        </span>
                        <span className="text-[10px] text-gray-400">
                            {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                    
                    <p className="text-sm text-gray-800 leading-snug break-words">
                        {comment.content}
                    </p>

                    {/* Action Bar */}
                    <div className="flex items-center gap-4 mt-2">
                        <button
                            onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                            className="text-[11px] font-bold text-gray-500 hover:bg-gray-100 px-2 py-1 rounded-full transition"
                        >
                            Reply
                        </button>
                        
                        {!replies[comment._id] && (
                            <button
                                onClick={() => dispatch(fetchCommentReplies(comment._id))}
                                className="text-[11px] font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-full"
                            >
                                View Replies
                            </button>
                        )}
                    </div>

                    {/* Reply Input */}
                    {replyingTo === comment._id && (
                        <div className="mt-3 flex flex-col gap-2 max-w-md animate-in fade-in duration-300">
                            <input
                                className="w-full bg-transparent border-b border-gray-300 py-1 text-sm focus:border-black outline-none transition"
                                placeholder="Add a reply..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                autoFocus
                            />
                            <div className="flex justify-end gap-2">
                                <button 
                                    onClick={() => setReplyingTo(null)}
                                    className="text-xs font-bold px-3 py-1.5 hover:bg-gray-100 rounded-full"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handlePostReply(comment._id)}
                                    disabled={!replyText.trim()}
                                    className="text-xs font-bold bg-blue-600 text-white px-3 py-1.5 rounded-full disabled:bg-gray-200"
                                >
                                    Reply
                                </button>
                            </div>
                        </div>
                    )}

                    {/* --- Recursive Replies Container --- */}
                    {replies[comment._id] && (
                        <div className="relative mt-2">
                            {/* Vertical Line Connecting All Replies */}
                            <div className="absolute left-[-24px] top-0 bottom-4 w-[2px] bg-gray-200"></div>
                            
                            {replies[comment._id].map((childReply) => (
                                <CommentItem
                                    key={childReply._id}
                                    comment={childReply}
                                    replies={replies}
                                    replyingTo={replyingTo}
                                    setReplyingTo={setReplyingTo}
                                    replyText={replyText}
                                    setReplyText={setReplyText}
                                    handlePostReply={handlePostReply}
                                    dispatch={dispatch}
                                    base_url={base_url}
                                    depth={depth + 1} 
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Main Comment Section ---
const CommentSection = ({ blogId }) => {
    const dispatch = useDispatch();
    const { comments, replies } = useSelector((state) => state.comment);
    const { user } = useSelector((state) => state.auth);

    const [commentText, setCommentText] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const base_url = "http://localhost:3000";

    useEffect(() => {
        if (blogId) dispatch(fetchBlogComments(blogId));
    }, [blogId, dispatch]);

    const handlePostComment = () => {
        if (!commentText.trim()) return;
        dispatch(postComment({ blogId, content: commentText }));
        setCommentText('');
    };

    const handlePostReply = (parentId) => {
        if (!replyText.trim()) return;
        dispatch(postComment({ blogId, content: replyText, parentId }));
        setReplyText('');
        setReplyingTo(null);
    };

    return (
        <div className="max-w-2xl mx-auto px-4 pb-20">
            <h3 className="text-lg font-bold mb-6">{comments.length} Comments</h3>

            {user ? (
                <div className="flex gap-4 mb-10">
                    <img 
                        src={user.profilePic ? `${base_url}${user.profilePic}` : `https://ui-avatars.com/api/?name=${user.username}`} 
                        className="w-10 h-10 rounded-full object-cover" 
                        alt="me"
                    />
                    <div className="flex-1">
                        <input
                            className="w-full bg-transparent border-b border-gray-300 py-1 text-sm focus:border-black outline-none transition"
                            placeholder="Add a comment..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                        />
                        <div className="flex justify-end mt-2">
                            <button
                                onClick={handlePostComment}
                                disabled={!commentText.trim()}
                                className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-bold disabled:bg-gray-100 disabled:text-gray-400"
                            >
                                Comment
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="mb-10 p-4 bg-gray-50 rounded-lg text-center text-sm text-gray-500">
                    Sign in to join the discussion.
                </div>
            )}

            <div className="space-y-2">
                {comments.map((comment) => (
                    <CommentItem
                        key={comment._id}
                        comment={comment}
                        replies={replies}
                        replyingTo={replyingTo}
                        setReplyingTo={setReplyingTo}
                        replyText={replyText}
                        setReplyText={setReplyText}
                        handlePostReply={handlePostReply}
                        dispatch={dispatch}
                        base_url={base_url}
                        depth={0} 
                    />
                ))}
            </div>
        </div>
    );
};

export default CommentSection;