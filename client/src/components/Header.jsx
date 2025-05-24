import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

function Header() {
  const { t, i18n } = useTranslation();
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

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <header className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">{t('admin_panel')}</h1>
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
            to="/admin/dashboard"
            className={({ isActive }) =>
              isActive
                ? 'px-3 py-2 bg-blue-600 rounded-md block'
                : 'px-3 py-2 hover:bg-gray-700 rounded-md block'
            }
            onClick={() => setIsMenuOpen(false)}
          >
            {t('dashboard')}
          </NavLink>
          <NavLink
            to="/admin/vehicles"
            className={({ isActive }) =>
              isActive
                ? 'px-3 py-2 bg-blue-600 rounded-md block'
                : 'px-3 py-2 hover:bg-gray-700 rounded-md block'
            }
            onClick={() => setIsMenuOpen(false)}
          >
            {t('vehicles')}
          </NavLink>
          <NavLink
            to="/admin/trips"
            className={({ isActive }) =>
              isActive
                ? 'px-3 py-2 bg-blue-600 rounded-md block'
                : 'px-3 py-2 hover:bg-gray-700 rounded-md block'
            }
            onClick={() => setIsMenuOpen(false)}
          >
            {t('trips')}
          </NavLink>
          <NavLink
            to="/admin/expenses"
            className={({ isActive }) =>
              isActive
                ? 'px-3 py-2 bg-blue-600 rounded-md block'
                : 'px-3 py-2 hover:bg-gray-700 rounded-md block'
            }
            onClick={() => setIsMenuOpen(false)}
          >
            {t('expenses')}
          </NavLink>
          <NavLink
            to="/admin/reports"
            className={({ isActive }) =>
              isActive
                ? 'px-3 py-2 bg-blue-600 rounded-md block'
                : 'px-3 py-2 hover:bg-gray-700 rounded-md block'
            }
            onClick={() => setIsMenuOpen(false)}
          >
            {t('reports')}
          </NavLink>
          <NavLink
            to="/register"
            className={({ isActive }) =>
              isActive
                ? 'px-3 py-2 bg-blue-600 rounded-md block'
                : 'px-3 py-2 hover:bg-gray-700 rounded-md block'
            }
            onClick={() => setIsMenuOpen(false)}
          >
            {t('register_user')}
          </NavLink>
          <button
            onClick={() => {
              handleLogout();
              setIsMenuOpen(false);
            }}
            className="px-3 py-2 bg-red-500 hover:bg-red-600 rounded-md block"
          >
            {t('logout')}
          </button>

          {/* Language Toggle Button */}
          <div className="ml-4 flex items-center space-x-2 mt-2 md:mt-0">
            <span className="text-sm">{t('language')}:</span>
            <div className="flex rounded-full bg-gray-700 p-1">
              <button
                onClick={() => changeLanguage('en')}
                className={`px-3 py-1 rounded-full text-sm transition ${
                  i18n.language === 'en'
                    ? 'bg-white text-gray-800 font-semibold'
                    : 'text-white hover:bg-gray-600'
                }`}
              >
                English
              </button>
              <button
                onClick={() => changeLanguage('mr')}
                className={`px-3 py-1 rounded-full text-sm transition ${
                  i18n.language === 'mr'
                    ? 'bg-white text-gray-800 font-semibold'
                    : 'text-white hover:bg-gray-600'
                }`}
              >
                मराठी
              </button>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Header;
