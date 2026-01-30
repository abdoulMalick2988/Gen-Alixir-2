import HeroSection from '@/components/home/HeroSection'
import CommunityTicker from '@/components/home/CommunityTicker'
import ProjectsPreview from '@/components/home/ProjectsPreview'
import Section from '@/components/ui/Section'
import Button from '@/components/ui/Button'
import Link from 'next/link'

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <HeroSection />
      
      {/* Community Ticker */}
      <CommunityTicker />
      
      {/* Projects Preview */}
      <Section background="black" containerSize="lg">
        <ProjectsPreview />
      </Section>
      
      {/* CTA Section */}
      <Section background="black" containerSize="md" className="text-center">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-glow opacity-20 blur-3xl"></div>
          <div className="relative space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Prêt à transformer vos idées en <span className="text-emerald-400">réalité</span> ?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Rejoignez une communauté de créateurs, développeurs, designers et entrepreneurs 
              passionnés par l'innovation en Afrique et dans la diaspora.
            </p>
            <Link href="/join">
              <Button variant="primary" size="lg">
                Rejoindre GEN ALIXIR
              </Button>
            </Link>
          </div>
        </div>
      </Section>
    </>
  )
}
