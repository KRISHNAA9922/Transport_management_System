import { useState, useEffect } from 'react';
import axios from 'axios';
import Papa from 'papaparse';
import { useTranslation } from 'react-i18next';

function Reports() {
  const { t } = useTranslation();
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    vehicle: '',
    driver: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [vehiclesRes, driversRes, expensesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/vehicles', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('http://localhost:5000/api/auth/drivers', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('http://localhost:5000/api/expenses', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setVehicles(vehiclesRes.data);
      setDrivers(driversRes.data);
      setExpenses(expensesRes.data);
    } catch (err) {
      setError(err.response?.data?.message || t('failed_fetch_data'));
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFilterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();

      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.vehicle) params.append('vehicle', filters.vehicle);
      if (filters.driver) params.append('driver', filters.driver);

      const [tripsRes, expensesRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/trips/reports/trips?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('http://localhost:5000/api/expenses', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setTrips(tripsRes.data);
      setExpenses(expensesRes.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || t('failed_fetch_trips'));
      console.error('Filter error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const csvData = trips.map((trip) => ({
      [t('source')]: trip.source,
      [t('destination')]: trip.destination,
      [t('vehicle')]: trip.vehicle ? `${trip.vehicle.name} (${trip.vehicle.numberPlate})` : t('none'),
      [t('driver')]: trip.driver ? trip.driver.name : t('none'),
      [t('date')]: new Date(trip.date).toLocaleDateString(),
      [t('status')]: trip.status,
      [t('expected_income')]: trip.incomeExpected,
      [t('received_income')]: trip.incomeReceived || t('not_available'),
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'trip_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalIncome = trips.reduce((sum, trip) => sum + (trip.incomeReceived || 0), 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">{t('reports')}</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading && <p className="text-blue-500 mb-4">{t('loading')}</p>}
      <div className="mb-8 bg-white p-6 rounded-lg shadow max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">{t('filter_trips')}</h2>
        <form onSubmit={handleFilterSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="startDate">
                {t('start_date')}
              </label>
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
              <label className="block text-gray-700 mb-2" htmlFor="endDate">
                {t('end_date')}
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="vehicle">
                {t('vehicle')}
              </label>
              <select
                id="vehicle"
                name="vehicle"
                value={filters.vehicle}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t('all_vehicles')}</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle._id} value={vehicle._id}>
                    {vehicle.name} ({vehicle.numberPlate})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="driver">
                {t('driver')}
              </label>
              <select
                id="driver"
                name="driver"
                value={filters.driver}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t('all_drivers')}</option>
                {drivers.map((driver) => (
                  <option key={driver._id} value={driver._id}>
                    {driver.name} ({driver.email})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
            disabled={loading}
          >
            {t('apply_filters')}
          </button>
        </form>
      </div>
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{t('trip_reports')}</h2>
          {trips.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            >
              {t('export_to_csv')}
            </button>
          )}
        </div>
        {trips.length === 0 ? (
          <p className="text-gray-600">{t('no_trips_found')}</p>
        ) : (
          <div>
            <p className="mb-2">
              {t('total_trips')}: {trips.length} | {t('total_income')}: ₹{totalIncome.toFixed(2)} | {t('total_expenses')}: ₹{totalExpenses.toFixed(2)}
            </p>
            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-lg shadow">
                <thead>
                  <tr className="bg-gray-200 text-gray-700">
                    <th className="py-3 px-4 text-left">{t('source')}</th>
                    <th className="py-3 px-4 text-left">{t('destination')}</th>
                    <th className="py-3 px-4 text-left">{t('vehicle')}</th>
                    <th className="py-3 px-4 text-left">{t('driver')}</th>
                    <th className="py-3 px-4 text-left">{t('date')}</th>
                    <th className="py-3 px-4 text-left">{t('status')}</th>
                    <th className="py-3 px-4 text-left">{t('expected_income')}</th>
                    <th className="py-3 px-4 text-left">{t('received_income')}</th>
                  </tr>
                </thead>
                <tbody>
                  {trips.map((trip) => (
                    <tr key={trip._id} className="border-b">
                      <td className="py-3 px-4">{trip.source}</td>
                      <td className="py-3 px-4">{trip.destination}</td>
                      <td className="py-3 px-4">
                        {trip.vehicle ? `${trip.vehicle.name} (${trip.vehicle.numberPlate})` : t('none')}
                      </td>
                      <td className="py-3 px-4">{trip.driver ? trip.driver.name : t('none')}</td>
                      <td className="py-3 px-4">{new Date(trip.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{trip.status}</td>
                      <td className="py-3 px-4">₹{trip.incomeExpected}</td>
                      <td className="py-3 px-4">₹{trip.incomeReceived || t('not_available')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Reports;
