import React, { useEffect, useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Container,
  Select,
  MenuItem,
  FormControl,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton
} from '@mui/material';
import {
  ShoppingCart as OrdersIcon,
  Inventory as ProductsIcon,
  PointOfSale as POSIcon,
  People as CustomersIcon,
  AttachMoney as RevenueIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { productApi, orderApi, posCustomerApi } from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
} from 'chart.js';
import POSWindow from './POSWindow';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

interface Customer {
  name?: string;
  email: string;
  phone?: string;
  address?: string;
}

interface Order {
  id: string;
  customer?: Customer;
  totalAmount: number;
  createdAt: string;
  status: string;
  total: number;
  paymentStatus: 'pending' | 'completed' | 'failed';
  shippingAddress?: {
    fullName?: string;
    email?: string;
  };
  type: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  images: string[];
  stock: number;
}

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  revenueData: number[];
  orderData: number[];
  labels: string[];
}

interface MetricCardProps {
  title: string;
  value: string | number;
  trend: string;
  icon: React.ReactNode;
  color: string;
  chartData?: number[];
  labels?: string[];
  path: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, trend, icon, color, chartData, labels, path }) => {
  const navigate = useNavigate();
  
  return (
    <Paper
      elevation={0}
      onClick={() => navigate(`/admin/${path}`)}
      sx={{
        p: 3,
        height: '100%',
        bgcolor: color,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.3s ease-in-out',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-5px)',
        },
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 500, fontSize: '1.1rem' }}>
            {title}
          </Typography>
          <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', borderRadius: '50%', p: 1 }}>
            {icon}
          </Box>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          {value}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          {trend}
        </Typography>
      </Box>
      {chartData && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '30%',
            opacity: 0.2,
          }}
        >
          <Line
            data={{
              labels: labels,
              datasets: [
                {
                  data: chartData,
                  borderColor: 'rgba(255,255,255,0.8)',
                  borderWidth: 2,
                  pointRadius: 0,
                  tension: 0.4,
                  fill: true,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: { enabled: false },
              },
              scales: {
                x: { display: false },
                y: { display: false },
              },
            }}
          />
        </Box>
      )}
    </Paper>
  );
};

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    revenueData: [],
    orderData: [],
    labels: [],
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('today');
  const [posOpen, setPosOpen] = useState(false);
  const navigate = useNavigate();

  const getTimeRangeData = (orders: Order[], range: string) => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const filteredOrders = orders.filter((order: Order) => {
      const orderDate = new Date(order.createdAt);
      switch (range) {
        case 'today':
          return orderDate >= startOfToday;
        case 'yesterday':
          return orderDate >= startOfYesterday && orderDate < startOfToday;
        case 'week':
          return orderDate >= startOfWeek;
        case 'month':
          return orderDate >= startOfMonth;
        case 'year':
          return orderDate >= startOfYear;
        case 'all':
          return true;
        default:
          return true;
      }
    });

    // Get successful orders (paymentStatus: completed) including POS orders
    const successfulOrders = filteredOrders.filter((order: Order) => 
      order.paymentStatus === 'completed' || order.type === 'pos'
    );

    // Calculate total revenue from successful orders only
    const totalRevenue = successfulOrders.reduce((acc: number, order: Order) => acc + order.total, 0);

    return {
      orders: successfulOrders,
      revenue: totalRevenue,
      count: successfulOrders.length
    };
  };

  const generateChartData = (orders: Order[], range: string) => {
    let dataPoints: number = 0;
    let labels: string[] = [];
    const now = new Date();

    switch (range) {
      case 'today':
        dataPoints = 24;
        labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
        break;
      case 'yesterday':
        dataPoints = 24;
        labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
        break;
      case 'week':
        dataPoints = 7;
        labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        break;
      case 'month':
        dataPoints = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        labels = Array.from({ length: dataPoints }, (_, i) => `${i + 1}`);
        break;
      case 'year':
        dataPoints = 12;
        labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        break;
      case 'all':
        dataPoints = 12;
        labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        break;
    }

    const revenueData = Array(dataPoints).fill(0);
    const orderData = Array(dataPoints).fill(0);

    const filteredOrders = orders.filter((order: Order) => 
      order.paymentStatus === 'completed' || order.type === 'pos'
    );

    filteredOrders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      let index: number;

      switch (range) {
        case 'today':
          index = orderDate.getHours();
          break;
        case 'yesterday':
          index = orderDate.getHours();
          break;
        case 'week':
          index = orderDate.getDay();
          break;
        case 'month':
          index = orderDate.getDate() - 1;
          break;
        case 'year':
        case 'all':
          index = orderDate.getMonth();
          break;
        default:
          index = 0;
      }

      if (index >= 0 && index < dataPoints) {
        revenueData[index] += order.total;
        orderData[index]++;
      }
    });

    return { revenueData, orderData, labels };
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      const [orders, products, posCustomers] = await Promise.all([
        orderApi.getAll(),
        productApi.getAll(),
        posCustomerApi.getAll()
      ]);

      // Get unique customers from orders
      const onlineCustomerEmails = new Set(
        orders
          .map((order: Order) => order.shippingAddress?.email)
          .filter(Boolean)
      );

      // Get unique POS customers (excluding those who are also online customers)
      const uniquePosCustomers = posCustomers.filter(
        (posCustomer: any) => !onlineCustomerEmails.has(posCustomer.email)
      ).length;

      const timeRangeStats = getTimeRangeData(orders, timeRange);
      const { revenueData, orderData, labels } = generateChartData(orders, timeRange);

      setStats({
        totalOrders: timeRangeStats.count,
        totalProducts: products.length,
        totalCustomers: onlineCustomerEmails.size + uniquePosCustomers,
        totalRevenue: timeRangeStats.revenue,
        revenueData,
        orderData,
        labels
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontFamily: 'Playfair Display, serif' }}>
          Dashboard Overview
        </Typography>
        <FormControl variant="outlined" size="small">
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="today">Today</MenuItem>
            <MenuItem value="yesterday">Yesterday</MenuItem>
            <MenuItem value="week">This Week</MenuItem>
            <MenuItem value="month">This Month</MenuItem>
            <MenuItem value="year">This Year</MenuItem>
            <MenuItem value="all">All Time</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Revenue"
            value={`₹${stats.totalRevenue.toLocaleString()}`}
            trend={`${timeRange === 'today' ? 'Today' : timeRange === 'week' ? 'This Week' : timeRange === 'month' ? 'This Month' : 'All Time'}`}
            icon={<RevenueIcon />}
            color="#1CC88A"
            chartData={stats.revenueData}
            labels={stats.labels}
            path="orders"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Orders"
            value={stats.totalOrders.toLocaleString()}
            trend="Online + POS Orders"
            icon={<OrdersIcon />}
            color="#36B9CC"
            chartData={stats.orderData}
            path="orders"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Products"
            value={stats.totalProducts.toLocaleString()}
            trend="Active products"
            icon={<ProductsIcon />}
            color="#4E73DF"
            path="products"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Customers"
            value={stats.totalCustomers.toLocaleString()}
            trend="Unique customers"
            icon={<CustomersIcon />}
            color="#F6C23E"
            path="customers"
          />
        </Grid>
        <Grid item xs={12}>
          <Paper
            elevation={0}
            onClick={() => setPosOpen(true)}
            sx={{
              p: 2,
              height: 'auto',
              minHeight: '80px',
              bgcolor: '#E31C79',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.3s ease-in-out',
              cursor: 'pointer',
              '&:hover': {
                transform: 'translateY(-5px)',
              },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', borderRadius: '50%', p: 1 }}>
                <POSIcon />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  New Sale
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Start a new transaction
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <POSWindow open={posOpen} onClose={() => setPosOpen(false)} />
    </Container>
  );
};

export default Dashboard; 