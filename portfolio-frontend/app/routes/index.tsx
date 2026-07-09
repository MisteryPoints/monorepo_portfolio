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

import SkillWheel from '../components/SkillWheel';
import ExperienceTimeline from '../components/ExperienceTimeline';
import HireMeCTA from '../components/HireMeCTA';

import { createFileRoute } from '@tanstack/react-router';
import { useInView } from '@/hooks/use-in-view';
import type { ReactNode } from 'react';

export const Route = createFileRoute('/')({
  component: Index,
});

function FadeInSection({ children }: { children: ReactNode }) {
  const [ref, inView] = useInView();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {children}
    </div>
  );
}

function Index() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 overflow-x-hidden">
      <LanguageSwitcher />
      <HireMeCTA />
      <DynamicBackground />
      <Navbar />
      <Hero />
      <FadeInSection><Terminal /></FadeInSection>
      <FadeInSection><ExperienceTimeline /></FadeInSection>
      <FadeInSection><SkillTree /></FadeInSection>
      <FadeInSection><SkillWheel /></FadeInSection>
      <FadeInSection><Projects /></FadeInSection>
      <FadeInSection><Blog /></FadeInSection>
      <FadeInSection><Contact /></FadeInSection>
      <Footer />
    </div>
  );
}
