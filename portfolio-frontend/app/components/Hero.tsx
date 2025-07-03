
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Github, Linkedin, Mail, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      
      tl.fromTo(titleRef.current, 
        { opacity: 0, y: 100 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
      )
      .fromTo(subtitleRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
        '-=0.5'
      )
      .fromTo(buttonsRef.current?.children,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' },
        '-=0.3'
      );

      // Floating animation for hero section
      gsap.to(heroRef.current, {
        y: -20,
        duration: 3,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: -1
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="hero" className="min-h-screen flex items-center justify-center pt-16 px-4 sm:px-6 lg:px-8">
      <div ref={heroRef} className="text-center max-w-4xl mx-auto">
        <h1 
          ref={titleRef}
          className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 mb-6"
        >
          Full Stack Developer
        </h1>
        
        <p 
          ref={subtitleRef}
          className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed"
        >
          Crafting digital experiences with modern technologies. 
          Passionate about clean code, innovative solutions, and bringing ideas to life.
        </p>

        <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-8 py-3">
            <Mail className="mr-2 h-5 w-5" />
            Get In Touch
          </Button>
          
          <Button variant="outline" size="lg" className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white px-8 py-3">
            <Download className="mr-2 h-5 w-5" />
            Download CV
          </Button>
        </div>

        <div className="flex justify-center space-x-6 mt-12">
          <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
            <Github size={28} />
          </a>
          <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
            <Linkedin size={28} />
          </a>
          <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
            <Mail size={28} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
