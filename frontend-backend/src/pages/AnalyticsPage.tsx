import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Award, Target, Brain, PieChart, Activity, Star, CheckCircle2, AlertTriangle, Zap, Download, ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Candidate } from '../types';
import { AnalyticsCharts } from '../components/AnalyticsCharts';
import { AnalyticsInsights } from '../components/AnalyticsInsights';

interface AnalyticsPageProps {
  candidates: Candidate[];
  stats: {
    totalCandidates: number;
    relevantCandidates: number;
    averageScore: number;
    topCandidates: number;
  };
}

export function AnalyticsPage({ candidates, stats }: AnalyticsPageProps) {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    generateAnalytics();
  }, [candidates]);

  const generateAnalytics = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      const analytics = {
        scoreDistribution: generateScoreDistribution(),
        experienceBreakdown: generateExperienceBreakdown(),
        skillsAnalysis: generateSkillsAnalysis(),
      };
      
      setAnalyticsData(analytics);
      setIsLoading(false);
    }, 400);
  };

  const generateScoreDistribution = () => {
    const ranges = [
      { range: '90 - 100%', count: 0, label: 'Exceptional Fit' },
      { range: '80 - 89%', count: 0, label: 'Strong Alignment' },
      { range: '70 - 79%', count: 0, label: 'Qualified' },
      { range: '60 - 69%', count: 0, label: 'Moderate Fit' },
      { range: '50 - 59%', count: 0, label: 'Low Fit' },
      { range: '0 - 49%', count: 0, label: 'Unmatched' }
    ];

    candidates.forEach(candidate => {
      const score = candidate.match_score;
      if (score >= 90) ranges[0].count++;
      else if (score >= 80) ranges[1].count++;
      else if (score >= 70) ranges[2].count++;
      else if (score >= 60) ranges[3].count++;
      else if (score >= 50) ranges[4].count++;
      else ranges[5].count++;
    });

    return ranges;
  };

  const generateExperienceBreakdown = () => {
    const breakdown = {
      'Early Career (0 - 2 yrs)': 0,
      'Mid-Level (3 - 5 yrs)': 0,
      'Senior (6 - 8 yrs)': 0,
      'Principal / Lead (9+ yrs)': 0
    };

    candidates.forEach(candidate => {
      const years = candidate.experience_years;
      if (years <= 2) breakdown['Early Career (0 - 2 yrs)']++;
      else if (years <= 5) breakdown['Mid-Level (3 - 5 yrs)']++;
      else if (years <= 8) breakdown['Senior (6 - 8 yrs)']++;
      else breakdown['Principal / Lead (9+ yrs)']++;
    });

    return breakdown;
  };

  const generateSkillsAnalysis = () => {
    const skillCounts: { [key: string]: number } = {};

    candidates.forEach(candidate => {
      candidate.skills.forEach(skill => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    });

    const topSkills = Object.entries(skillCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    return { topSkills };
  };

  if (candidates.length === 0) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Analytics Available Yet</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            Run an AI screening session on the Screen Resumes page to generate candidate distribution charts and skill telemetry.
          </p>
          <Link
            to="/upload"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Zap className="h-4 w-4" />
            <span>Screen Candidate Resumes</span>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in transition-colors">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Talent Pool Analytics & Insights
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80">
              AI TELEMETRY
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Statistical distribution, skill frequency mapping, and hiring funnel quality metrics for this role.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/results"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Leaderboard</span>
          </Link>
        </div>
      </div>

      {/* Structured AI Insights */}
      {analyticsData && (
        <AnalyticsInsights
          data={analyticsData}
          candidates={candidates}
          stats={stats}
        />
      )}

      {/* Visual Analytics Charts */}
      {isLoading ? (
        <div className="p-16 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="text-xs text-slate-400 font-medium">Computing talent distribution charts...</span>
        </div>
      ) : (
        analyticsData && <AnalyticsCharts data={analyticsData} />
      )}
    </main>
  );
}