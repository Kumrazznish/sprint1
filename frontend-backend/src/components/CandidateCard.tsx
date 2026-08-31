import { Eye, Mail, Phone, Send, Building2, GraduationCap, Award, TrendingUp, CheckCircle2, AlertTriangle, Sparkles, ChevronRight, User } from 'lucide-react';
import { Candidate } from '../types';

interface CandidateCardProps {
  candidate: Candidate;
  onViewDetails: () => void;
  onSendEmail: () => void;
  index: number;
}

export function CandidateCard({ candidate, onViewDetails, onSendEmail, index }: CandidateCardProps) {
  const getTierInfo = (score: number) => {
    if (score >= 90) return { 
      tier: 'TOP TIER MATCH', 
      badgeColor: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      ringColor: 'text-emerald-600 dark:text-emerald-400',
      borderHover: 'hover:border-emerald-400 dark:hover:border-emerald-600'
    };
    if (score >= 75) return { 
      tier: 'STRONG CANDIDATE', 
      badgeColor: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      ringColor: 'text-indigo-600 dark:text-indigo-400',
      borderHover: 'hover:border-indigo-400 dark:hover:border-indigo-600'
    };
    if (score >= 50) return { 
      tier: 'MODERATE FIT', 
      badgeColor: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      ringColor: 'text-amber-600 dark:text-amber-400',
      borderHover: 'hover:border-amber-400 dark:hover:border-amber-600'
    };
    return { 
      tier: 'LOW ALIGNMENT', 
      badgeColor: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      ringColor: 'text-rose-600 dark:text-rose-400',
      borderHover: 'hover:border-rose-400 dark:hover:border-rose-600'
    };
  };

  const { tier, badgeColor, ringColor, borderHover } = getTierInfo(candidate.match_score);
  const hireProb = Math.round((candidate.hire_probability || (candidate.match_score / 100)) * 100);

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 p-6 flex flex-col justify-between ${borderHover}`}
    >
      <div>
        {/* Top Header: Rank, Avatar, Name & Overall Score */}
        <div className="flex items-start justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start space-x-3.5 min-w-0">
            {/* Rank badge + Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold text-base">
                {candidate.candidate_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              <span className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-extrabold flex items-center justify-center shadow">
                #{index + 1}
              </span>
            </div>

            {/* Candidate Name & Info */}
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                  {candidate.candidate_name}
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                  {tier}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                <span>{candidate.experience_level || 'Experienced'}</span>
                <span>•</span>
                <span>{candidate.experience_years} Years Exp</span>
                {candidate.contact_info.email && (
                  <>
                    <span>•</span>
                    <span className="truncate max-w-[140px]">{candidate.contact_info.email}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Match Score Radial Display */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="relative w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center">
              <span className={`text-lg font-extrabold tracking-tight ${ringColor}`}>
                {candidate.match_score}%
              </span>
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                MATCH
              </span>
            </div>
          </div>
        </div>

        {/* AI Synopsis */}
        <div className="py-4">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
            {candidate.summary}
          </p>
        </div>

        {/* Multi-Dimensional Score Metrics */}
        <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 mb-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">
              Hire Probability
            </span>
            <div className="flex items-center space-x-1.5">
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 dark:bg-indigo-400 h-full rounded-full" style={{ width: `${hireProb}%` }} />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{hireProb}%</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">
              Experience Depth
            </span>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {candidate.experience_years} yrs
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">
              Skill Coverage
            </span>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {candidate.matched_skills.length} Matched
            </div>
          </div>
        </div>

        {/* Skills Tag Section */}
        <div className="space-y-2 mb-4">
          {/* Matched Skills */}
          {candidate.matched_skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 items-center">
              {candidate.matched_skills.slice(0, 4).map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                >
                  <CheckCircle2 className="h-2.5 w-2.5 mr-1 text-emerald-500" />
                  {skill}
                </span>
              ))}
              {candidate.matched_skills.length > 4 && (
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 self-center">
                  +{candidate.matched_skills.length - 4} more
                </span>
              )}
            </div>
          )}

          {/* Missing Skills (if any) */}
          {candidate.missing_skills && candidate.missing_skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 items-center">
              {candidate.missing_skills.slice(0, 3).map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60"
                >
                  <AlertTriangle className="h-2.5 w-2.5 mr-1 text-amber-500" />
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* AI Recommendation Quote */}
        {candidate.recommendation && (
          <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-200 mb-5">
            <div className="flex items-center space-x-1.5 font-bold mb-1 text-[11px] text-indigo-700 dark:text-indigo-300">
              <Sparkles className="h-3 w-3" />
              <span>AI Evaluator Note:</span>
            </div>
            <p className="line-clamp-2 leading-relaxed text-[11px] text-slate-600 dark:text-slate-300">
              {candidate.recommendation}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onViewDetails}
          className="flex-1 inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
        >
          <Eye className="h-3.5 w-3.5" />
          <span>View AI Dossier</span>
        </button>

        {candidate.contact_info.email && (
          <button
            type="button"
            onClick={onSendEmail}
            className="inline-flex items-center justify-center space-x-1 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
            title="Compose AI Interview Invitation"
          >
            <Send className="h-3.5 w-3.5 text-indigo-500" />
            <span>Invite</span>
          </button>
        )}
      </div>
    </div>
  );
}