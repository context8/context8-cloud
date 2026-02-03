import * as React from 'react';
import { LandingFooter } from '@/pages/home/LandingFooter';
import { LandingHero } from '@/pages/home/LandingHero';
import { LandingNavbar } from '@/pages/home/LandingNavbar';
import { LandingCta } from '@/pages/home/sections/LandingCta';
import { LandingFeatureGrid } from '@/pages/home/sections/LandingFeatureGrid';
import { LandingFrameworks } from '@/pages/home/sections/LandingFrameworks';
import { LandingStories } from '@/pages/home/sections/LandingStories';
import { LandingTrustedBy } from '@/pages/home/sections/LandingTrustedBy';

export function Home() {
  return (
    <div className="sb min-h-screen font-sans antialiased overflow-x-hidden">
      <LandingNavbar />
      <main className="relative">
        <LandingHero />
        <LandingTrustedBy />
        <LandingFeatureGrid />
        <LandingFrameworks />
        <LandingStories />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  );
}
