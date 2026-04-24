import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:3000/api",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json"
    }
});

API.interceptors.request.use((config) => {
    try {
        const persistRoot = localStorage.getItem("persist:root");
        
        if (persistRoot) {
            // Redux Persist double stringify karta hai, isliye handle with care
            const rootData = JSON.parse(persistRoot);
            
            if (rootData.auth) {
                const authData = JSON.parse(rootData.auth);
                const token = authData.token;

                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                    // Debugging ke liye:
                 //console.log("Token Sent in Header:", token);
                }
            }
        }
    } catch (error) {
        console.error("Interceptor Token Error:", error);
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default API;