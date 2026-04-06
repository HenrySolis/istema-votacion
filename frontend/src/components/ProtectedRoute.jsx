import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../services/authService.js';
import AdminLayout from './AdminLayout.jsx';

export default function ProtectedRoute() {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}
