import React, { useState, useEffect } from 'react';
import { Eye, Menu, X } from 'lucide-react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToContent = () => {
    const contentSection = document.getElementById('content-section');
    if (contentSection) {
      contentSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: '识别', href: '#recognition' },
    { name: '功能', href: '#features' },
    { name: '支持', href: '#support' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/80 backdrop-blur-apple shadow-sm border-b border-gray-200/50' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">机器视觉识别系统</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200 hover:underline underline-offset-4"
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex items-center space-x-4">
            <button 
              onClick={scrollToContent}
              className="px-6 py-2 bg-apple-blue text-white rounded-full font-medium hover:bg-blue-600 transition-all duration-200 hover:shadow-lg hover:scale-105"
            >
              立即体验
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-apple border-t border-gray-200/50 py-4 space-y-4 fade-in">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
            <div className="px-4 pt-4 border-t border-gray-200">
              <button 
                onClick={() => {
                  scrollToContent();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full px-6 py-3 bg-apple-blue text-white rounded-full font-medium hover:bg-blue-600 transition-colors"
              >
                立即体验
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;