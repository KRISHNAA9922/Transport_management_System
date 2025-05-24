import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalIncome: 0,
    totalExpenses: 0,
    profit: 0,
  });
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const [tripsRes, expensesRes] = await Promise.all([
          axios.get('http://localhost:5000/api/trips', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5000/api/expenses', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const trips = tripsRes.data;
        const expenses = expensesRes.data;

        const totalTrips = trips.length;
        const totalIncome = trips.reduce((sum, trip) => sum + trip.incomeReceived, 0);
        const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const profit = totalIncome - totalExpenses;

        setStats({ totalTrips, totalIncome, totalExpenses, profit });

        // Sample chart data (monthly income)
        const monthlyIncome = Array(12).fill(0);
        trips.forEach((trip) => {
          const month = new Date(trip.date).getMonth();
          monthlyIncome[month] += trip.incomeReceived;
        });

        setChartData({
          labels: [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
          ],
          datasets: [
            {
              label: 'Monthly Income',
              data: monthlyIncome,
              backgroundColor: 'rgba(59, 130, 246, 0.5)',
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold">Total Trips</h2>
          <p className="text-2xl">{stats.totalTrips}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold">Total Income</h2>
          <p className="text-2xl">₹{stats.totalIncome}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold">Total Expenses</h2>
          <p className="text-2xl">₹{stats.totalExpenses}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold">Profit</h2>
          <p className="text-2xl">₹{stats.profit}</p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Monthly Income</h2>
        <Bar
          data={chartData}
          options={{
            responsive: true,
            plugins: { legend: { position: 'top' }, title: { display: true, text: 'Income by Month' } },
          }}
        />
      </div>
    </div>
  );
}

export default AdminDashboard;