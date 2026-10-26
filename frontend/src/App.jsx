import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Shell from './components/Shell';
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import SubmitCode from './pages/SubmitCode';
import ReviewCode from './pages/ReviewCode';
import Notifications from './pages/Notifications';

function Protected({ role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/dashboard" replace />;
  return <Shell />;
}

function Dashboard() {
  const { user } = useAuth();
  return user?.role === 'TEACHER' ? <TeacherDashboard /> : <StudentDashboard />;
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public landing page — redirect to dashboard if already logged in */}
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />

      {/* Auth pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected app routes */}
      <Route element={<Protected />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reviews/:id" element={<ReviewCode />} />
        <Route path="/notifications" element={<Notifications />} />
      </Route>
      <Route element={<Protected role="STUDENT" />}>
        <Route path="/submit" element={<SubmitCode />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
