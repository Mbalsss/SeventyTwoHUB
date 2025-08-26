import React from 'react';
import { useNavigate } from 'react-router-dom';
import logoSvg from '../assets/seventytwo-logo.svg';

const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
      <div className="min-h-screen relative overflow-hidden group/page">
        {/* Background with tropical beach image */}
        <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-300 group-hover/dropdown:blur-sm"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), 
                           url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`
            }}
        />

        {/* Navigation Header */}
        <nav className="relative z-10 flex items-center justify-between px-6 py-4">
          <div className="flex items-center">
            <div className="flex items-center mr-8">
              <img
                  src={logoSvg}
                  alt="SeventyTwo X Logo"
                  className="h-10 w-auto filter brightness-0 invert"
              />
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {/* About Us Dropdown */}
            <div className="relative group group/dropdown">
              <div className="text-white hover:text-blue-300 cursor-pointer">
                <span>About Us</span>
              </div>
              <div className="absolute top-full left-0 mt-2 w-80 bg-blue-300/95 backdrop-blur-sm rounded-lg shadow-xl border border-blue-400/30 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">About SeventyTwo X</h3>
                  <p className="text-white text-sm leading-relaxed mb-4">
                    SeventyTwo X is a mobile-first, AI-driven platform designed to accelerate the growth of small businesses,
                    especially in South African townships and rural areas.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <p className="text-white text-sm">Empowering entrepreneurs with personalized tools</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <p className="text-white text-sm">Supporting local communities and businesses</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <p className="text-white text-sm">Building the future of digital entrepreneurship</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Startup Success Toolkit Dropdown */}
            <div className="relative group group/dropdown">
              <div className="text-white hover:text-blue-300 cursor-pointer">
                <span>Startup Success Toolkit</span>
              </div>
              <div className="absolute top-full left-0 mt-2 w-80 bg-blue-300/95 backdrop-blur-sm rounded-lg shadow-xl border border-blue-400/30 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Startup Success Toolkit</h3>
                  <p className="text-white text-sm leading-relaxed mb-4">
                    Comprehensive tools and resources designed to help entrepreneurs launch, grow, and scale their businesses effectively.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <p className="text-white text-sm">Business planning and strategy templates</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <p className="text-white text-sm">Financial management and budgeting tools</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <p className="text-white text-sm">Marketing and customer acquisition strategies</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <p className="text-white text-sm">AI-powered business insights and analytics</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Education & Learning Dropdown */}
            <div className="relative group group/dropdown">
              <div className="text-white hover:text-blue-300 cursor-pointer">
                <span>Education & Learning</span>
              </div>
              <div className="absolute top-full left-0 mt-2 w-80 bg-blue-300/95 backdrop-blur-sm rounded-lg shadow-xl border border-blue-400/30 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Education & Learning</h3>
                  <p className="text-white text-sm leading-relaxed mb-4">
                    Access comprehensive educational resources, courses, and mentorship programs designed to build entrepreneurial skills.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                      <p className="text-white text-sm">Interactive business courses and workshops</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                      <p className="text-white text-sm">Mentorship programs with industry experts</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                      <p className="text-white text-sm">Digital skills training and certification</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                      <p className="text-white text-sm">Community learning and networking opportunities</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
                onClick={() => navigate('/login')}
                className="bg-white text-green-800 px-4 py-2 rounded-md hover:bg-green-50 transition-colors font-medium"
            >
              LogIn
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <div className="relative z-10 flex items-center min-h-[calc(100vh-80px)] px-8 transition-all duration-300 group-hover/dropdown:blur-sm">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-3 items-center">
            {/* Left side - Form/Card (WeTransfer style - smaller) */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 max-w-xs">
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-white text-lg font-semibold mb-1">Register your business</h3>
                <p className="text-white/80 text-sm">Get Unlimited Growth for Your Business</p>
              </div>

              <div className="space-y-3">
                <input
                    type="email"
                    placeholder="Business Name"
                    className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded text-white placeholder-white/60 focus:outline-none focus:border-white/50 text-sm"
                />
                <input
                    type="text"
                    placeholder="Business Industry"
                    className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded text-white placeholder-white/60 focus:outline-none focus:border-white/50 text-sm"
                />
                <input
                    type="text"
                    placeholder="Ownership Type"
                    className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded text-white placeholder-white/60 focus:outline-none focus:border-white/50 text-sm"
                />
                <textarea
                    placeholder="Declaration"
                    rows={2}
                    className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded text-white placeholder-white/60 focus:outline-none focus:border-white/50 resize-none text-sm"
                />
              </div>
            </div>

            {/* Right side - Content (wider, smaller fonts) */}
            <div className="text-white text-center lg:text-left lg:col-span-2">
              <p className="text-xl mb-3 opacity-90">Welcome to SeventyTwo X</p>
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-5">
                Ready to grow your<br />
                Business?
              </h1>
              <div className="mb-6">
                <p className="text-sm opacity-90 mb-3 leading-relaxed">
                  Join thousands of South African entrepreneurs who are working hard every day to grow their businesses by finding new customers,
                  improving their products or services, building strong teams, using smart strategies,
                  and taking advantage of opportunities that help them succeed in a competitive and ever-changing business environment.
                </p>

                {/* Scrollable content area */}
                <div className="max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-white/10 pr-2">
                  <p className="text-sm opacity-90 mb-3 leading-relaxed">
                    SeventyTwo X is a mobile-first, AI-driven platform designed to accelerate the growth of small businesses,
                    especially in South African townships and rural areas.
                    Offering personalized tools, educational resources, and a supportive community,
                    SeventyTwo X helps entrepreneurs overcome challenges like limited access to growth tools,
                    digital adoption issues, and lack of local mentorship.

                  </p>

                  {/* Additional content can be added here */}
                  <p className="text-sm opacity-90 mb-3 leading-relaxed">
                    With localized content, multi-language support, and affordable business software,
                    our platform provides a mobile-first experience optimized for low-bandwidth environments.
                    Gamified growth pathways and AI-powered insights make scaling your business both engaging and practical.
                    Join SeventyTwo X today and unlock the tools you need to grow and succeed in the digital economy.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <button
                    onClick={() => navigate('/register/account-validated')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-md text-sm font-semibold transition-colors"
                >
                  Register My Business
                </button>

              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default WelcomeScreen;