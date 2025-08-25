import React, { useState, useEffect, useCallback } from 'react';
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
  Cell 
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  DollarSign, 
  Download,
  RefreshCw
} from 'lucide-react';
import { getUsersSince, getProgramsWithCounts, getRegistrationsSince } from '../../lib/adminAnalytics';

// Types for analytics data to avoid never[] inference
type TimeSeriesPoint = { date: string; count: number };
type ProgramStatsItem = { name: string; applications: number; enrollments: number; status?: string };
type CategoryItem = { name: string; value: number; color: string };
type RevenueItem = { date: string; revenue: number; subscriptions: number };

type AnalyticsData = {
  userGrowth: TimeSeriesPoint[];
  programStats: ProgramStatsItem[];
  registrationTrends: TimeSeriesPoint[];
  revenueData: RevenueItem[];
  topCategories: CategoryItem[];
};

type TimeRange = '7days' | '30days' | '90days' | '1year';

const AdminAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('30days');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    userGrowth: [],
    programStats: [],
    registrationTrends: [],
    revenueData: [],
    topCategories: []
  });



  const loadAnalyticsData =useCallback( async () => {
    try {
      setLoading(true);
      
      // Calculate date ranges
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

      // Load data via centralized lib queries
      const [users, programs, registrations] = await Promise.all([
        getUsersSince(startDate.toISOString()),
        getProgramsWithCounts(),
        getRegistrationsSince(startDate.toISOString())
      ]);

      // Process user growth data
      const userGrowthData = processTimeSeriesData(users || [], 'created_at', timeRange);
      
      // Process registration trends
      const registrationTrendsData = processTimeSeriesData(registrations || [], 'created_at', timeRange);
      
      // Process program statistics
      const programStatsData = (programs || []).map(program => ({
        name: program.name.substring(0, 20) + (program.name.length > 20 ? '...' : ''),
        applications: program.program_applications?.[0]?.count || 0,
        enrollments: program.program_enrollments?.[0]?.count || 0,
        status: program.status
      }));

      // Process category distribution
      const categoryData = processCategoryData(registrations || []);

      // Mock revenue data (replace with actual revenue tracking)
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
  }, [timeRange]);

    useEffect(() => {
        loadAnalyticsData();
    }, [loadAnalyticsData]);

  const processTimeSeriesData = <K extends string, T extends Record<K, string>>(
    data: T[],
    dateField: K,
    range: TimeRange
  ) => {
    const groupedData: { [key: string]: number } = {};
    
    data.forEach(item => {
      const date = new Date(item[dateField]);
      let key: string;
      
      if (range === '7days' || range === '30days') {
        key = date.toLocaleDateString();
      } else if (range === '90days') {
        // Group by week
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toLocaleDateString();
      } else {
        // Group by month
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }
      
      groupedData[key] = (groupedData[key] || 0) + 1;
    });

    return Object.entries(groupedData).map(([date, count]) => ({
      date,
      count
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const processCategoryData = (registrations: Array<{ business_category: string }>) => {
    const categoryCount: { [key: string]: number } = {};
    
    registrations.forEach(reg => {
      const category = reg.business_category;
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    const colors = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
    
    return Object.entries(categoryCount)
      .map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  };

  const generateMockRevenueData = (range: string) => {
    const data = [];
    const periods = range === '7days' ? 7 : range === '30days' ? 30 : range === '90days' ? 12 : 12;
    
    for (let i = 0; i < periods; i++) {
      const date = new Date();
      if (range === '7days' || range === '30days') {
        date.setDate(date.getDate() - (periods - 1 - i));
      } else {
        date.setMonth(date.getMonth() - (periods - 1 - i));
      }
      
      data.push({
        date: range === '1year' ? date.toLocaleDateString('en-US', { month: 'short' }) : date.toLocaleDateString(),
        revenue: Math.floor(Math.random() * 50000) + 100000,
        subscriptions: Math.floor(Math.random() * 100) + 200
      });
    }
    
    return data;
  };

  const exportAnalytics = () => {
    // Export analytics data as CSV
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

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Platform Analytics</h2>
          <p className="text-gray-600">Monitor platform performance and user engagement</p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
            <option value="1year">Last year</option>
          </select>
          
          <button
            onClick={exportAnalytics}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          
          <button
            onClick={loadAnalyticsData}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* User Growth Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">User Growth Trend</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analyticsData.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#0ea5e9" 
                strokeWidth={3}
                dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 4 }}
                name="New Users"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Program Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Program Performance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.programStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="applications" fill="#0ea5e9" name="Applications" radius={[4, 4, 0, 0]} />
                <Bar dataKey="enrollments" fill="#10b981" name="Enrollments" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Business Categories */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Business Categories</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsData.topCategories}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {analyticsData.topCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {analyticsData.topCategories.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Trends */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue & Subscriptions</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analyticsData.revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value, name) => [
                  name === 'revenue' ? `R${value.toLocaleString()}` : value,
                  name === 'revenue' ? 'Revenue' : 'Subscriptions'
                ]}
              />
              <Bar dataKey="revenue" fill="#8b5cf6" name="Revenue" radius={[4, 4, 0, 0]} />
              <Bar dataKey="subscriptions" fill="#06b6d4" name="Subscriptions" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Key Metrics Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Key Performance Indicators</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Metric
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Period
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Previous Period
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Change
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                { metric: 'New User Registrations', current: 247, previous: 198, icon: Users },
                { metric: 'Business Applications', current: 89, previous: 76, icon: FileText },
                { metric: 'Program Enrollments', current: 156, previous: 134, icon: TrendingUp },
                { metric: 'Platform Revenue', current: 245000, previous: 213000, icon: DollarSign, isCurrency: true }
              ].map((row, index) => {
                const change = ((row.current - row.previous) / row.previous * 100);
                const Icon = row.icon;
                
                return (
                  <tr key={index}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-900">{row.metric}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.isCurrency ? `R${row.current.toLocaleString()}` : row.current.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {row.isCurrency ? `R${row.previous.toLocaleString()}` : row.previous.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        change >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;