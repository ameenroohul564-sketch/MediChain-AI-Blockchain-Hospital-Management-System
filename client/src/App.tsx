import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";
import Appointment from "./pages/Appointment";
import MyAppointments from "./pages/MyAppointments";
import MedicalRecords from "./pages/MedicalRecords";

import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorAppointments from "./pages/DoctorAppointments";
import DoctorMedicalRecords from "./pages/DoctorMedicalRecords";

import AdminDashboard from "./pages/AdminDashboard";

import ProtectedRoute from "./routes/ProtectedRoute";
import RecordAccess from "./pages/RecordAccess";
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* PATIENT */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute
              allowedRoles={[
                "patient",
              ]}
            >
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
  path="/record-access"
  element={
    <ProtectedRoute
      allowedRoles={[
        "patient",
      ]}
    >
      <RecordAccess />
    </ProtectedRoute>
  }
/>

        <Route
          path="/appointment"
          element={
            <ProtectedRoute
              allowedRoles={[
                "patient",
              ]}
            >
              <Appointment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-appointments"
          element={
            <ProtectedRoute
              allowedRoles={[
                "patient",
              ]}
            >
              <MyAppointments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/medical-records"
          element={
            <ProtectedRoute
              allowedRoles={[
                "patient",
                "doctor",
              ]}
            >
              <MedicalRecords />
            </ProtectedRoute>
          }
        />

        {/* DOCTOR */}

        <Route
          path="/doctor-dashboard"
          element={
            <ProtectedRoute
              allowedRoles={[
                "doctor",
              ]}
            >
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor-appointments"
          element={
            <ProtectedRoute
              allowedRoles={[
                "doctor",
              ]}
            >
              <DoctorAppointments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor-medical-records"
          element={
            <ProtectedRoute
              allowedRoles={[
                "doctor",
              ]}
            >
              <DoctorMedicalRecords />
            </ProtectedRoute>
          }
        />

        {/* ADMIN */}

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute
              allowedRoles={[
                "admin",
              ]}
            >
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* UNKNOWN */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;