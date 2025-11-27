// Example usage of TabsAppi component
import React, { useState } from 'react';
import { TabsAppi } from './tabs_appi';

const TabsExample: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<string>("Photos");

  // Sample tabs data (string array as expected by TabsAppi)
  const sampleTabs: string[] = ["Photos", "Music", "Videos", "Documents"];

  const handleTabChange = (selectedKey: string) => {
    setSelectedTab(selectedKey);
    console.log('Selected tab:', selectedKey);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">TabsAppi Example</h2>
      
      {/* Basic usage */}
      <div className="mb-8 p-4 bg-white rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Basic Usage</h3>
        <TabsAppi
          label="Select Category"
          defaultValue="Photos"
          tabs={sampleTabs}
          onChange={handleTabChange}
        />
      </div>

      {/* With required field */}
      <div className="mb-8 p-4 bg-white rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Required Field</h3>
        <TabsAppi
          label="Content Type"
          isRequired={true}
          defaultValue="Music"
          tabs={sampleTabs}
          onChange={handleTabChange}
          color="secondary"
          variant="bordered"
        />
      </div>

      {/* Different variants */}
      <div className="mb-8 p-4 bg-white rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Solid Variant</h3>
        <TabsAppi
          label="Media Type"
          defaultValue="Photos"
          tabs={sampleTabs}
          onChange={handleTabChange}
          color="success"
          variant="solid"
        />
      </div>

      {/* Display selected tab */}
      <div className="mt-6 p-4 bg-white rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Selected Tab:</h3>
        <p className="text-sm font-mono bg-gray-100 p-2 rounded">
          {selectedTab}
        </p>
      </div>
    </div>
  );
};

export default TabsExample;
