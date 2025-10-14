'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiDownload, FiCalendar, FiFileText, FiImage, 
  FiX, FiCheck, FiLoader, FiMail
} from 'react-icons/fi';

interface AnalyticsExportProps {
  isOpen: boolean;
  onClose: () => void;
  plan: string;
}

const ExportOption = ({ icon: Icon, title, description, format, available, onSelect }: any) => (
  <motion.button
    whileHover={{ scale: available ? 1.02 : 1 }}
    whileTap={{ scale: available ? 0.98 : 1 }}
    onClick={available ? onSelect : undefined}
    className={`w-full p-4 rounded-lg border-2 transition-all ${
      available 
        ? 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 bg-white dark:bg-gray-800'
        : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 opacity-60 cursor-not-allowed'
    }`}
  >
    <div className="flex items-start gap-4">
      <div className={`p-3 rounded-lg ${
        available ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-700'
      }`}>
        <Icon className={`w-6 h-6 ${
          available ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
        }`} />
      </div>
      <div className="flex-1 text-left">
        <h3 className={`font-semibold mb-1 ${
          available ? 'text-gray-900 dark:text-white' : 'text-gray-500'
        }`}>
          {title}
        </h3>
        <p className={`text-sm mb-2 ${
          available ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400'
        }`}>
          {description}
        </p>
        <span className={`text-xs px-2 py-1 rounded-full ${
          available 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
        }`}>
          {format}
        </span>
        {!available && (
          <span className="ml-2 text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
            Pro/Enterprise Only
          </span>
        )}
      </div>
    </div>
  </motion.button>
);

export default function AnalyticsExport({ isOpen, onClose, plan }: AnalyticsExportProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('30days');
  const [exporting, setExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  const handleExport = async (format: string) => {
    setExporting(true);
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setExporting(false);
    setExportComplete(true);
    
    // Reset after 3 seconds
    setTimeout(() => {
      setExportComplete(false);
      onClose();
    }, 3000);
  };

  const exportOptions = [
    {
      icon: FiFileText,
      title: 'CSV Report',
      description: 'Detailed spreadsheet with all analytics data',
      format: 'CSV',
      available: true
    },
    {
      icon: FiImage,
      title: 'Visual Report',
      description: 'PDF with charts and visual insights',
      format: 'PDF',
      available: plan !== 'Basic'
    },
    {
      icon: FiMail,
      title: 'Email Report',
      description: 'Automated weekly/monthly reports via email',
      format: 'Email',
      available: plan === 'Enterprise'
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Export Analytics
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Download your performance data and insights
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <FiX className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Time Period Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Select Time Period
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: '7days', label: 'Last 7 Days' },
                    { value: '30days', label: 'Last 30 Days' },
                    { value: '90days', label: 'Last 3 Months' },
                    { value: 'year', label: 'This Year' }
                  ].map((period) => (
                    <button
                      key={period.value}
                      onClick={() => setSelectedPeriod(period.value)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedPeriod === period.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <FiCalendar className="w-4 h-4 mx-auto mb-1" />
                      <span className="text-sm font-medium">{period.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Export Options */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Export Format
                </label>
                <div className="space-y-3">
                  {exportOptions.map((option) => (
                    <ExportOption
                      key={option.format}
                      icon={option.icon}
                      title={option.title}
                      description={option.description}
                      format={option.format}
                      available={option.available}
                      onSelect={() => handleExport(option.format)}
                    />
                  ))}
                </div>
              </div>

              {/* Export Status */}
              <AnimatePresence>
                {(exporting || exportComplete) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-4 rounded-lg border ${
                      exportComplete
                        ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                        : 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {exporting ? (
                        <FiLoader className="w-5 h-5 text-blue-600 animate-spin" />
                      ) : (
                        <FiCheck className="w-5 h-5 text-green-600" />
                      )}
                      <div>
                        <p className={`font-medium ${
                          exportComplete ? 'text-green-800 dark:text-green-300' : 'text-blue-800 dark:text-blue-300'
                        }`}>
                          {exporting ? 'Preparing your export...' : 'Export completed successfully!'}
                        </p>
                        <p className={`text-sm ${
                          exportComplete ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'
                        }`}>
                          {exporting 
                            ? 'This may take a few moments depending on the data size.'
                            : 'Your analytics report has been downloaded.'
                          }
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Plan Upgrade Notice */}
              {plan === 'Basic' && (
                <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <FiDownload className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-1">
                        Unlock Advanced Exports
                      </h4>
                      <p className="text-sm text-purple-700 dark:text-purple-400 mb-3">
                        Upgrade to Pro or Enterprise for PDF reports, automated email reports, and advanced data insights.
                      </p>
                      <button className="text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300">
                        Upgrade Now →
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}