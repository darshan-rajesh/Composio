import { Navbar } from '../components/casestudy/Navbar';
import { Hero } from '../components/casestudy/Hero';
import { ExecutiveSummary } from '../components/casestudy/ExecutiveSummary';
import { Problem } from '../components/casestudy/Problem';
import { Solution } from '../components/casestudy/Solution';
import { ResearchWorkflow } from '../components/casestudy/ResearchWorkflow';
import { KeyFindings } from '../components/casestudy/KeyFindings';
import { PatternAnalysis } from '../components/casestudy/PatternAnalysis';
import { SampleResults } from '../components/casestudy/SampleResults';
import { Challenges } from '../components/casestudy/Challenges';
import { Impact } from '../components/casestudy/Impact';
import { Footer } from '../components/casestudy/Footer';

export function CaseStudy({ onOpenDashboard }) {
  return (
    <div className="min-h-screen bg-bg-primary text-white overflow-x-hidden">
      <Navbar onOpenDashboard={onOpenDashboard} />
      <Hero />
      <ExecutiveSummary />
      <Problem />
      <Solution />
      <ResearchWorkflow />
      <KeyFindings />
      <PatternAnalysis />
      <SampleResults />
      <Challenges />
      <Impact />
      <Footer />
    </div>
  );
}
