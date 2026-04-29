import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "./src/redux/slice/authSlice";
import adminReducer from "./src/redux/slice/adminSlice"
import blogReducer from "./src/redux/slice/blogSlice"
import commentReducer from "./src/redux/slice/commentSlice"
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import userReducer from "./src/redux/slice/userSlice";

const persistConfig = {
    key: "root",
    storage: storage.default || storage,
    whitelist: ["auth"],  // Sirf auth state ko save rakhenge
};

const rootReducer = combineReducers({
    auth: authReducer,
    admin: adminReducer,
    user: userReducer,
    blog: blogReducer,
    comment: commentReducer,
});

//  Create persisted reducer 
const persistedReducer = persistReducer(persistConfig, rootReducer);

// store setup ==>...
export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false,
    }),
});

export const persistor = persistStore(store);