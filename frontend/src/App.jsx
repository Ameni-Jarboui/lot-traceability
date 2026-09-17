import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Registre from './pages/Registre';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateLot from './pages/CreateLot';
import LotDetail from './pages/LotDetail';
import Fractionner from './pages/Fractionner';
import Recombiner from './pages/Recombiner';
import ScanControle from './pages/ScanControle';
import Rappels from './pages/Rappels';
import Users from './pages/Users';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route
              path="/lots/nouveau"
              element={
                <ProtectedRoute roles={['OPERATEUR', 'ADMIN']}>
                  <CreateLot />
                </ProtectedRoute>
              }
            />
            <Route path="/lots/:id" element={<LotDetail />} />
            <Route
              path="/lots/:id/fractionner"
              element={
                <ProtectedRoute roles={['OPERATEUR', 'ADMIN']}>
                  <Fractionner />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recombiner"
              element={
                <ProtectedRoute roles={['OPERATEUR', 'ADMIN']}>
                  <Recombiner />
                </ProtectedRoute>
              }
            />
            <Route path="/controle-terrain" element={<ScanControle />} />
            <Route
              path="/rappels"
              element={
                <ProtectedRoute roles={['QUALITE', 'ADMIN']}>
                  <Rappels />
                </ProtectedRoute>
              }
            />
            <Route
              path="/utilisateurs"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <Users />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
