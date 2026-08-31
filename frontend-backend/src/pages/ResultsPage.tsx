import { useState } from 'react';
import { Search, Filter, Download, Target, Users, TrendingUp, CheckCircle2, Award, Zap, LayoutGrid, List, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Candidate } from '../types';
import { CandidateCard } from '../components/CandidateCard';
import { CandidateModal } from '../components/CandidateModal';
import { EmailModal } from '../components/EmailModal';
import { ExportService } from '../services/exportService';

interface ResultsPageProps {
  candidates: Candidate[];
  stats: {
    totalCandidates: number;
    relevantCandidates: number;
    averageScore: number;
    topCandidates: number;
  };
}

export function ResultsPage({ candidates, stats }: ResultsPageProps) {
  const [filters, setFilters] = useState({
    sort: 'score-desc',
    relevance: 'all',
    search: '',
    experience: 'all'
  });
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [emailCandidate, setEmailCandidate] = useState<Candidate | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter and sort candidates
  const filteredCandidates = candidates
    .filter(candidate => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          candidate.candidate_name.toLowerCase().includes(searchLower) ||
          candidate.skills.some(skill => skill.toLowerCase().includes(searchLower)) ||
          candidate.summary.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Relevance filter
      if (filters.relevance !== 'all') {
        switch (filters.relevance) {
          case 'relevant':
            if (!candidate.is_relevant) return false;
            break;
          case 'top':
            if (candidate.match_score < 90) return false;
            break;
          case 'strong':
            if (candidate.match_score < 75 || candidate.match_score >= 90) return false;
            break;
          case 'moderate':
            if (candidate.match_score < 50 || candidate.match_score >= 75) return false;
            break;
        }
      }

      // Experience filter
      if (filters.experience !== 'all') {
        switch (filters.experience) {
          case 'entry':
            if (candidate.experience_years > 2) return false;
            break;
          case 'mid':
            if (candidate.experience_years < 3 || candidate.experience_years > 7) return false;
            break;
          case 'senior':
            if (candidate.experience_years < 8) return false;
            break;
        }
      }

      return true;
    })
    .sort((a, b) => {
      switch (filters.sort) {
        case 'score-desc':
          return b.match_score - a.match_score;
        case 'score-asc':
          return a.match_score - b.match_score;
        case 'name-asc':
          return a.candidate_name.localeCompare(b.candidate_name);
        case 'experience-desc':
          return b.experience_years - a.experience_years;
        default:
          return 0;
      }
    });

  const handleExport = async (format: string) => {
    setIsExporting(true);
    try {
      await ExportService.exportCandidates(filteredCandidates, format, stats);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const qualifiedRate = stats.totalCandidates > 0 ? Math.round((stats.relevantCandidates / stats.totalCandidates) * 100) : 0;
  const topTierCount = candidates.filter(c => c.match_score >= 85).length;

  if (candidates.length === 0) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <Target className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Active Screening Run Found</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            Upload your candidate resumes in the Screen Resumes workspace to generate real-time AI leaderboards and match scores.
          </p>
          <Link
            to="/upload"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Zap className="h-4 w-4" />
            <span>Go to Screen Resumes Workspace</span>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in transition-colors">
      
      {/* Top Header & Export Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Candidate Leaderboard
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80">
              {candidates.length} PROCESSED
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Ranked candidate profiles scored by Gemini 2.0 Flash based on skills, experience depth, and requirement fit.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <div className="relative group">
            <button
              disabled={isExporting}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
            >
              <Download className="h-3.5 w-3.5 text-indigo-500" />
              <span>{isExporting ? 'Exporting...' : 'Export Candidate Data'}</span>
            </button>

            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20 text-xs">
              <button
                onClick={() => handleExport('csv')}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
              >
                Export to CSV / Excel
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
              >
                Export Executive Report (PDF)
              </button>
              <button
                onClick={() => handleExport('json')}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
              >
                Export Raw JSON Dossier
              </button>
            </div>
          </div>

          <Link
            to="/analytics"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-indigo-500/20 transition-all"
          >
            <span>Talent Analytics</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Dashboard Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Evaluated</span>
            <Users className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {stats.totalCandidates}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">100% parsed successfully</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Average Match</span>
            <Target className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {stats.averageScore}%
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Across full applicant pool</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Top Tier Matches</span>
            <Award className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
            {topTierCount}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Scored ≥ 85% match</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Qualification Rate</span>
            <CheckCircle2 className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {qualifiedRate}%
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{stats.relevantCandidates} meet threshold</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search by name, skill, or keyword..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Quick Filters: Sort & Experience */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Sort Select */}
            <select
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="score-desc">Match Score (High to Low)</option>
              <option value="score-asc">Match Score (Low to High)</option>
              <option value="name-asc">Candidate Name (A-Z)</option>
              <option value="experience-desc">Years Experience (High to Low)</option>
            </select>

            {/* Relevance Filter Tabs */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              {[
                { id: 'all', label: 'All' },
                { id: 'top', label: 'Top Tier (90%+)' },
                { id: 'strong', label: 'Strong (75-89%)' },
                { id: 'moderate', label: 'Moderate (50-74%)' },
              ].map((rf) => (
                <button
                  key={rf.id}
                  onClick={() => setFilters({ ...filters, relevance: rf.id })}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    filters.relevance === rf.id
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-semibold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {rf.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Candidate Cards Grid */}
      {filteredCandidates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map((candidate, index) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              onViewDetails={() => setSelectedCandidate(candidate)}
              onSendEmail={() => setEmailCandidate(candidate)}
              index={index}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <Search className="h-8 w-8 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No candidates match the current filter</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
            Try clearing search keywords or changing the relevance tier filter.
          </p>
          <button
            onClick={() => setFilters({ sort: 'score-desc', relevance: 'all', search: '', experience: 'all' })}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Candidate Detail Modal */}
      {selectedCandidate && (
        <CandidateModal
          candidate={selectedCandidate}
          isOpen={!!selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}

      {/* Quick Email Modal */}
      {emailCandidate && (
        <EmailModal
          candidate={emailCandidate}
          isOpen={!!emailCandidate}
          onClose={() => setEmailCandidate(null)}
          jobTitle="Target Engineering Role"
        />
      )}
    </main>
  );
}