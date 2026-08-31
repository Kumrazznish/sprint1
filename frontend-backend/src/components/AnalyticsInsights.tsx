import { Brain, TrendingUp, Users, Award, AlertTriangle, CheckCircle2, Info, Sparkles, Target, Zap } from 'lucide-react';
import { Candidate } from '../types';

interface AnalyticsInsightsProps {
  data: any;
  candidates: Candidate[];
  stats: any;
}

export function AnalyticsInsights({ data, candidates, stats }: AnalyticsInsightsProps) {
  if (!data) return null;

  const topTierCount = candidates.filter(c => c.match_score >= 85).length;
  const seniorCount = candidates.filter(c => c.experience_years >= 6).length;
  const seniorPct = candidates.length > 0 ? Math.round((seniorCount / candidates.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Executive AI Summary Card */}
      <div className="p-6 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 shadow-sm space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-indigo-700 dark:text-indigo-300">
          <Sparkles className="h-4 w-4" />
          <span>Gemini AI Talent Advisory Report</span>
        </div>
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          Based on the evaluation of {candidates.length} candidate profiles against your job specification, 
          {topTierCount > 0 
            ? ` you have ${topTierCount} high-conviction candidate${topTierCount > 1 ? 's' : ''} scoring above 85% with immediate interview viability.`
            : ' the applicant pool shows moderate skill alignment with room for targeted technical probes.'}
          {seniorPct > 40 && ` The pool is senior-heavy (${seniorPct}% with 6+ years experience), which indicates strong leadership readiness.`}
        </p>
      </div>

      {/* Structured Insight Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            <span>Pool Viability</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Average match score is <strong>{stats.averageScore}%</strong>. {stats.averageScore >= 70 ? 'Strong candidate-to-requirement correlation.' : 'May require broadening outreach.'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-indigo-700 dark:text-indigo-400">
            <Users className="h-4 w-4" />
            <span>Seniority Density</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <strong>{seniorPct}%</strong> of applicants have 6+ years experience. Appropriate for Staff / Senior band compensation.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-700 dark:text-amber-400">
            <Zap className="h-4 w-4" />
            <span>Recommended Action</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Fast-track the top {Math.max(1, topTierCount)} ranked candidates to introductory technical screening calls within 48 hours.
          </p>
        </div>
      </div>
    </div>
  );
}