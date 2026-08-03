import { useState } from "react";

export default function Tabs({ tabs, defaultIndex = 0, onChange }) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);

  const handleTabClick = (index) => {
    setActiveIndex(index);
    onChange?.(index);
  };

  return (
    <div>
      <div className="flex border-b border-gray-200">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => handleTabClick(index)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeIndex === index
                ? "text-accent-dark border-coral"
                : "text-slate-gray border-transparent hover:text-primary hover:border-gray-300"
            }`}
          >
            {tab.icon && <tab.icon className="inline mr-2 text-sm" />}
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4">{tabs[activeIndex]?.content}</div>
    </div>
  );
}
