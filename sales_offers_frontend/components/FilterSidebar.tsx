"use client";

import { useState, useEffect } from "react";
import { FiFilter, FiX, FiChevronDown, FiChevronUp, FiSearch, FiDollarSign, FiCalendar, FiStar, FiMapPin } from "react-icons/fi";

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface FilterSection {
  id: string;
  title: string;
  type: 'checkbox' | 'radio' | 'range' | 'search';
  options?: FilterOption[];
  min?: number;
  max?: number;
  step?: number;
}

interface FilterSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onFiltersChange: (filters: any) => void;
  sections: FilterSection[];
  className?: string;
}

export default function FilterSidebar({ 
  isOpen, 
  onToggle, 
  onFiltersChange, 
  sections,
  className = ""
}: FilterSidebarProps) {
  const [filters, setFilters] = useState<any>({});
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [searchTerms, setSearchTerms] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleFilterChange = (sectionId: string, value: any, type: string) => {
    setFilters((prev: any) => {
      const newFilters = { ...prev };
      
      if (type === 'checkbox') {
        if (!newFilters[sectionId]) newFilters[sectionId] = [];
        if (newFilters[sectionId].includes(value)) {
          newFilters[sectionId] = newFilters[sectionId].filter((v: any) => v !== value);
        } else {
          newFilters[sectionId] = [...newFilters[sectionId], value];
        }
      } else if (type === 'radio' || type === 'range' || type === 'search') {
        newFilters[sectionId] = value;
      }
      
      return newFilters;
    });
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerms({});
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => 
      Array.isArray(value) ? value.length > 0 : value !== undefined && value !== ''
    ).length;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Filter Toggle Button */}
      <button
        onClick={onToggle}
        className="fixed top-20 left-4 z-50 lg:hidden bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-all duration-300"
      >
        <FiFilter className="w-5 h-5" />
        {getActiveFilterCount() > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {getActiveFilterCount()}
          </span>
        )}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed top-16 left-0 h-[calc(100vh-4rem)] w-80 bg-[rgb(var(--color-card))] border-r border-[rgb(var(--color-border))] 
        transform transition-transform duration-300 ease-in-out z-40 overflow-y-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:sticky lg:translate-x-0 lg:transform-none lg:top-16 lg:h-[calc(100vh-4rem)]
        ${className}
      `}>
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <FiFilter className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-[rgb(var(--color-fg))]">Filters</h2>
              {getActiveFilterCount() > 0 && (
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs px-2 py-1 rounded-full">
                  {getActiveFilterCount()}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-red-600 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={onToggle}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filter Sections */}
          <div className="space-y-4">
            {sections.map((section) => (
              <div key={section.id} className="border border-[rgb(var(--color-border))] rounded-lg">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-[rgb(var(--color-ui))] transition-colors"
                >
                  <span className="font-medium text-[rgb(var(--color-fg))]">{section.title}</span>
                  {expandedSections.includes(section.id) ? (
                    <FiChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <FiChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </button>
                
                <div className={`overflow-hidden transition-all duration-300 ${
                  expandedSections.includes(section.id) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="p-3 pt-0 space-y-2">
                    {section.type === 'search' && (
                      <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder={`Search ${section.title.toLowerCase()}...`}
                          className="w-full pl-10 pr-4 py-2 border border-[rgb(var(--color-border))] rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))]"
                          value={searchTerms[section.id] || ''}
                          onChange={(e) => {
                            setSearchTerms(prev => ({ ...prev, [section.id]: e.target.value }));
                            handleFilterChange(section.id, e.target.value, 'search');
                          }}
                        />
                      </div>
                    )}

                    {section.type === 'range' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>KES {section.min}</span>
                          <span>KES {section.max}</span>
                        </div>
                        <input
                          type="range"
                          min={section.min}
                          max={section.max}
                          step={section.step || 1}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                          onChange={(e) => handleFilterChange(section.id, parseInt(e.target.value), 'range')}
                        />
                        <div className="text-center text-sm font-medium text-purple-600">
                          KES {filters[section.id] || section.min}
                        </div>
                      </div>
                    )}

                    {(section.type === 'checkbox' || section.type === 'radio') && section.options && (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {section.options.map((option) => (
                          <label key={option.id} className="flex items-center space-x-3 cursor-pointer hover:bg-[rgb(var(--color-ui))] p-2 rounded">
                            <input
                              type={section.type}
                              name={section.id}
                              value={option.id}
                              checked={
                                section.type === 'checkbox' 
                                  ? (filters[section.id] || []).includes(option.id)
                                  : filters[section.id] === option.id
                              }
                              onChange={() => handleFilterChange(section.id, option.id, section.type)}
                              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                            />
                            <span className="flex-1 text-sm text-[rgb(var(--color-fg))]">{option.label}</span>
                            {option.count && (
                              <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                {option.count}
                              </span>
                            )}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}