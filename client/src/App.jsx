import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import './i18n';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';

import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import DriverTrips from './pages/DriverTrips';
import DriverHistory from './pages/DriverHistory';
import Vehicles from './pages/Vehicles';
import Trips from './pages/Trips';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import AdminLayout from './components/AdminLayout';
import DriverLayout from './components/DriverLayout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { t } = useTranslation();

  return (
    <Provider store={store}>
      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
        <Suspense fallback={<div>Loading...</div>}>
          <Router>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="vehicles" element={<Vehicles />} />
                <Route path="trips" element={<Trips />} />
                <Route path="expenses" element={<Expenses />} />
                <Route path="reports" element={<Reports />} />
              </Route>
              <Route
                path="/driver"
                element={
                  <ProtectedRoute allowedRoles={['driver']}>
                    <DriverLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="trips" element={<DriverTrips />} />
                <Route path="history" element={<DriverHistory />} />
              </Route>
            </Routes>
          </Router>
        </Suspense>
      </PersistGate>
    </Provider>
  );
}


export default App;
