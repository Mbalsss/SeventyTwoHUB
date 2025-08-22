import { Route } from "react-router-dom";
import ProtectedRoute from "../ProtectedRoute";
import AdminDashboard from "../../pages/admin/AdminDashboard";
import ProgramManagement from "../../pages/admin/ProgramManagement";

export default function AdminRoutes() {
  return (
    <>
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/programs"
        element={
          <ProtectedRoute requireAdmin>
            <ProgramManagement />
          </ProtectedRoute>
        }
      />
    </>
  );
}
