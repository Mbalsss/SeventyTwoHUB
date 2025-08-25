import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import Header from './Header';
import MobileNav from './MobileNav';

const Layout: React.FC = () => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background-accent">
      {/* Desktop Navigation */}
      <div className="hidden md:flex">
        <Navigation />
        <div className="flex-1 ml-56">
          <Header onMobileMenuToggle={() => setIsMobileNavOpen(!isMobileNavOpen)} />
          <main className="p-6">
            <Outlet /> {/* Nested routes will render here */}
          </main>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <Header onMobileMenuToggle={() => setIsMobileNavOpen(!isMobileNavOpen)} />
        <main className="pb-20 px-4 pt-4">
          <Outlet /> {/* Nested routes for mobile */}
        </main>
        <MobileNav />
      </div>

      {/* Mobile Navigation Overlay */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileNavOpen(false)}
          />
          <div className="fixed top-0 left-0 w-56 h-full bg-white shadow-lg">
            <Navigation onClose={() => setIsMobileNavOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
