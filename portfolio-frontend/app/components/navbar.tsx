import { ModeToggle } from "./mode-toggle" 
import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { Menu, X, Code, User, Briefcase, BookOpen, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setIsOpen(false);
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-slate-900/95 backdrop-blur-sm shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Code className="h-8 w-8 text-purple-400" />
            <span className="text-xl font-bold text-white">Portfolio</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => scrollToSection('hero')} className="text-gray-300 hover:text-purple-400 transition-colors">
              <User className="h-4 w-4 inline mr-2" />
              About
            </button>
            <button onClick={() => scrollToSection('projects')} className="text-gray-300 hover:text-purple-400 transition-colors">
              <Briefcase className="h-4 w-4 inline mr-2" />
              Projects
            </button>
            <button onClick={() => scrollToSection('blog')} className="text-gray-300 hover:text-purple-400 transition-colors">
              <BookOpen className="h-4 w-4 inline mr-2" />
              Blog
            </button>
            <button onClick={() => scrollToSection('contact')} className="text-gray-300 hover:text-purple-400 transition-colors">
              <Mail className="h-4 w-4 inline mr-2" />
              Contact
            </button>
            <Link to="/admin">
              <Button variant="outline" size="sm" className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white">
                Admin
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="text-white"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden bg-slate-900/95 backdrop-blur-sm">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button onClick={() => scrollToSection('hero')} className="block px-3 py-2 text-gray-300 hover:text-purple-400">
                About
              </button>
              <button onClick={() => scrollToSection('projects')} className="block px-3 py-2 text-gray-300 hover:text-purple-400">
                Projects
              </button>
              <button onClick={() => scrollToSection('blog')} className="block px-3 py-2 text-gray-300 hover:text-purple-400">
                Blog
              </button>
              <button onClick={() => scrollToSection('contact')} className="block px-3 py-2 text-gray-300 hover:text-purple-400">
                Contact
              </button>
              <Link to="/admin" className="block px-3 py-2 text-purple-400">
                Admin Panel
              </Link>
              <ModeToggle />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

