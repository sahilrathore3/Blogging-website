import React from "react";
import { useSelector } from "react-redux";
import { Navigate , Outlet } from "react-router-dom";

const ProtectedRoute = ({ adminOnly = false }) => {
    const { token, user, loading } = useSelector((state) => state.auth);

    if (loading) return <div>Loading...</div>;

    //  Agar login hi nahi hai, toh  Login page
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    //  Agar page Admin-Only hai AUR user Admin nahi hai
    if (adminOnly && user?.role !== 'admin') {
        // User ko wapas profile ya home par bhej do
        return <Navigate to="/profile" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
