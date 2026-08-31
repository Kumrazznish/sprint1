import { UploadSection } from '../components/UploadSection';
import { UploadedFile } from '../types';

interface UploadPageProps {
  jobDescription: string;
  onJobDescriptionChange: (value: string) => void;
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  onNavigateToResults: () => void;
}

export function UploadPage({
  jobDescription,
  onJobDescriptionChange,
  files,
  onFilesChange,
  onAnalyze,
  isAnalyzing,
}: UploadPageProps) {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors">
      <UploadSection
        jobDescription={jobDescription}
        onJobDescriptionChange={onJobDescriptionChange}
        files={files}
        onFilesChange={onFilesChange}
        onAnalyze={onAnalyze}
        isAnalyzing={isAnalyzing}
      />
    </main>
  );
}