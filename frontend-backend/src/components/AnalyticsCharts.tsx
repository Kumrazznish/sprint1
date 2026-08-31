import { BarChart3, PieChart, TrendingUp, Activity, CheckCircle2, AlertTriangle, Layers, Users, Zap } from 'lucide-react';

interface AnalyticsChartsProps {
  data: any;
}

export function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  if (!data) return null;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Chart 1: Match Score Distribution */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Match Score Distribution</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Applicant performance bell curve</p>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">
            Histogram
          </span>
        </div>

        <div className="space-y-3 pt-1">
          {data.scoreDistribution.map((item: any, index: number) => {
            const maxCount = Math.max(...data.scoreDistribution.map((d: any) => d.count), 1);
            const percentage = Math.round((item.count / maxCount) * 100);

            return (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{item.range}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{item.label}</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {item.count} {item.count === 1 ? 'applicant' : 'applicants'}
                  </span>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(percentage, item.count > 0 ? 5 : 0)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart 2: Experience Breakdown */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Seniority & Experience Spread</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Tenure distribution across candidate pool</p>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">
            Seniority
          </span>
        </div>

        <div className="space-y-3 pt-2">
          {Object.entries(data.experienceBreakdown).map(([level, count]: [string, any], idx) => {
            const total = Object.values(data.experienceBreakdown).reduce((a: any, b: any) => a + b, 0) as number;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;

            return (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between transition-colors">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100">{level}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{pct}% of talent pool</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">{count}</div>
                  <div className="text-[10px] text-slate-400 font-medium">candidates</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart 3: Skills Demand vs Supply */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 lg:col-span-2">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Top Extracted Skills & Frequency</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Dominant technical competencies discovered across uploaded resumes</p>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 px-2 py-0.5 rounded">
            AI Extracted
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
          {data.skillsAnalysis.topSkills.map(([skill, count]: [string, number], i: number) => (
            <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate pr-2">{skill}</span>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 px-2 py-0.5 rounded">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}