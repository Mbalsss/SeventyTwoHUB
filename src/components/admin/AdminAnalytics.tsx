import React, { useState, useEffect } from 'react'; // <-- CORRECTED LINE
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  TrendingUp,
  Users,
  FileText,
  DollarSign,
  Download
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

// Helper component for the summary cards to avoid repetition
const SummaryCard = ({ icon: Icon, title, value, change, color, textColor }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm flex items-start justify-between">
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800 my-1">{value}</p>
      <p className={`text-xs font-medium ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{change}</p>
    </div>
    <div className={`p-3 rounded-full ${color}`}>
      <Icon className={`w-5 h-5 ${textColor}`} />
    </div>
  </div>
);


const AdminAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30days');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    userGrowth: [],
    programStats: [],
    registrationTrends: [],
    revenueData: [],
    topCategories: []
  });

  // --- YOUR ORIGINAL DATA FETCHING AND PROCESSING LOGIC ---
  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '7days':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30days':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90days':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      const { data: users } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      const { data: programs } = await supabase
        .from('programs')
        .select(`*, program_applications(count), program_enrollments(count)`);

      const { data: registrations } = await supabase
        .from('business_registrations')
        .select('created_at, business_category, status')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      const userGrowthData = processTimeSeriesData(users || [], 'created_at', timeRange);
      const registrationTrendsData = processTimeSeriesData(registrations || [], 'created_at', timeRange);
      
      const programStatsData = (programs || []).map(program => ({
        name: program.name.substring(0, 15) + (program.name.length > 15 ? '...' : ''),
        applications: program.program_applications?.[0]?.count || 0,
        enrollments: program.program_enrollments?.[0]?.count || 0,
      }));

      const categoryData = processCategoryData(registrations || []);
      const revenueData = generateMockRevenueData(timeRange);

      setAnalyticsData({
        userGrowth: userGrowthData,
        programStats: programStatsData,
        registrationTrends: registrationTrendsData,
        revenueData,
        topCategories: categoryData
      });

    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processTimeSeriesData = (data: any[], dateField: string, range: string) => {
    const groupedData: { [key: string]: number } = {};
    
    data.forEach(item => {
      const date = new Date(item[dateField]);
      let key: string;
      
      if (range === '7days' || range === '30days') {
        key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else if (range === '90days') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else {
        key = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      }
      
      groupedData[key] = (groupedData[key] || 0) + 1;
    });

    return Object.entries(groupedData).map(([date, count]) => ({
      date,
      count
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const processCategoryData = (registrations: any[]) => {
    const categoryCount: { [key: string]: number } = {};
    registrations.forEach(reg => {
      categoryCount[reg.business_category] = (categoryCount[reg.business_category] || 0) + 1;
    });

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
    
    return Object.entries(categoryCount)
      .map(([name, value], index) => ({ name, value, color: colors[index % colors.length] }))
      .sort((a, b) => b.value - a.value).slice(0, 6);
  };

  const generateMockRevenueData = (range: string) => {
    const data = [];
    const periods = range === '7days' ? 7 : range === '30days' ? 30 : range === '90days' ? 12 : 12;
    for (let i = 0; i < periods; i++) {
      const date = new Date();
      if (range === '7days' || range === '30days') date.setDate(date.getDate() - (periods - 1 - i));
      else date.setMonth(date.getMonth() - (periods - 1 - i));
      data.push({
        date: range === '1year' ? date.toLocaleDateString('en-US', { month: 'short' }) : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: Math.floor(Math.random() * 50000) + 100000,
        subscriptions: Math.floor(Math.random() * 100) + 200
      });
    }
    return data;
  };
  
  const exportAnalytics = () => {
    const csvContent = [
      ['Metric', 'Value', 'Date'],
      ...analyticsData.userGrowth.map(item => ['User Signups', item.count, item.date]),
      ...analyticsData.registrationTrends.map(item => ['Business Registrations', item.count, item.date])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // --- MOCK KPI DATA (from your original table) ---
  const kpiData = [
    { metric: 'New Users', current: 247, previous: 198, icon: Users, color: 'bg-pink-100', textColor: 'text-pink-600' },
    { metric: 'Applications', current: 89, previous: 76, icon: FileText, color: 'bg-orange-100', textColor: 'text-orange-600' },
    { metric: 'Enrollments', current: 156, previous: 134, icon: TrendingUp, color: 'bg-green-100', textColor: 'text-green-600' },
    { metric: 'Revenue', current: 245000, previous: 213000, icon: DollarSign, isCurrency: true, color: 'bg-purple-100', textColor: 'text-purple-600' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Platform Analytics</h1>
            <p className="text-sm text-gray-500">Performance and engagement summary</p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
              <option value="1year">Last year</option>
            </select>
            <button 
              onClick={exportAnalytics}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
        
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiData.map((kpi, index) => {
            const change = ((kpi.current - kpi.previous) / kpi.previous * 100);
            return (
              <SummaryCard
                key={index}
                icon={kpi.icon}
                title={kpi.metric}
                value={kpi.isCurrency ? `$${(kpi.current/1000).toFixed(1)}k` : kpi.current.toLocaleString()}
                change={`${change >= 0 ? '+' : ''}${change.toFixed(1)}%`}
                color={kpi.color}
                textColor={kpi.textColor}
              />
            )
          })}
        </div>
        
        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth Chart */}
          <div className="col-span-1 lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">User Growth Trend</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData.userGrowth} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" name="New Users" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Program Performance */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">Program Performance</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.programStats} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend iconType="circle" iconSize={8} />
                  <Bar dataKey="applications" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={12} />
                  <Bar dataKey="enrollments" fill="#10b981" radius={[4, 4, 0, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Business Categories */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">Business Categories</h3>
            <div className="h-80 flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={analyticsData.topCategories} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5}>
                    {analyticsData.topCategories.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue and Subscriptions */}
          <div className="col-span-1 lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">Revenue & Subscriptions</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.revenueData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="left" orientation="left" stroke="#8b5cf6" axisLine={false} tickLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                  <YAxis yAxisId="right" orientation="right" stroke="#06b6d4" axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Legend iconType="circle" iconSize={8} />
                  <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={12} />
                  <Bar yAxisId="right" dataKey="subscriptions" name="Subscriptions" fill="#06b6d4" radius={[4, 4, 0, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;