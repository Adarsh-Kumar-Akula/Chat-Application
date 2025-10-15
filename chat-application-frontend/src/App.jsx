
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ChatPage from "./pages/ChatPage";
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'


function App() {

  const loggedInUsername = localStorage.getItem("loggedInUsername");

  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/"
          element={loggedInUsername ? <ChatPage /> : <LoginPage />}
        />
         <Route path="/login" element={<LoginPage />} />
         <Route path="/chatPage" element={<ChatPage />} />
         
        {/*
        <Route path="/add-friend" element={<AddFriendPage />} />
        <Route path="/chat" element={<ChatPage />} /> */}
      </Routes>
    </Router>
  );
}

export default App
