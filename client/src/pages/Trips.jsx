import { useState, useEffect } from 'react';
import api from '../api';
import { useTranslation } from 'react-i18next';

function Trips() {
  const { t } = useTranslation();
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    vehicle: '',
    driver: '',
    date: '',
    incomeExpected: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [tripsRes, vehiclesRes, driversRes] = await Promise.all([
        api.get('/api/trips', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/api/vehicles', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/api/auth/drivers', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setTrips(tripsRes.data);
      setVehicles(vehiclesRes.data);
      setDrivers(driversRes.data);
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          setError(t('unauthorized_login_again'));
        } else if (err.response.status === 403) {
          setError(t('access_denied_permission'));
        } else {
          setError(t('failed_fetch_data'));
        }
      } else {
        setError(t('failed_fetch_data'));
      }
      console.error('Fetch error:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    try {
      const token = localStorage.getItem('token');
      if (editingId) {
        const response = await api.put(
          `/api/trips/${editingId}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTrips(trips.map((trip) => (trip._id === editingId ? response.data : trip)));
        setEditingId(null);
        setSuccessMessage(t('trip_updated_successfully'));
      } else {
        const response = await api.post('/api/trips', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTrips([...trips, response.data]);
        setSuccessMessage(t('trip_added_successfully'));
      }
      setFormData({ source: '', destination: '', vehicle: '', driver: '', date: '', incomeExpected: '' });
    } catch (err) {
      setError(err.response?.data?.message || t('server_error'));
      console.error('Submit error:', err);
    }
  };

  const handleEdit = (trip) => {
    setError('');
    setSuccessMessage('');
    setFormData({
      source: trip.source,
      destination: trip.destination,
      vehicle: trip.vehicle._id,
      driver: trip.driver._id,
      date: trip.date.split('T')[0],
      incomeExpected: trip.incomeExpected,
    });
    setEditingId(trip._id);
  };

  const handleDelete = async (id) => {
    setError('');
    setSuccessMessage('');
    if (window.confirm(t('confirm_delete_trip'))) {
      try {
        const token = localStorage.getItem('token');
        await api.delete(`/api/trips/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTrips(trips.filter((trip) => trip._id !== id));
        setSuccessMessage(t('trip_deleted_successfully'));
      } catch (err) {
        setError(err.response?.data?.message || t('failed_delete_trip'));
        console.error('Delete error:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8">
      <h1 className="text-3xl font-bold mb-6">{t('trips')}</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left: Form */}
        <div className="md:w-1/3 bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">{editingId ? t('edit_trip') : t('add_trip')}</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="source">{t('source')}</label>
              <input
                type="text"
                id="source"
                name="source"
                value={formData.source}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="destination">{t('destination')}</label>
              <input
                type="text"
                id="destination"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="vehicle">{t('vehicle')}</label>
              <select
                id="vehicle"
                name="vehicle"
                value={formData.vehicle}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">{t('select_vehicle')}</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle._id} value={vehicle._id}>
                    {vehicle.name} ({vehicle.numberPlate})
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="driver">{t('driver')}</label>
              <select
                id="driver"
                name="driver"
                value={formData.driver}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">{t('select_driver')}</option>
                {drivers.map((driver) => (
                  <option key={driver._id} value={driver._id}>
                    {driver.name} ({driver.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="date">{t('date')}</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 mb-2" htmlFor="incomeExpected">{t('expected_income')}</label>
              <input
                type="number"
                id="incomeExpected"
                name="incomeExpected"
                value={formData.incomeExpected}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
            >
              {editingId ? t('update_trip') : t('add_trip')}
            </button>
          </form>
        </div>

        {/* Right: Trip Cards */}
        <div className="md:w-2/3">
          <h2 className="text-xl font-semibold mb-4">{t('trip_list')}</h2>
          {trips.length === 0 ? (
            <p className="text-gray-600">{t('no_trips_found')}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {trips.map((trip) => (
                <div key={trip._id} className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-lg font-semibold">
                    {trip.source} → {trip.destination}
                  </h3>
                  <p>{t('vehicle')}: {trip.vehicle.name} ({trip.vehicle.numberPlate})</p>
                  <p>{t('driver')}: {trip.driver.name}</p>
                  <p>{t('date')}: {new Date(trip.date).toLocaleDateString()}</p>
                  <p>{t('expected_income')}: ₹{trip.incomeExpected}</p>
                  <p>{t('status')}: {trip.status}</p>
                  <div className="mt-4 space-x-2">
                    <button
                      onClick={() => handleEdit(trip)}
                      className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                    >
                      {t('edit')}
                    </button>
                    <button
                      onClick={() => handleDelete(trip._id)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                      {t('delete')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Trips;
