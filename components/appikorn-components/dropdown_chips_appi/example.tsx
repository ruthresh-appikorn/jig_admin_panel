// Example usage of DropdownChipsAppi component
import React, { useState } from 'react';
import { DropdownChipsAppi, DropdownChipsItem } from './dropdown_chips_appi';

const DropdownChipsExample: React.FC = () => {
  const [selectedItems, setSelectedItems] = useState<DropdownChipsItem[]>([]);

  // Sample data with names and images
  const sampleItems: DropdownChipsItem[] = [
    {
      label: "John Doe",
      code: "john_doe",
      image: "https://i.pravatar.cc/150?img=1"
    },
    {
      label: "Jane Smith",
      code: "jane_smith", 
      image: "https://i.pravatar.cc/150?img=2"
    },
    {
      label: "Mike Johnson",
      code: "mike_johnson",
      image: "https://i.pravatar.cc/150?img=3"
    },
    {
      label: "Sarah Wilson",
      code: "sarah_wilson",
      image: "https://i.pravatar.cc/150?img=4"
    },
    {
      label: "David Brown",
      code: "david_brown",
      image: "https://i.pravatar.cc/150?img=5"
    }
  ];

  const handleSelectionChange = (items: DropdownChipsItem[]) => {
    setSelectedItems(items);
    console.log('Selected items:', items);
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">DropdownChips Example</h2>
      
      {/* Basic usage */}
      <div className="mb-8 p-4 bg-white rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Basic Usage</h3>
        <DropdownChipsAppi
          label="Select Team Members"
          placeholder="Choose team members..."
          items={sampleItems}
          onChange={handleSelectionChange}
          chipColor="primary"
          chipVariant="flat"
        />
      </div>

      {/* With default values */}
      <div className="mb-8 p-4 bg-white rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">With Default Values</h3>
        <DropdownChipsAppi
          label="Pre-selected Members"
          placeholder="Add more members..."
          items={sampleItems}
          defaultValues={["john_doe", "jane_smith"]}
          onChange={handleSelectionChange}
          chipColor="secondary"
          chipVariant="bordered"
        />
      </div>

      {/* With max chips limit */}
      <div className="mb-8 p-4 bg-white rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Max 3 Items</h3>
        <DropdownChipsAppi
          label="Limited Selection"
          placeholder="Max 3 items..."
          items={sampleItems}
          onChange={handleSelectionChange}
          chipColor="success"
          chipVariant="solid"
          maxChips={3}
        />
      </div>

      {/* Display selected items */}
      <div className="mt-6 p-4 bg-white rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Selected Items:</h3>
        <pre className="text-sm">
          {JSON.stringify(selectedItems, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default DropdownChipsExample;
