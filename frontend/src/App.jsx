import React from 'react';
import { Routes, Route } from 'react-router-dom';
import "./styles/index.css";
import Home from './pages/Home';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import Checkout from './pages/Checkout';
import ContactOwner from './pages/ContactOwner';
import About from './pages/About';
import Team from './pages/Team';
import Careers from './pages/Careers';
import Press from './pages/Press';
import Blog from './pages/Blog';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import ForgotPassword from './components/auth/ForgotPassword';
import PasswordReset from './components/auth/PasswordReset';
import AdminPanel from './pages/AdminPanel';
import NotFound from './pages/NotFound';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import PrivateRoute from './components/common/PrivateRoute';


function App() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-16 pb-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/:id" element={<PropertyDetail />} />
          <Route path="/checkout/:propertyId" element={<Checkout />} />
          <Route path="/contact-owner/:propertyId" element={<ContactOwner />} />
          <Route path="/about" element={<About />} />
          <Route path="/team" element={<Team />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/press" element={<Press />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
                    
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/admin"
            element={
              <PrivateRoute adminOnly>
                <AdminPanel />
              </PrivateRoute>
            }
            />
          <Route path="/reset-password/:token" element={<PasswordReset />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <PrivateRoute>
                <Favorites />
              </PrivateRoute>
            }
          />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;