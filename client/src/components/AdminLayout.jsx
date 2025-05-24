import { Outlet } from 'react-router-dom';
import Header from './Header';

function AdminLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-6 bg-gray-100">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;