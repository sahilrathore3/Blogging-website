import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import { ToastContainer } from 'react-toastify'
import Signup from './pages/signup'
import Navbar from './component/Navbar'
import VerifyOtp from './component/VerifyOtp'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import ProtectedRoute from './middleware/authMiddleware'
// import CreateBlog from './pages/CreateBlog'
import BlogDetails from './pages/BlogDetails'
import BlogForm from './pages/BlogForm'
import AllBlogs from './pages/AllBlogs'


const App = () => {
  return (
    <>
      <BrowserRouter>

        <Navbar />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/verifyandsignup' element={<VerifyOtp />} />
          <Route path='/login' element={<Login />} />
          <Route path="/all-blogs" element={<AllBlogs />} />

          <Route element={<ProtectedRoute />}>
            <Route path='/profile' element={<Profile />} />
            <Route path='/create-blog' element={<BlogForm />} />
            <Route path='/edit-blog/:id' element={<BlogForm />} />
            <Route path="/blog/:id" element={<BlogDetails />} />

          </Route>
          <Route element={<ProtectedRoute adminOnly={true} />}>
            <Route path='/dashboard' element={<Dashboard />} />
          </Route>
        </Routes>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnHover
          draggable
        />
      </BrowserRouter>

    </>
  )
}

export default App
