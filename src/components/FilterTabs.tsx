'use client';

import React from 'react';

interface FilterTabsProps {
  currentTab: string;
  onTabSelect: (tab: string) => void;
}

export const FilterTabs: React.FC<FilterTabsProps> = ({
  currentTab,
  onTabSelect,
}) => {
  const tabs = ['All', 'Favourite', 'New', 'Assigned to me', 'Overdue', 'Hot'];

  return (
    <div className="px-8 pt-4 pb-0 bg-white border-b border-[#ebeef2] flex items-center gap-7">
      {tabs.map((tab) => {
        const isActive = currentTab === tab;
        return (
          <button
            key={tab}
            onClick={() => onTabSelect(tab)}
            className={`pb-3 text-xs font-semibold transition-all relative ${
              isActive
                ? 'text-orange-600'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            {tab}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#ff6937] rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
};
