import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  const location = useLocation();
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-area" key={location.pathname}>
        <Outlet />
      </main>
    </div>
  );
}
