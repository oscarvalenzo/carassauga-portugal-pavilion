import { useState } from 'react';
import { MapPin, Trophy, Users, Sparkles, ChevronDown, QrCode, Calendar, Star, ArrowRight, Camera } from 'lucide-react';
import Timeline from '../components/Timeline';

interface LandingScreenProps {
  onEnter: () => void;
}

export default function LandingScreen({ onEnter }: LandingScreenProps) {
  return (
    <div className="relative w-full h-full overflow-y-auto scroll-smooth bg-background font-sf-text text-primary-dark" id="landing-container">
      {/* Hero Section - Full Viewport Height */}
      <section className="relative min-h-screen h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Enhanced Overlay for Better Text Visibility */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1555883006-0f5a0915a80f?w=1920&q=80"
            alt="Portugal Pavilion"
            className="w-full h-full object-cover"
          />
          {/* Darker gradient overlay for better text contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
        </div>

        {/* Minimal Top Bar with Enhanced Contrast */}
        <nav className="absolute top-0 left-0 right-0 z-50 px-8 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white backdrop-blur-xl rounded-xl flex items-center justify-center text-xl shadow-lg">
                🇵🇹
              </div>
              <span className="text-white font-sf-text font-semibold text-sf-base tracking-sf-normal drop-shadow-lg">Carassauga</span>
            </div>
            
            <button
              onClick={onEnter}
              className="bg-white text-primary-dark px-6 py-2.5 rounded-full font-sf-text font-semibold text-sf-sm hover:bg-white/95 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg"
            >
              Open
            </button>
          </div>
        </nav>

        {/* Hero Content - Apple Style with Balanced Sizing */}
        <div className="relative z-10 text-center px-8 max-w-6xl mx-auto">
          {/* Title with reasonable size */}
          <div className="mb-12">
            <h1 className="font-sf-display font-bold text-[3rem] md:text-[4rem] lg:text-[5rem] text-white mb-0 tracking-[-0.03em] leading-[0.95] animate-slideUp drop-shadow-2xl">
              Bem-vindo!
            </h1>
          </div>
          
          {/* Main subtitle */}
          <div className="mb-12">
            <p className="font-sf-text text-[1.25rem] md:text-[1.5rem] text-white font-medium max-w-3xl mx-auto leading-[1.4] animate-slideUp tracking-tight drop-shadow-lg" style={{ animationDelay: '0.1s' }}>
              Experience Portuguese culture and heritage
            </p>
          </div>

          {/* Secondary description */}
          <div className="mb-16">
            <p className="font-sf-text text-[1rem] md:text-[1.125rem] text-white/90 font-normal max-w-2xl mx-auto leading-[1.5] animate-slideUp tracking-tight drop-shadow-md" style={{ animationDelay: '0.15s' }}>
              Interactive quests, authentic cuisine, and unforgettable moments
            </p>
          </div>

          {/* Buttons with better proportions */}
          <div className="flex flex-col items-stretch justify-center gap-5 animate-slideUp max-w-md mx-auto w-full" style={{ animationDelay: '0.2s' }}>
            <button
              onClick={onEnter}
              className="w-full bg-white text-[#001011] px-10 py-4 rounded-full font-sf-text font-semibold text-[1.125rem] hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 shadow-2xl flex items-center justify-center gap-3 tracking-tight"
            >
              <span>Start Your Journey</span>
              <ArrowRight size={20} strokeWidth={2.5} className="text-[#001011]" />
            </button>
            
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full bg-white/15 backdrop-blur-2xl text-white px-10 py-4 rounded-full font-sf-text font-semibold text-[1rem] hover:bg-white/25 active:scale-95 transition-all duration-300 border-2 border-white/50 tracking-tight shadow-xl"
            >
              Learn more
            </button>
          </div>
        </div>

        {/* Scroll Indicator with More Space */}
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 animate-float">
          <ChevronDown size={28} className="text-white/70 drop-shadow-lg" strokeWidth={2} />
        </div>
      </section>

      {/* Features Section - Apple Card Style with Increased Spacing */}
      <section id="features" className="py-40 px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          {/* Section Header with More Breathing Room */}
          <div className="text-center mb-32">
            <h2 className="font-sf-display text-sf-5xl md:text-sf-7xl font-semibold text-primary-dark mb-8 tracking-sf-tighter leading-[1.1]">
              Four ways to explore.
            </h2>
            <p className="font-sf-text text-sf-2xl text-secondary font-normal max-w-2xl mx-auto leading-relaxed tracking-tight">
              Complete quests. Earn badges. Make memories.
            </p>
          </div>

          {/* Feature Grid - Vertical Stack with Generous Spacing */}
          <div className="flex flex-col gap-8 max-w-2xl mx-auto">
            {[
              {
                emoji: '🍴',
                title: 'Foodie Explorer',
                description: 'Discover authentic Portuguese dishes.',
                gradient: 'from-orange-400 to-pink-500',
                color: 'bg-white'
              },
              {
                emoji: '🎭',
                title: 'Culture Keeper',
                description: 'Learn about rich heritage and traditions.',
                gradient: 'from-purple-400 to-indigo-500',
                color: 'bg-white'
              },
              {
                emoji: '⚽',
                title: 'Futebol Fan',
                description: 'Celebrate the beautiful game.',
                gradient: 'from-green-400 to-emerald-500',
                color: 'bg-white'
              },
              {
                emoji: '📸',
                title: 'Memory Maker',
                description: 'Capture AR photos and moments.',
                gradient: 'from-blue-400 to-cyan-500',
                color: 'bg-white'
              },
            ].map((feature, i) => (
              <div
                key={feature.title}
                onClick={onEnter}
                className={`${feature.color} rounded-3xl p-10 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 animate-slideUp cursor-pointer border border-secondary/10`}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-lg`}>
                  {feature.emoji}
                </div>
                <h3 className="font-sf-display text-sf-2xl font-semibold text-primary-dark mb-3 tracking-tight leading-tight">
                  {feature.title}
                </h3>
                <p className="font-sf-text text-sf-base text-secondary leading-relaxed font-normal tracking-tight">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Uber-Style Timeline with Generous Spacing */}
      <section className="py-40 px-8 bg-secondary/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-32">
            <h2 className="font-sf-display text-sf-5xl md:text-sf-7xl font-semibold text-primary-dark mb-8 tracking-sf-tighter leading-[1.1]">
              Simple to start.
            </h2>
            <p className="font-sf-text text-sf-2xl text-secondary font-normal max-w-2xl mx-auto leading-relaxed tracking-tight">
              Three steps to your cultural adventure.
            </p>
          </div>

          {/* Vertical Timeline with More Padding */}
          <div className="max-w-2xl mx-auto bg-white rounded-3xl p-12 md:p-16 shadow-lg border border-secondary/10">
            <Timeline
              items={[
                {
                  icon: <QrCode size={20} strokeWidth={2.5} />,
                  title: 'Scan QR codes',
                  description: 'Find codes at food stations, activities, and displays throughout the pavilion. Each scan unlocks points and progresses your quest.',
                  status: 'completed',
                },
                {
                  icon: <Trophy size={20} strokeWidth={2.5} />,
                  title: 'Complete quests',
                  description: 'Earn points, unlock badges, and track your progress on the leaderboard. Compete with your family and other visitors.',
                  status: 'active',
                },
                {
                  icon: <Camera size={20} strokeWidth={2.5} />,
                  title: 'Share memories',
                  description: 'Take AR photos, save recipes, and get a personalized video recap. Your digital passport preserves every moment.',
                  status: 'upcoming',
                },
              ]}
            />
          </div>
        </div>
      </section>

      {/* Stats Section - Apple Numbers Style with Generous Spacing */}
      <section className="py-48 px-8 bg-background border-t border-secondary/10">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col gap-24 text-center">
            {[
              { number: '8', label: 'Interactive Quests', gradient: 'from-orange-500 to-pink-500' },
              { number: '12', label: 'Unique Badges', gradient: 'from-purple-500 to-indigo-500' },
              { number: '100+', label: 'Cultural Activities', gradient: 'from-blue-500 to-cyan-500' },
            ].map((stat, i) => (
              <div key={stat.label} className="animate-slideUp py-8" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className={`font-sf-display text-sf-8xl md:text-sf-9xl font-bold bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent mb-6 tracking-sf-tighter leading-none`}>
                  {stat.number}
                </div>
                <div className="font-sf-text text-sf-xl text-secondary font-normal tracking-tight">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Apple Product Launch Style with Maximum Breathing Room */}
      <section className="py-56 px-8 bg-gradient-to-b from-background to-white">
        <div className="max-w-5xl mx-auto text-center">
          <div className="mb-16">
            <h2 className="font-sf-display text-sf-6xl md:text-sf-8xl font-bold text-primary-dark mb-0 tracking-sf-tighter leading-[1.1]">
              Ready to begin
              <br />
              your journey?
            </h2>
          </div>
          <div className="mb-20">
            <p className="font-sf-text text-sf-2xl text-secondary font-normal max-w-2xl mx-auto leading-relaxed tracking-tight">
              Join thousands experiencing Portugal like never before.
            </p>
          </div>
          <div className="flex flex-col items-stretch justify-center gap-6 max-w-md mx-auto w-full">
            <button
              onClick={onEnter}
              className="w-full bg-gradient-to-br from-accent to-accent/90 text-primary-dark px-14 py-6 rounded-full font-sf-text font-bold text-sf-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 shadow-2xl tracking-tight"
            >
              <span>Get started</span>
              <ArrowRight size={24} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full text-primary px-14 py-6 rounded-full font-sf-text font-semibold text-sf-xl hover:bg-primary/10 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 tracking-tight"
            >
              <span>Watch the film</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer - Minimal Apple Style with Extra Breathing Room */}
      <footer className="py-20 px-8 bg-secondary/5 border-t border-secondary/10">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center justify-center gap-8 text-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-dark text-base font-semibold shadow-sm">
                🇵🇹
              </div>
              <span className="font-sf-text text-sf-base text-secondary tracking-tight">Carassauga Portugal Pavilion</span>
            </div>
            <div className="font-sf-text text-sf-sm text-secondary/60 tracking-tight">
              © 2025 All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}


