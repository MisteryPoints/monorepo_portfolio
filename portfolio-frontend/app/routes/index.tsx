
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Hero from '../components/Hero';
import Terminal from '../components/Terminal';
import Projects from '../components/Projects';
import Blog from '../components/Blog';
import SkillTree from '../components/SkillTree';
import Contact from '../components/Contact';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

import DynamicBackground from '../components/DynamicBackground';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

gsap.registerPlugin(ScrollTrigger);

import SkillWheel from '../components/SkillWheel';
import ExperienceTimeline from '../components/ExperienceTimeline';
import HireMeCTA from '../components/HireMeCTA';

import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.fade-in-section',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.2,
          scrollTrigger: {
            trigger: '.fade-in-section',
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, mainRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={mainRef} className="min-h-screen bg-slate-950 text-slate-50 overflow-x-hidden">
      <LanguageSwitcher />
      <HireMeCTA />
      <DynamicBackground />
      <Navbar />
      <Hero />
      <div className="fade-in-section">
        <Terminal />
      </div>
      <div className="fade-in-section">
        <Projects />
      </div>
      <div className="fade-in-section">
        <Blog />
      </div>
      <div className="fade-in-section">
        <ExperienceTimeline />
      </div>
      <div className="fade-in-section">
        <SkillTree />
      </div>
      <div className="fade-in-section">
        <SkillWheel />
      </div>
      <div className="fade-in-section">
        <Contact />
      </div>
      <Footer />
    </div>
  );
}
