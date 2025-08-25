import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Users, Target, Award, Flame, Star, ChevronRight, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase, getUserProfile, getUserBusiness } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import MetricCard from '../components/MetricCard';
import QuickActions from '../components/QuickActions';
import RecentActivity from '../components/RecentActivity';
import DailyTip from '../components/DailyTip';
import GamificationPanel from '../components/GamificationPanel.tsx';
import Chatbot from '../components/Chatbot';


const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [enrolledPrograms, setEnrolledPrograms] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userBusiness, setUserBusiness] = useState<any>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Load enrolled programs if user is authenticated
    if (user) {
      loadEnrolledPrograms(user.id);
      loadUserData();
    }
    
    return () => clearInterval(timer);
  }, [user]);

  const loadUserData = async () => {
    try {
      if (!user) return;
      
      // Load user profile
      const profile = await getUserProfile(user.id);
      setUserProfile(profile);
      
      // Try to load business data
      try {
        const business = await getUserBusiness(user.id);
        setUserBusiness(business);
      } catch (error) {
        console.log('No business data found for user');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };
  const loadEnrolledPrograms = async (userId: string) => {
    try {
      console.log('Dashboard - Loading enrolled programs for user:', userId);
      
      const { data, error } = await supabase
        .from('program_enrollments')
        .select(`
          *,
          programs(*)
        `)
        .eq('participant_id', userId)
        .eq('status', 'active');

      if (error) throw error;
      console.log('Dashboard - Enrolled programs loaded:', data?.length || 0);
      setEnrolledPrograms(data || []);
    } catch (error) {
      console.error('Error loading enrolled programs:', error);
    }
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'af', name: 'Afrikaans' },
    { code: 'zu', name: 'isiZulu' },
    { code: 'xh', name: 'isiXhosa' },
    { code: 'st', name: 'Sesotho' },
    { code: 'tn', name: 'Setswana' },
  ];

  const translations = {
    en: {
      welcome: "Welcome to SeventyTwo X",
      subtitle: "Empowering South African entrepreneurs to build thriving businesses",
      monthlyRevenue: "Monthly Revenue",
      activeCustomers: "Active Customers",
      growthRate: "Growth Rate",
      goalsAchieved: "Goals Achieved",
      dailyChallenge: "Today's Challenge",
      yourProgress: "Your Progress",
      quickActions: "Quick Actions"
    },
    af: {
      welcome: "Welkom by SeventyTwo X",
      subtitle: "Bemagtiging van Suid-Afrikaanse entrepreneurs om florerende besighede te bou",
      monthlyRevenue: "Maandelikse Inkomste",
      activeCustomers: "Aktiewe Kliënte",
      growthRate: "Groeikoers",
      goalsAchieved: "Doelwitte Bereik",
      dailyChallenge: "Vandag se Uitdaging",
      yourProgress: "Jou Vordering",
      quickActions: "Vinnige Aksies"
    },
    zu: {
      welcome: "Siyakwamukela ku-SeventyTwo X",
      subtitle: "Sinikeza amandla osomabhizinisi baseNingizimu Afrika ukuthi bakhe amabhizinisi aphumelelayo",
      monthlyRevenue: "Imali Yenyanga",
      activeCustomers: "Amakhasimende Asebenzayo",
      growthRate: "Izinga Lokukhula",
      goalsAchieved: "Izinjongo Ezifinyelelwe",
      dailyChallenge: "Inselelo Yanamuhla",
      yourProgress: "Inqubekelaphambili Yakho",
      quickActions: "Izenzo Ezisheshayo"
    }
  };

  const t = translations[selectedLanguage] || translations.en;

  const metrics = [
    {
      title: t.monthlyRevenue,
      value: 'R12,450',
      change: '+15.2%',
      trend: 'up' as const,
      icon: DollarSign,
    },
    {
      title: t.activeCustomers,
      value: '247',
      change: '+8.7%',
      trend: 'up' as const,
      icon: Users,
    },
    {
      title: t.growthRate,
      value: '18.3%',
      change: '+3.1%',
      trend: 'up' as const,
      icon: TrendingUp,
    },
    {
      title: t.goalsAchieved,
      value: '6/10',
      change: '60%',
      trend: 'up' as const,
      icon: Target,
    },
  ];

  const dailyChallenges = [
    {
      title: "Post 3 products on the marketplace",
      description: "Increase your visibility by showcasing your best products",
      reward: "50 XP + Visibility Badge",
      progress: 1,
      total: 3
    },
    {
      title: "Complete Financial Planning module",
      description: "Learn essential budgeting skills for your business",
      reward: "100 XP + Finance Expert Badge",
      progress: 0,
      total: 1
    },
    {
      title: "Connect with 2 mentors",
      description: "Expand your network and get valuable advice",
      reward: "75 XP + Networker Badge",
      progress: 0,
      total: 2
    }
  ];

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (selectedLanguage === 'zu') {
      if (hour < 12) return 'Sawubona';
      if (hour < 17) return 'Sanibonani';
      return 'Sawubona';
    } else if (selectedLanguage === 'af') {
      if (hour < 12) return 'Goeie môre';
      if (hour < 17) return 'Goeie middag';
      return 'Goeie aand';
    }
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getUserDisplayName = () => {
    if (userProfile?.full_name) {
      return userProfile.full_name.split(' ')[0]; // First name only
    }
    if (user?.email) {
      return user.email.split('@')[0]; // Email username
    }
    return 'User';
  };
  return (
    <div className="space-y-4 animate-fade-in px-2 sm:px-0">
      {/* Language Selector */}
      <div className="flex justify-end mb-4">
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
        >
          {languages.map(lang => (
            <option key={lang.code} value={lang.code}>{lang.name}</option>
          ))}
        </select>
      </div>

      {/* Welcome Section */}
      <div className="bg-background-primary rounded-xl p-4 sm:p-6 text-text-light">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">
          {getGreeting()}, {getUserDisplayName()}! 🚀
        </h1>
        <h2 className="text-lg sm:text-xl font-semibold mb-2">{t.welcome}</h2>
        <p className="text-text-light opacity-90 mb-4 text-sm sm:text-base">
          {t.subtitle}
        </p>
        {userBusiness && (
          <div className="bg-background-dark bg-opacity-20 rounded-lg p-3 mt-4">
            <p className="text-sm text-text-light opacity-80">
              <span className="font-medium">{userBusiness.business_name}</span> • {userBusiness.business_category}
            </p>
          </div>
        )}
        <div className="text-sm text-text-light opacity-75">
          {currentTime.toLocaleDateString('en-ZA', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Enrolled Programs */}
      {enrolledPrograms.length > 0 && (
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">My Programs</h3>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
          
          <div className="space-y-3">
            {enrolledPrograms.map((enrollment) => (
              <div 
                key={enrollment.id} 
                onClick={() => navigate(`/program/${enrollment.program_id}`)}
                className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 cursor-pointer transition-colors"
              >
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{enrollment.programs.name}</p>
                  <p className="text-xs text-gray-600">Progress: {enrollment.completion_percentage}%</p>
                </div>
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${enrollment.completion_percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gamification Panel */}
      <GamificationPanel />

      {/* Daily Tip & Challenge */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DailyTip language={selectedLanguage} />
        
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-4">
            <Flame className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold text-gray-900">{t.dailyChallenge}</h3>
          </div>
          
          <div className="space-y-3">
            {dailyChallenges.slice(0, 1).map((challenge, index) => (
              <div key={index} className="p-3 bg-orange-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-1 text-sm">{challenge.title}</h4>
                <p className="text-gray-600 text-xs mb-2">{challenge.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(challenge.progress / challenge.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600">{challenge.progress}/{challenge.total}</span>
                  </div>
                  <span className="text-xs text-orange-600 font-medium">{challenge.reward}</span>
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-3 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
            View All Challenges
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <QuickActions />
        <RecentActivity />
      </div>

      {/* Community Highlights */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Community Highlights</h3>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">NM</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Nomsa shared a success story</p>
              <p className="text-xs text-gray-600">"Increased sales by 40% using digital marketing tips!"</p>
            </div>
            <Star className="w-4 h-4 text-yellow-500" />
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">SP</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Sipho is offering mentorship</p>
              <p className="text-xs text-gray-600">Retail business expert - 5 years experience</p>
            </div>
            <Award className="w-4 h-4 text-green-500" />
          </div>
        </div>
      </div>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
};

export default Dashboard;