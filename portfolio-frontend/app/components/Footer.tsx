
import { Github, Linkedin, Mail, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center space-y-6">
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
              <Github size={24} />
            </a>
            <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
              <Linkedin size={24} />
            </a>
            <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
              <Mail size={24} />
            </a>
          </div>
          
          <div className="text-center text-gray-400">
            <p className="flex items-center justify-center">
              Made with <Heart className="mx-2 h-4 w-4 text-red-400" fill="currentColor" /> using React, TypeScript & Tailwind CSS
            </p>
            <p className="mt-2">© 2024 Your Name. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
