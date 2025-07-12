import React from 'react';
import { Cpu, Upload } from 'lucide-react';

interface TabNavigationProps {
  activeTab: 'model' | 'analysis';
  onTabChange: (tab: 'model' | 'analysis') => void;
  modelLoaded: boolean;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange, modelLoaded }) => {
  return (
    <div className="border-b border-gray-200 bg-white rounded-t-xl">
      <nav className="flex space-x-8 px-6" aria-label="Tabs">
        <button
          onClick={() => onTabChange('model')}
          className={`
            py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors
            ${activeTab === 'model'
              ? 'border-purple-500 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }
          `}
        >
          <Cpu className="w-4 h-4" />
          <span>Charger Modèle .keras</span>
        </button>
        
        <button
          onClick={() => onTabChange('analysis')}
          className={`
            py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors relative
            ${activeTab === 'analysis'
              ? 'border-green-500 text-green-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }
            ${!modelLoaded ? 'opacity-50' : ''}
          `}
          disabled={!modelLoaded}
        >
          <Upload className="w-4 h-4" />
          <span>Analyser une Image IRM</span>
          {modelLoaded && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></span>
          )}
        </button>
      </nav>
    </div>
  );
};

export default TabNavigation;