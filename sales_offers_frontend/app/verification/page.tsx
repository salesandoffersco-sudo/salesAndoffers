"use client";

import { useState } from "react";
import { FiUpload, FiFile, FiCheck, FiX, FiInfo } from "react-icons/fi";

export default function VerificationPage() {
  const [formData, setFormData] = useState({
    businessDescription: "",
    yearsInBusiness: "",
    numberOfEmployees: "",
    annualRevenue: "",
  });
  const [files, setFiles] = useState({
    businessLicense: null as File | null,
    taxCertificate: null as File | null,
    idDocument: null as File | null,
    businessRegistration: null as File | null,
  });
  const [portfolioImages, setPortfolioImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles({ ...files, [field]: file });
    }
  };

  const handlePortfolioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    setPortfolioImages([...portfolioImages, ...newFiles]);
  };

  const removePortfolioImage = (index: number) => {
    setPortfolioImages(portfolioImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Mock submission
    setTimeout(() => {
      setLoading(false);
      alert("Verification request submitted successfully!");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[rgb(var(--color-card))] rounded-xl shadow-lg border border-[rgb(var(--color-border))] overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
            <h1 className="text-2xl font-bold">Business Verification</h1>
            <p className="opacity-90 mt-2">Submit your documents for business verification to unlock premium features</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Business Information */}
            <div>
              <h2 className="text-lg font-semibold text-[rgb(var(--color-fg))] mb-4">Business Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-2">
                    Years in Business *
                  </label>
                  <input
                    type="number"
                    name="yearsInBusiness"
                    value={formData.yearsInBusiness}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))] focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-2">
                    Number of Employees *
                  </label>
                  <input
                    type="number"
                    name="numberOfEmployees"
                    value={formData.numberOfEmployees}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))] focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-2">
                    Annual Revenue Range
                  </label>
                  <select
                    name="annualRevenue"
                    value={formData.annualRevenue}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))] focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select range</option>
                    <option value="0-500k">KES 0 - 500,000</option>
                    <option value="500k-2m">KES 500,000 - 2,000,000</option>
                    <option value="2m-10m">KES 2,000,000 - 10,000,000</option>
                    <option value="10m+">KES 10,000,000+</option>
                  </select>
                </div>
              </div>
              <div className="mt-6">
                <label className="block text-sm font-medium text-[rgb(var(--color-fg))] mb-2">
                  Business Description *
                </label>
                <textarea
                  name="businessDescription"
                  value={formData.businessDescription}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))] focus:ring-2 focus:ring-purple-500"
                  placeholder="Describe your business, products, and services..."
                />
              </div>
            </div>

            {/* Required Documents */}
            <div>
              <h2 className="text-lg font-semibold text-[rgb(var(--color-fg))] mb-4">Required Documents</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { key: 'businessLicense', label: 'Business License', required: true },
                  { key: 'idDocument', label: 'ID Document', required: true },
                  { key: 'taxCertificate', label: 'Tax Certificate', required: false },
                  { key: 'businessRegistration', label: 'Business Registration', required: false },
                ].map(({ key, label, required }) => (
                  <div key={key} className="border-2 border-dashed border-[rgb(var(--color-border))] rounded-lg p-4">
                    <div className="text-center">
                      <FiUpload className="mx-auto h-8 w-8 text-[rgb(var(--color-muted))]" />
                      <div className="mt-2">
                        <label className="cursor-pointer">
                          <span className="text-sm font-medium text-[rgb(var(--color-fg))]">
                            {label} {required && '*'}
                          </span>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange(e, key)}
                            className="hidden"
                            required={required}
                          />
                        </label>
                      </div>
                      {files[key as keyof typeof files] && (
                        <div className="mt-2 flex items-center justify-center gap-2 text-green-600">
                          <FiCheck className="w-4 h-4" />
                          <span className="text-sm">{files[key as keyof typeof files]?.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Portfolio Images */}
            <div>
              <h2 className="text-lg font-semibold text-[rgb(var(--color-fg))] mb-4">Portfolio Images (Optional)</h2>
              <div className="border-2 border-dashed border-[rgb(var(--color-border))] rounded-lg p-6">
                <div className="text-center">
                  <FiUpload className="mx-auto h-12 w-12 text-[rgb(var(--color-muted))]" />
                  <div className="mt-4">
                    <label className="cursor-pointer">
                      <span className="text-lg font-medium text-[rgb(var(--color-fg))]">Upload Portfolio Images</span>
                      <p className="text-sm text-[rgb(var(--color-muted))] mt-1">
                        Upload images showcasing your products or services
                      </p>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handlePortfolioChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
              
              {portfolioImages.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {portfolioImages.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Portfolio ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removePortfolioImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FiInfo className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-800 dark:text-blue-200">Verification Process</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Your documents will be reviewed within 3-5 business days. You'll receive an email notification once the review is complete.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  'Submit for Verification'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}