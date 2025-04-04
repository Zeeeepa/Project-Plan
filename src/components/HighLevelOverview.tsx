import React, { useState, useEffect } from 'react';
import { Edit, Save, X, Plus, Trash } from 'lucide-react';

interface OverviewSection {
  id: string;
  title: string;
  content: string;
}

interface HighLevelOverviewProps {
  data: {
    title?: string;
    description?: string;
    sections?: OverviewSection[];
  };
  updateData: (data: any) => void;
}

const HighLevelOverview: React.FC<HighLevelOverviewProps> = ({ data, updateData }) => {
  const [editing, setEditing] = useState<boolean>(false);
  const [currentData, setCurrentData] = useState<{
    title: string;
    description: string;
    sections: OverviewSection[];
  }>({
    title: '',
    description: '',
    sections: []
  });

  useEffect(() => {
    if (!data || Object.keys(data).length === 0) {
      const sampleData = {
        title: 'E-commerce Platform',
        description: 'A modern e-commerce platform with user authentication, product catalog, shopping cart, and payment processing.',
        sections: [
          {
            id: '1',
            title: 'User Management',
            content: 'The system will handle user registration, authentication, profile management, and role-based access control. Users can sign up, log in, update their profiles, and manage their account settings.'
          },
          {
            id: '2',
            title: 'Product Catalog',
            content: 'The product catalog will display products with details such as name, description, price, images, and availability. It will support categorization, filtering, sorting, and searching functionality.'
          },
          {
            id: '3',
            title: 'Shopping Cart',
            content: 'Users can add products to their cart, update quantities, remove items, and proceed to checkout. The cart will persist across sessions and will be synchronized with the user\'s account.'
          },
          {
            id: '4',
            title: 'Payment Processing',
            content: 'The system will integrate with payment gateways to process transactions securely. It will support multiple payment methods, handle order confirmation, and provide receipts.'
          },
          {
            id: '5',
            title: 'Order Management',
            content: 'Users can view their order history, track shipments, and manage returns. Administrators can process orders, update status, and handle customer inquiries.'
          }
        ]
      };
      
      updateData(sampleData);
    }
  }, [data, updateData]);

  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      setCurrentData({
        title: data.title || '',
        description: data.description || '',
        sections: data.sections || []
      });
    }
  }, [data]);

  const startEditing = () => {
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setCurrentData({
      title: data.title || '',
      description: data.description || '',
      sections: data.sections || []
    });
  };

  const saveChanges = () => {
    if (currentData.title.trim()) {
      updateData(currentData);
      setEditing(false);
    }
  };

  const addSection = () => {
    setCurrentData({
      ...currentData,
      sections: [
        ...currentData.sections,
        {
          id: Date.now().toString(),
          title: '',
          content: ''
        }
      ]
    });
  };

  const updateSection = (index: number, field: 'title' | 'content', value: string) => {
    const newSections = [...currentData.sections];
    newSections[index] = {
      ...newSections[index],
      [field]: value
    };
    
    setCurrentData({
      ...currentData,
      sections: newSections
    });
  };

  const removeSection = (index: number) => {
    setCurrentData({
      ...currentData,
      sections: currentData.sections.filter((_, i) => i !== index)
    });
  };

  const moveSectionUp = (index: number) => {
    if (index === 0) return;
    
    const newSections = [...currentData.sections];
    const temp = newSections[index];
    newSections[index] = newSections[index - 1];
    newSections[index - 1] = temp;
    
    setCurrentData({
      ...currentData,
      sections: newSections
    });
  };

  const moveSectionDown = (index: number) => {
    if (index === currentData.sections.length - 1) return;
    
    const newSections = [...currentData.sections];
    const temp = newSections[index];
    newSections[index] = newSections[index + 1];
    newSections[index + 1] = temp;
    
    setCurrentData({
      ...currentData,
      sections: newSections
    });
  };

  const renderEditor = () => {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Project Title</label>
          <input
            type="text"
            value={currentData.title}
            onChange={(e) => setCurrentData({ ...currentData, title: e.target.value })}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded"
            placeholder="e.g., E-commerce Platform"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Project Description</label>
          <textarea
            value={currentData.description}
            onChange={(e) => setCurrentData({ ...currentData, description: e.target.value })}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded"
            rows={3}
            placeholder="Provide a high-level description of the project"
          />
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-gray-300">Sections</label>
            <button
              onClick={addSection}
              className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Add Section
            </button>
          </div>
          
          {currentData.sections.map((section, index) => (
            <div key={section.id} className="bg-gray-700 p-3 rounded mb-3">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-gray-300">Section {index + 1}</h4>
                <div className="flex space-x-2">
                  <button
                    onClick={() => moveSectionUp(index)}
                    disabled={index === 0}
                    className={`text-gray-400 ${index === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:text-white'}`}
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveSectionDown(index)}
                    disabled={index === currentData.sections.length - 1}
                    className={`text-gray-400 ${index === currentData.sections.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:text-white'}`}
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => removeSection(index)}
                    className="text-red-400 hover:text-red-500"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="mb-2">
                <label className="block text-gray-400 text-sm mb-1">Title</label>
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => updateSection(index, 'title', e.target.value)}
                  className="w-full bg-gray-600 text-white px-2 py-1 rounded"
                  placeholder="e.g., User Management"
                />
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-1">Content</label>
                <textarea
                  value={section.content}
                  onChange={(e) => updateSection(index, 'content', e.target.value)}
                  className="w-full bg-gray-600 text-white px-2 py-1 rounded"
                  rows={3}
                  placeholder="Describe this section of the project"
                />
              </div>
            </div>
          ))}
          
          {currentData.sections.length === 0 && (
            <div className="text-center py-4 text-gray-400 bg-gray-700 rounded">
              <p>No sections added yet. Click "Add Section" to create the first section.</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={cancelEditing}
            className="bg-gray-600 text-white px-4 py-2 rounded mr-2 hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={saveChanges}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            disabled={!currentData.title.trim()}
          >
            Save Changes
          </button>
        </div>
      </div>
    );
  };

  const renderViewer = () => {
    if (!data || Object.keys(data).length === 0) {
      return (
        <div className="text-center py-8 text-gray-400">
          <p>No overview data available. Click "Edit Overview" to create one.</p>
        </div>
      );
    }
    
    return (
      <div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{data.title}</h2>
            <p className="text-gray-300 mt-2">{data.description}</p>
          </div>
          <button
            onClick={startEditing}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            <Edit className="w-4 h-4 inline mr-1" />
            Edit Overview
          </button>
        </div>
        
        <div className="space-y-6 mt-6">
          {data.sections && data.sections.map((section) => (
            <div key={section.id} className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-xl font-semibold text-blue-400 mb-2">{section.title}</h3>
              <p className="text-gray-300 whitespace-pre-line">{section.content}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="overflow-auto max-h-[calc(100vh-200px)]">
        {editing ? renderEditor() : renderViewer()}
      </div>
    </div>
  );
};

export default HighLevelOverview;