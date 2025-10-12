"use client";

import { useState, useEffect, useMemo } from "react";
import { FiFilter, FiX, FiChevronDown, FiChevronUp, FiSearch } from "react-icons/fi";

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

  // Separate search sections so they are always visible (not collapsible)
  const searchSections = useMemo(() => sections.filter(s => s.type === 'search'), [sections]);
  const otherSections = useMemo(() => sections.filter(s => s.type !== 'search'), [sections]);

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

  // Build active filter chips for quick removal
  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; value: string }[] = [];
    for (const [key, val] of Object.entries(filters)) {
      const section = sections.find(s => s.id === key);
      if (!section) continue;
      if (Array.isArray(val)) {
        val.forEach(v => {
          const label = section.options?.find(o => o.id === String(v))?.label || String(v);
          chips.push({ key, label, value: String(v) });
        });
      } else if (val !== undefined && val !== '') {
        if (section.type === 'search') {
          chips.push({ key, label: section.title, value: String(val) });
        } else if (section.type === 'radio') {
          const label = section.options?.find(o => o.id === String(val))?.label || String(val);
          chips.push({ key, label: section.title, value: label });
        } else if (section.type === 'range') {
          chips.push({ key, label: section.title, value: String(val) });
        }
      }
    }
    return chips;
  }, [filters, sections]);

  const removeChip = (chip: { key: string; value: string }) => {
    setFilters((prev: any) => {
      const next = { ...prev };
      const section = sections.find(s => s.id === chip.key);
      if (!section) return next;
      if (Array.isArray(next[chip.key])) {
        next[chip.key] = next[chip.key].filter((v: any) => String(v) !== chip.value);
        if (next[chip.key].length === 0) delete next[chip.key];
      } else {
        delete next[chip.key];
      }
      // Also clear searchTerms if removing a search chip
      if (section.type === 'search') {
        setSearchTerms(prevTerms => ({ ...prevTerms, [chip.key]: '' }));
      }
      return next;
    });
  };

  const SearchGroup = () => (
    <div className="space-y-3">
      {searchSections.map(section => (
        <div key={section.id} className="relative group">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-muted))] w-4 h-4" />
          <input
            type="text"
            placeholder={section.title}
            className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg))] text-[rgb(var(--color-fg))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]/60 focus:border-transparent"
            value={searchTerms[section.id] || ''}
            onChange={(e) => {
              setSearchTerms(prev => ({ ...prev, [section.id]: e.target.value }));
              handleFilterChange(section.id, e.target.value, 'search');
            }}
          />
          {searchTerms[section.id] && (
            <button
              aria-label="Clear"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-fg))]"
              onClick={() => {
                setSearchTerms(prev => ({ ...prev, [section.id]: '' }));
                handleFilterChange(section.id, '', 'search');
              }}
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );

  const ChipsBar = () => (
    <div className="flex flex-wrap gap-2 mt-4">
      {activeChips.map((chip, idx) => (
        <span key={`${chip.key}-${chip.value}-${idx}`} className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs border border-[rgb(var(--color-border))] bg-[rgb(var(--color-ui))] text-[rgb(var(--color-fg))]">
          <span className="font-medium truncate max-w-[140px]">{chip.label}: {chip.value}</span>
          <button aria-label="Remove filter" onClick={() => removeChip(chip)} className="hover:text-red-600">
            <FiX className="w-3.5 h-3.5" />
          </button>
        </span>
      ))}
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar (Mobile) */}
      <div className={`
        lg:hidden fixed top-16 left-0 h-[calc(100vh-4rem)] w-80 bg-[rgb(var(--color-card))] border-r border-[rgb(var(--color-border))]
        transform transition-transform duration-300 ease-in-out z-40 overflow-y-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${className}
      `}>
        {/* Sticky header within drawer */}
        <div className="sticky top-0 z-10 bg-[rgb(var(--color-card))] border-b border-[rgb(var(--color-border))] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiFilter className="w-5 h-5 text-purple-600" />
              <h2 className="text-base font-semibold text-[rgb(var(--color-fg))]">Filters</h2>
              {getActiveFilterCount() > 0 && (
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-[10px] px-2 py-0.5 rounded-full">
                  {getActiveFilterCount()}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={clearFilters} className="text-sm text-[rgb(var(--color-muted))] hover:text-red-600">Clear</button>
              <button onClick={onToggle} className="text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-fg))]">
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>
          {/* Always-visible search inputs */}
          {searchSections.length > 0 && (
            <div className="mt-3">
              <SearchGroup />
              <ChipsBar />
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-4 pb-24">
          {/* Collapsible non-search sections */}
          <div className="space-y-4">
            {otherSections.map((section) => (
              <div key={section.id} className="border border-[rgb(var(--color-border))] rounded-lg overflow-hidden">
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
                <div className={`overflow-hidden transition-all duration-300 ${expandedSections.includes(section.id) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="p-3 pt-0 space-y-2">
                    {section.type === 'range' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm text-[rgb(var(--color-muted))]">
                          <span>{section.min}</span>
                          <span>{section.max}</span>
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
                          {filters[section.id] ?? section.min}
                        </div>
                      </div>
                    )}

                    {(section.type === 'checkbox' || section.type === 'radio') && section.options && (
                      <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                        {section.options.map((option) => {
                          const selected = section.type === 'checkbox'
                            ? (filters[section.id] || []).includes(option.id)
                            : filters[section.id] === option.id;
                          return (
                            <label key={option.id} className={`flex items-center justify-between p-2 rounded-lg border ${selected ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-ui))]'}`}>
                              <div className="flex items-center gap-3">
                                <input
                                  type={section.type}
                                  name={section.id}
                                  value={option.id}
                                  checked={selected}
                                  onChange={() => handleFilterChange(section.id, option.id, section.type)}
                                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                />
                                <span className="text-sm text-[rgb(var(--color-fg))]">{option.label}</span>
                              </div>
                              {option.count && (
                                <span className="text-xs text-[rgb(var(--color-muted))] bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{option.count}</span>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile action bar */}
        <div className="lg:hidden sticky bottom-0 z-10 bg-[rgb(var(--color-card))] border-t border-[rgb(var(--color-border))] p-3 flex items-center justify-between">
          <button onClick={clearFilters} className="px-4 py-2 rounded-lg border border-[rgb(var(--color-border))] text-[rgb(var(--color-fg))] hover:bg-[rgb(var(--color-ui))]">Reset</button>
          <button onClick={onToggle} className="px-4 py-2 rounded-lg bg-[rgb(var(--color-primary))] text-[rgb(var(--color-on-primary))] hover:opacity-90">Apply</button>
        </div>
      </div>

      {/* Sidebar (Desktop) */}
      <div className={`hidden lg:block w-80 shrink-0 bg-[rgb(var(--color-card))] border-r border-[rgb(var(--color-border))] ${className}`}>
        <div className="sticky top-16 max-h-[calc(100vh-4rem)] w-full overflow-y-auto p-4">
          <div className="mb-3">
            <div className="flex items-center gap-2">
              <FiFilter className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-[rgb(var(--color-fg))]">Filters</h2>
              {getActiveFilterCount() > 0 && (
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs px-2 py-1 rounded-full">{getActiveFilterCount()}</span>
              )}
            </div>
            {/* Always-visible search inputs */}
            {searchSections.length > 0 && (
              <div className="mt-3">
                <SearchGroup />
                <ChipsBar />
              </div>
            )}
          </div>

          {/* Collapsible non-search sections */}
          <div className="space-y-4">
            {otherSections.map((section) => (
              <div key={section.id} className="border border-[rgb(var(--color-border))] rounded-lg overflow-hidden">
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
                <div className={`overflow-hidden transition-all duration-300 ${expandedSections.includes(section.id) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="p-3 pt-0 space-y-2">
                    {section.type === 'range' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm text-[rgb(var(--color-muted))]">
                          <span>{section.min}</span>
                          <span>{section.max}</span>
                        </div>
                        <input
                          type="range"
                          min={section.min}
                          max={section.max}
                          step={section.step || 1}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                          onChange={(e) => handleFilterChange(section.id, parseInt(e.target.value), 'range')}
                        />
                        <div className="text-center text-sm font-medium text-purple-600">{filters[section.id] ?? section.min}</div>
                      </div>
                    )}

                    {(section.type === 'checkbox' || section.type === 'radio') && section.options && (
                      <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                        {section.options.map((option) => {
                          const selected = section.type === 'checkbox'
                            ? (filters[section.id] || []).includes(option.id)
                            : filters[section.id] === option.id;
                          return (
                            <label key={option.id} className={`flex items-center justify-between p-2 rounded-lg border ${selected ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-ui))]'}`}>
                              <div className="flex items-center gap-3">
                                <input
                                  type={section.type}
                                  name={section.id}
                                  value={option.id}
                                  checked={selected}
                                  onChange={() => handleFilterChange(section.id, option.id, section.type)}
                                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                />
                                <span className="text-sm text-[rgb(var(--color-fg))]">{option.label}</span>
                              </div>
                              {option.count && (
                                <span className="text-xs text-[rgb(var(--color-muted))] bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{option.count}</span>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer actions (desktop) */}
          <div className="mt-4 flex items-center justify-between">
            <button onClick={clearFilters} className="px-3 py-1.5 rounded-lg border border-[rgb(var(--color-border))] text-[rgb(var(--color-fg))] hover:bg-[rgb(var(--color-ui))] text-sm">Reset</button>
          </div>
        </div>
      </div>
    </>
  );
}
