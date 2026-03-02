import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import UsersList from "./pages/Users/UsersPage";

import { Toaster } from 'react-hot-toast';
import ProtectedRoute from "./components/auth/ProtectedRoute.tsx"; // Import the guard
import UsersPage from "./pages/Users/UsersPage";
import TestUpload from "./pages/TestUpload.tsx";
import ForgotPassword from "./components/auth/ForgotPassword.tsx";
import ResetPassword from "./components/auth/ResetPassword.tsx";
import TestMap from "./pages/TestMap.tsx";
import OCR from "./pages/OCR.tsx";


// ... keep your other imports

export default function App() {
  return (
    <>
    <Toaster 
      position="top-right" 
      reverseOrder={false} 
      toastOptions={{
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      }}
    />
    <Router>
      <ScrollToTop />
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />


        {/* resident login  */}
  
        {/* PROTECTED ROUTES GROUP */}
        <Route element={<ProtectedRoute />}>
          {/* All routes inside here require a token */}
          
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Home />} />
            
            {/* Users */}
           

            {/* Residents */}
          

    {/* peace and order  */}

         

            <Route path="profile" element={<UserProfiles />} />
            <Route path="calendar" element={<Calendar />} />
            {/* ... add all other internal routes here */}
            <Route path="alerts" element={<Alerts />} />
            <Route path="avatars" element={<Avatars />} />
            <Route path="badge" element={<Badges />} />
            <Route path="buttons" element={<Buttons />} />
            <Route path="images" element={<Images />} />
            <Route path="videos" element={<Videos />} />
            <Route path="test-upload" element={<TestUpload />} />
            
          </Route>

         
        

                 {/* Protected Route outside AppLayout (Print Preview) */}
        

          <Route
           path="/testmap"
           element={<TestMap incidents={[]}/>}
          ></Route>
          <Route
           path="/ocr"
           element={<OCR/>}
          ></Route>

          
        </Route>

        {/* FALLBACK */}
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
    </>
  );
}
