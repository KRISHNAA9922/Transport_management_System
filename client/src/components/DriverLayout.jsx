import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';

function DriverLayout() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-gray-800 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Driver Portal</h1>
          <button
            className="md:hidden px-3 py-2 border rounded-md border-white"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            &#9776;
          </button>
          <nav
            className={`flex-col md:flex md:flex-row md:space-x-4 items-center ${
              isMenuOpen ? 'flex' : 'hidden'
            } md:flex`}
          >
            <NavLink
              to="/driver/trips"
              className={({ isActive }) =>
                isActive
                  ? 'px-3 py-2 bg-blue-600 rounded-md block'
                  : 'px-3 py-2 hover:bg-gray-700 rounded-md block'
              }
              onClick={() => setIsMenuOpen(false)}
            >
              Active Trips
            </NavLink>
            <NavLink
              to="/driver/history"
              className={({ isActive }) =>
                isActive
                  ? 'px-3 py-2 bg-blue-600 rounded-md block'
                  : 'px-3 py-2 hover:bg-gray-700 rounded-md block'
              }
              onClick={() => setIsMenuOpen(false)}
            >
              Trip History
            </NavLink>
            <button
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              className="px-3 py-2 bg-red-500 hover:bg-red-600 rounded-md block"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>
      <main className="flex-1 p-6 bg-gray-100">
        <Outlet />
      </main>
    </div>
  );
}

export default DriverLayout;