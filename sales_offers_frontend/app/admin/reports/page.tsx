"use client";

import { useState, useEffect } from "react";
import AdminLayout from "../../../components/AdminLayout";
import { FiDownload, FiCalendar, FiFileText, FiBarChart, FiUsers, FiDollarSign } from "react-icons/fi";
import { api } from "../../../lib/api";

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState("revenue");
  const [dateRange, setDateRange] = useState("30d");

  const reports = [
    {
      id: "clicks",
      title: "Clicks Report",
      description: "Detailed click analytics and commission breakdown",
      icon: FiDollarSign,
      color: "green"
    },
    {
      id: "users",
      title: "User Activity Report",
      description: "User registration and activity metrics",
      icon: FiUsers,
      color: "blue"
    },
    {
      id: "deals",
      title: "Deals Performance",
      description: "Deal click-through rates and affiliate performance",
      icon: FiBarChart,
      color: "purple"
    },
    {
      id: "sellers",
      title: "Affiliate Analytics",
      description: "Affiliate performance and commission metrics",
      icon: FiFileText,
      color: "orange"
    }
  ];

  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRecentReports();
  }, []);

  const fetchRecentReports = async () => {
    try {
      const response = await api.get('/api/admin/reports/');
      setRecentReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      const response = await api.post('/api/admin/reports/', {
        report_type: selectedReport,
        date_range: dateRange,
        format: 'PDF'
      });
      
      alert(`Report generated successfully! ${response.data.message}`);
      fetchRecentReports(); // Refresh the list
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Please try again.');
    }
    setLoading(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[rgb(var(--color-fg))]">Reports</h1>
            <p className="text-[rgb(var(--color-muted))]">Generate and download detailed reports</p>
          </div>
          <div className="flex items-center space-x-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            <span>Admin Only</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Report Selection */}
          <div className="lg:col-span-1">
            <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
              <h3 className="text-lg font-semibold text-[rgb(var(--color-fg))] mb-4">Select Report Type</h3>
              <div className="space-y-3">
                {reports.map((report) => (
                  <button
                    key={report.id}
                    onClick={() => setSelectedReport(report.id)}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${
                      selectedReport === report.id
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-ui))]'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg bg-${report.color}-100 dark:bg-${report.color}-900/30`}>
                        <report.icon className={`w-5 h-5 text-${report.color}-600 dark:text-${report.color}-400`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-[rgb(var(--color-fg))]">{report.title}</h4>
                        <p className="text-sm text-[rgb(var(--color-muted))] mt-1">{report.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Report Configuration */}
          <div className="lg:col-span-2">
            <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))]">
              <h3 className="text-lg font-semibold text-[rgb(var(--color-fg))] mb-4">Report Configuration</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-2">Date Range</label>
                  <div className="flex items-center space-x-2">
                    <FiCalendar className="text-[rgb(var(--color-muted))] w-4 h-4" />
                    <select
                      className="flex-1 px-3 py-2 border border-[rgb(var(--color-border))] rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))]"
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                    >
                      <option value="7d">Last 7 days</option>
                      <option value="30d">Last 30 days</option>
                      <option value="90d">Last 90 days</option>
                      <option value="6m">Last 6 months</option>
                      <option value="1y">Last year</option>
                      <option value="custom">Custom range</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-2">Export Format</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button className="p-3 border border-[rgb(var(--color-border))] rounded-lg hover:bg-[rgb(var(--color-ui))] transition-colors">
                      <div className="text-center">
                        <FiFileText className="w-6 h-6 mx-auto mb-1 text-[rgb(var(--color-muted))]" />
                        <span className="text-sm text-[rgb(var(--color-fg))]">PDF</span>
                      </div>
                    </button>
                    <button className="p-3 border border-[rgb(var(--color-border))] rounded-lg hover:bg-[rgb(var(--color-ui))] transition-colors">
                      <div className="text-center">
                        <FiBarChart className="w-6 h-6 mx-auto mb-1 text-[rgb(var(--color-muted))]" />
                        <span className="text-sm text-[rgb(var(--color-fg))]">Excel</span>
                      </div>
                    </button>
                    <button className="p-3 border border-[rgb(var(--color-border))] rounded-lg hover:bg-[rgb(var(--color-ui))] transition-colors">
                      <div className="text-center">
                        <FiFileText className="w-6 h-6 mx-auto mb-1 text-[rgb(var(--color-muted))]" />
                        <span className="text-sm text-[rgb(var(--color-fg))]">CSV</span>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="border-t border-[rgb(var(--color-border))] pt-6">
                  <button
                    onClick={generateReport}
                    disabled={loading}
                    className="flex items-center space-x-2 w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    <FiDownload className="w-4 h-4" />
                    <span>{loading ? 'Generating...' : 'Generate Report'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Reports */}
            <div className="bg-[rgb(var(--color-card))] rounded-xl p-6 border border-[rgb(var(--color-border))] mt-6">
              <h3 className="text-lg font-semibold text-[rgb(var(--color-fg))] mb-4">Recent Reports</h3>
              <div className="space-y-3">
                {recentReports.length === 0 ? (
                  <p className="text-[rgb(var(--color-muted))] text-center py-4">No reports generated yet</p>
                ) : (
                  recentReports.map((report: any) => (
                    <div key={report.id} className="flex items-center justify-between p-3 rounded-lg bg-[rgb(var(--color-ui))]">
                      <div className="flex items-center space-x-3">
                        <FiFileText className="w-5 h-5 text-[rgb(var(--color-muted))]" />
                        <div>
                          <p className="text-sm font-medium text-[rgb(var(--color-fg))]">{report.name}</p>
                          <p className="text-xs text-[rgb(var(--color-muted))]">
                            {new Date(report.created_at).toLocaleDateString()} • {report.file_size} • {report.format}
                          </p>
                        </div>
                      </div>
                      <button className="p-2 text-[rgb(var(--color-muted))] hover:text-red-600 transition-colors">
                        <FiDownload className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}