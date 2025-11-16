
import React from 'react';

interface DebriefingReportProps {
  report: string;
  onRestart: () => void;
}

const DebriefingReport: React.FC<DebriefingReportProps> = ({ report, onRestart }) => {
  const formattedReport = report.replace(/###\s(.*?)\n/g, '<h3 class="text-xl font-bold text-blue-400 mt-6 mb-2">$1</h3>')
                               .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-100">$1</strong>')
                               .replace(/^- (.*$)/gm, '<li class="ml-5 list-disc">$1</li>');

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-900 p-4 md:p-8">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-100">Relatório de Performance</h1>
            <button
                onClick={onRestart}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold flex items-center"
            >
                Nova Simulação
            </button>
        </div>
        
        <div className="bg-gray-800 p-6 md:p-8 rounded-lg border border-gray-700 shadow-lg">
          <div className="prose prose-invert prose-p:text-gray-300 prose-li:text-gray-300 max-w-none text-gray-300" dangerouslySetInnerHTML={{ __html: formattedReport }} />
        </div>
      </div>
    </div>
  );
};

export default DebriefingReport;
