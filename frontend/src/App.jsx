import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import LotsList from './pages/LotsList';
import LotCreate from './pages/LotCreate';
import LotDetail from './pages/LotDetail';
import ControleTerrain from './pages/ControleTerrain';
function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/lots" element={<PrivateRoute><LotsList /></PrivateRoute>} />
          <Route path="/lots/nouveau" element={<PrivateRoute><LotCreate /></PrivateRoute>} />
          <Route path="/lots/:id" element={<PrivateRoute><LotDetail /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/lots" />} />
          <Route path="/scan" element={<PrivateRoute><ControleTerrain /></PrivateRoute>}/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;