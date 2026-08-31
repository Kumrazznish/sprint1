import { useState } from 'react';
import { X, Mail, Phone, Building2, Award, Target, Sparkles, CheckCircle2, AlertTriangle, HelpCircle, Send, Copy, Check, FileText, UserCheck, Shield } from 'lucide-react';
import { Candidate } from '../types';

interface CandidateModalProps {
  candidate: Candidate;
  isOpen: boolean;
  onClose: () => void;
}

export function CandidateModal({ candidate, isOpen, onClose }: CandidateModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'experience' | 'interview' | 'email'>('overview');
  const [emailTemplate, setEmailTemplate] = useState('interview');
  const [copied, setCopied] = useState(false);
  const [customNotes, setCustomNotes] = useState('');

  if (!isOpen) return null;

  const hireProb = Math.round((candidate.hire_probability || (candidate.match_score / 100)) * 100);

  const getTierBadge = (score: number) => {
    if (score >= 90) return { label: 'TOP 5% MATCH', color: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' };
    if (score >= 75) return { label: 'STRONG CANDIDATE', color: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' };
    if (score >= 50) return { label: 'MODERATE FIT', color: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' };
    return { label: 'LOW ALIGNMENT', color: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800' };
  };

  const tier = getTierBadge(candidate.match_score);

  const generatedEmail = `Subject: Invitation to Interview: Senior Role at our Engineering Team

Hi ${candidate.candidate_name.split(' ')[0]},

Thank you for your application. Our talent team reviewed your background and was very impressed by your ${candidate.experience_years} years of professional experience, particularly in ${candidate.matched_skills.slice(0, 3).join(', ')}.

Our AI screening assessment ranked your profile with a high match score (${candidate.match_score}%), and we would love to invite you to an introductory 30-minute video conversation with our hiring team.

Please let us know your availability for this week, or feel free to pick a time slot that works best for you.

Looking forward to speaking with you soon.

Best regards,
Talent Acquisition Team`;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(generatedEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 dark:bg-indigo-500 text-white flex flex-col items-center justify-center font-extrabold shadow-sm">
              <span className="text-xl leading-none">{candidate.match_score}%</span>
              <span className="text-[9px] font-bold uppercase tracking-wider opacity-80">Match</span>
            </div>

            <div>
              <div className="flex items-center space-x-2.5">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {candidate.candidate_name}
                </h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tier.color}`}>
                  {tier.label}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                <span>{candidate.experience_level}</span>
                <span>•</span>
                <span>{candidate.experience_years} Years Experience</span>
                <span>•</span>
                <span>{candidate.contact_info.email || 'Email not listed'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 bg-white dark:bg-slate-900 overflow-x-auto">
          {[
            { id: 'overview', label: 'Executive Summary', icon: Target },
            { id: 'skills', label: 'Skill Gap Matrix', icon: Award },
            { id: 'experience', label: 'Career Trajectory', icon: Building2 },
            { id: 'interview', label: 'AI Interview Prep', icon: HelpCircle },
            { id: 'email', label: 'Interview Invitation', icon: Mail },
          ].map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-3.5 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                  isCurrent
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-6 text-sm">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Scoring KPI Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                    AI Match Index
                  </span>
                  <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                    {candidate.match_score}%
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Calculated across 4 pillars</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                    Hire Probability
                  </span>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {hireProb}%
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">High performance prediction</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                    Skill Alignment
                  </span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {candidate.matched_skills.length} / {candidate.skills.length}
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Core requirements matched</span>
                </div>
              </div>

              {/* AI Evaluator Narrative */}
              <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 space-y-2">
                <div className="flex items-center space-x-2 text-indigo-800 dark:text-indigo-300 font-bold text-xs">
                  <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Gemini AI Executive Evaluation</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {candidate.summary}
                </p>
                {candidate.recommendation && (
                  <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-200 pt-2 border-t border-indigo-100 dark:border-indigo-900/40">
                    Recommendation: {candidate.recommendation}
                  </p>
                )}
              </div>

              {/* Strengths & Weaknesses Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/50 space-y-2">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Verified Core Strengths</span>
                  </div>
                  <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                    {candidate.strengths && candidate.strengths.length > 0 ? (
                      candidate.strengths.map((str, idx) => (
                        <li key={idx} className="flex items-start space-x-1.5">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{str}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-400 italic">Strong technical trajectory and solid background.</li>
                    )}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50 space-y-2">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span>Gaps & Potential Areas for Probe</span>
                  </div>
                  <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                    {candidate.weaknesses && candidate.weaknesses.length > 0 ? (
                      candidate.weaknesses.map((wk, idx) => (
                        <li key={idx} className="flex items-start space-x-1.5">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{wk}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-400 italic">No critical blockers identified for this role.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SKILLS */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Matched Skills */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span>Directly Matched Skills ({candidate.matched_skills.length})</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 px-2 py-0.5 rounded">
                      Verified
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.matched_skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 dark:border-emerald-500/30"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      <span>Missing Job Requirements ({candidate.missing_skills.length})</span>
                    </span>
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-800/60 px-2 py-0.5 rounded">
                      Evaluate
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.missing_skills.length > 0 ? (
                      candidate.missing_skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20 dark:border-amber-500/30"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No missing critical skills detected.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Complete Skill Portfolio */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Complete Extracted Skill Portfolio ({candidate.skills.length} total)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-200/60 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300/60 dark:border-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EXPERIENCE */}
          {activeTab === 'experience' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-2.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Seniority & Credentials</span>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200/60 dark:border-indigo-800/60">{candidate.experience_years} Years Total</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs pt-1">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block mb-1 font-medium text-[11px]">Education / Degree</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">{candidate.education || 'B.S. in Computer Science'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block mb-1 font-medium text-[11px]">Expected Salary Benchmark</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">{candidate.salary_range || 'Competitive'}</span>
                  </div>
                </div>
              </div>

              {candidate.notable_companies && candidate.notable_companies.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">Notable Organizations</span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {candidate.notable_companies.map((comp) => (
                      <span key={comp} className="px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-500/10 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 dark:border-indigo-500/30">
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: INTERVIEW PREP */}
          {activeTab === 'interview' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 dark:text-white">
                <HelpCircle className="h-4 w-4 text-indigo-600" />
                <span>AI-Generated Role & Competency Interview Questions</span>
              </div>

              <div className="space-y-3">
                {candidate.interview_questions && candidate.interview_questions.length > 0 ? (
                  candidate.interview_questions.map((q, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-800 dark:text-white">Question {idx + 1}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 pl-7 leading-relaxed">{q}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400">
                    Generating role-specific technical questions...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: EMAIL INVITATION */}
          {activeTab === 'email' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    AI Interview Invitation Email
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Personalized based on candidate's match score and experience
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Copied to Clipboard' : 'Copy Email'}</span>
                </button>
              </div>

              <textarea
                value={generatedEmail}
                readOnly
                rows={12}
                className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
          >
            Close Dossier
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('email')}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
          >
            Draft Interview Invite
          </button>
        </div>
      </div>
    </div>
  );
}