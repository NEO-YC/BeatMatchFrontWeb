import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import "./styles/App.css";

// Static Pages
import Header from "./pages/static/Header";
import Footer from "./pages/static/Footer";
import About from "./pages/static/About";
import Contact from "./pages/static/Contact";

// Auth
import AuthForms from "./pages/auth/AuthForms";

// Musician
import MusicianProfile from "./pages/musician/MusicianProfile";
import CreateMusicianProfile from "./pages/musician/CreateMusicianProfile";
import EditMusicianProfile from "./pages/musician/EditMusicianProfile";

// Events
import Events from "./pages/events/Events";
import CreateEvent from "./pages/events/CreateEvent";
import MyEvents from "./pages/events/MyEvents";
import PaymentSuccess from "./pages/events/PaymentSuccess";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";

// Main Pages
import Home from "./pages/Home";
import Search from "./pages/Search";

// Services
import api from "./services/api";

function App() {
  const [user, setUser] = useState(null);
  const [isMusician, setIsMusician] = useState(false);
  const [profileActive, setProfileActive] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const loadUserData = async () => {
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');
    
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const displayName = userName || decoded.email?.split('@')[0] || 'משתמש';
        setUser({ 
          email: decoded.email, 
          userId: decoded.id || decoded.userId,
          displayName: displayName
        });
        setIsAdmin(decoded.role === 'admin');
        
        // Check if user is a musician
        try {
          const profile = await api.getMyMusicianProfile();
          
          if (profile && profile.musicianProfile) {
            setIsMusician(true);
            const isActive = !!profile.musicianProfile.isActive;
            setProfileActive(isActive);
          } else {
            setIsMusician(false);
            setProfileActive(null);
          }
        } catch (err) {
          console.error('[App] Error loading musician profile:', err);
          setIsMusician(false);
          setProfileActive(null);
        }
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        setUser(null);
        setIsMusician(false);
        setProfileActive(null);
        setIsAdmin(false);
      }
    } else {
      setUser(null);
      setIsMusician(false);
      setProfileActive(null);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      loadUserData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);

  return (
    <div className="app-shell">
      <BrowserRouter>
        <Header />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home isLoggedIn={!!user} isMusician={isMusician} profileActive={profileActive} user={user} />} />
            <Route path="/search" element={<Search />} />
            <Route path="/register" element={<AuthForms />} />
            <Route path="/login" element={<AuthForms />} />
            <Route path="/musician/create" element={<CreateMusicianProfile />} />
            <Route path="/musician/edit" element={<EditMusicianProfile />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/musician/:id" element={<MusicianProfile />} /> //search for musician by id
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/events" element={<Events isAdmin={isAdmin} user={user} />} />
            <Route path="/create-event" element={<CreateEvent />} />
            <Route path="/my-events" element={<MyEvents />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
