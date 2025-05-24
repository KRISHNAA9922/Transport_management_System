import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

function DriverHistory() {
  const { t } = useTranslation();

  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/trips/driver', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrips(response.data);
      applyFilters(response.data, filters);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || t('fetch_trips_error'));
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (tripsData, currentFilters) => {
    let result = [...tripsData];

    if (currentFilters.status) {
      result = result.filter((trip) => trip.status === currentFilters.status);
    }

    if (currentFilters.startDate) {
      result = result.filter(
        (trip) => new Date(trip.date) >= new Date(currentFilters.startDate)
      );
    }

    if (currentFilters.endDate) {
      result = result.filter(
        (trip) => new Date(trip.date) <= new Date(currentFilters.endDate)
      );
    }

    setFilteredTrips(result);
  };

  const handleFilterChange = (e) => {
    const newFilters = { ...filters, [e.target.name]: e.target.value };
    setFilters(newFilters);
    applyFilters(trips, newFilters);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">{t('trip_history')}</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading && <p className="text-blue-500 mb-4">{t('loading')}</p>}

      {/* Filter Section */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">{t('filter_history')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="status">{t('status')}</label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('all_statuses')}</option>
              <option value="Pending">{t('pending')}</option>
              <option value="Accepted">{t('accepted')}</option>
              <option value="Completed">{t('completed')}</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="startDate">{t('start_date')}</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="endDate">{t('end_date')}</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Trip History Table */}
      <div>
        <h2 className="text-xl font-semibold mb-4">{t('trip_history')}</h2>
        {filteredTrips.length === 0 ? (
          <p className="text-gray-600">{t('no_trips_found')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow">
              <thead>
                <tr className="bg-gray-200 text-gray-700">
                  <th className="py-3 px-4 text-left">{t('source')}</th>
                  <th className="py-3 px-4 text-left">{t('destination')}</th>
                  <th className="py-3 px-4 text-left">{t('vehicle')}</th>
                  <th className="py-3 px-4 text-left">{t('date')}</th>
                  <th className="py-3 px-4 text-left">{t('status')}</th>
                  <th className="py-3 px-4 text-left">{t('expected_income')}</th>
                  <th className="py-3 px-4 text-left">{t('income_received')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrips.map((trip) => (
                  <tr key={trip._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{trip.source}</td>
                    <td className="py-3 px-4">{trip.destination}</td>
                    <td className="py-3 px-4">
                      {trip.vehicle
                        ? `${trip.vehicle.name} (${trip.vehicle.numberPlate})`
                        : t('none')}
                    </td>
                    <td className="py-3 px-4">{new Date(trip.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4">{trip.status}</td>
                    <td className="py-3 px-4">₹{trip.incomeExpected}</td>
                    <td className="py-3 px-4">₹{trip.incomeReceived ?? t('none')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default DriverHistory;
