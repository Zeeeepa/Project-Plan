import React, { useState } from 'react';
import { Plus, Edit, Save, X, Trash } from 'lucide-react';

interface FunctionData {
  id: string;
  name: string;
  description: string;
  parameters: Array<{
    name: string;
    type: string;
    description: string;
  }>;
  returnType: string;
  returnDescription: string;
}

interface FunctionDocumentationProps {
  data: FunctionData[];
  updateData: (data: FunctionData[]) => void;
}

const FunctionDocumentation: React.FC<FunctionDocumentationProps> = ({ data, updateData }) => {
  const [editingFunction, setEditingFunction] = useState<string | null>(null);
  const [newFunction, setNewFunction] = useState<boolean>(false);
  const [currentFunction, setCurrentFunction] = useState<FunctionData>({
    id: '',
    name: '',
    description: '',
    parameters: [],
    returnType: '',
    returnDescription: ''
  });

  React.useEffect(() => {
    if (!data || data.length === 0) {
      updateData([
        {
          id: '1',
          name: 'fetchUserData',
          description: 'Fetches user data from the API based on user ID',
          parameters: [
            {
              name: 'userId',
              type: 'string',
              description: 'The unique identifier for the user'
            },
            {
              name: 'includeProfile',
              type: 'boolean',
              description: 'Whether to include profile information'
            }
          ],
          returnType: 'Promise<UserData>',
          returnDescription: 'A promise that resolves to the user data object'
        },
        {
          id: '2',
          name: 'processPayment',
          description: 'Processes a payment transaction',
          parameters: [
            {
              name: 'amount',
              type: 'number',
              description: 'The payment amount'
            },
            {
              name: 'currency',
              type: 'string',
              description: 'The currency code (e.g., USD, EUR)'
            },
            {
              name: 'paymentMethod',
              type: 'PaymentMethod',
              description: 'The payment method object'
            }
          ],
          returnType: 'Promise<PaymentResult>',
          returnDescription: 'A promise that resolves to the payment result'
        }
      ]);
    }
  }, [data, updateData]);

  const startEditing = (func: FunctionData) => {
    setEditingFunction(func.id);
    setCurrentFunction({ ...func });
  };

  const startNewFunction = () => {
    setNewFunction(true);
    setCurrentFunction({
      id: Date.now().toString(),
      name: '',
      description: '',
      parameters: [],
      returnType: '',
      returnDescription: ''
    });
  };

  const cancelEditing = () => {
    setEditingFunction(null);
    setNewFunction(false);
    setCurrentFunction({
      id: '',
      name: '',
      description: '',
      parameters: [],
      returnType: '',
      returnDescription: ''
    });
  };

  const saveFunction = () => {
    if (currentFunction.name.trim()) {
      if (newFunction) {
        updateData([...data, currentFunction]);
      } else {
        updateData(data.map(f => f.id === currentFunction.id ? currentFunction : f));
      }
      cancelEditing();
    }
  };

  const deleteFunction = (id: string) => {
    updateData(data.filter(f => f.id !== id));
  };

  const addParameter = () => {
    setCurrentFunction({
      ...currentFunction,
      parameters: [
        ...currentFunction.parameters,
        { name: '', type: '', description: '' }
      ]
    });
  };

  const updateParameter = (index: number, field: 'name' | 'type' | 'description', value: string) => {
    const newParameters = [...currentFunction.parameters];
    newParameters[index] = {
      ...newParameters[index],
      [field]: value
    };
    
    setCurrentFunction({
      ...currentFunction,
      parameters: newParameters
    });
  };

  const removeParameter = (index: number) => {
    setCurrentFunction({
      ...currentFunction,
      parameters: currentFunction.parameters.filter((_, i) => i !== index)
    });
  };

  const renderFunctionForm = () => {
    return (
      <div className="bg-gray-800 rounded-lg p-4 mb-4">
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Function Name</label>
          <input
            type="text"
            value={currentFunction.name}
            onChange={(e) => setCurrentFunction({ ...currentFunction, name: e.target.value })}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded"
            placeholder="e.g., fetchUserData"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Description</label>
          <textarea
            value={currentFunction.description}
            onChange={(e) => setCurrentFunction({ ...currentFunction, description: e.target.value })}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded"
            rows={3}
            placeholder="What does this function do?"
          />
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-gray-300">Parameters</label>
            <button
              onClick={addParameter}
              className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Add Parameter
            </button>
          </div>
          
          {currentFunction.parameters.map((param, index) => (
            <div key={index} className="bg-gray-700 p-3 rounded mb-2">
              <div className="flex justify-between mb-2">
                <h4 className="text-gray-300">Parameter #{index + 1}</h4>
                <button
                  onClick={() => removeParameter(index)}
                  className="text-red-400 hover:text-red-500"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Name</label>
                  <input
                    type="text"
                    value={param.name}
                    onChange={(e) => updateParameter(index, 'name', e.target.value)}
                    className="w-full bg-gray-600 text-white px-2 py-1 rounded"
                    placeholder="e.g., userId"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Type</label>
                  <input
                    type="text"
                    value={param.type}
                    onChange={(e) => updateParameter(index, 'type', e.target.value)}
                    className="w-full bg-gray-600 text-white px-2 py-1 rounded"
                    placeholder="e.g., string"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-1">Description</label>
                <input
                  type="text"
                  value={param.description}
                  onChange={(e) => updateParameter(index, 'description', e.target.value)}
                  className="w-full bg-gray-600 text-white px-2 py-1 rounded"
                  placeholder="What does this parameter do?"
                />
              </div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-300 mb-2">Return Type</label>
            <input
              type="text"
              value={currentFunction.returnType}
              onChange={(e) => setCurrentFunction({ ...currentFunction, returnType: e.target.value })}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded"
              placeholder="e.g., Promise<UserData>"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-2">Return Description</label>
            <input
              type="text"
              value={currentFunction.returnDescription}
              onChange={(e) => setCurrentFunction({ ...currentFunction, returnDescription: e.target.value })}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded"
              placeholder="What does this function return?"
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={cancelEditing}
            className="bg-gray-600 text-white px-4 py-2 rounded mr-2 hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={saveFunction}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            disabled={!currentFunction.name.trim()}
          >
            Save Function
          </button>
        </div>
      </div>
    );
  };

  const renderFunctionCard = (func: FunctionData) => {
    return (
      <div key={func.id} className="bg-gray-800 rounded-lg p-4 mb-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold text-blue-400">{func.name}</h3>
          <div>
            <button
              onClick={() => startEditing(func)}
              className="text-gray-400 hover:text-white mr-2"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              onClick={() => deleteFunction(func.id)}
              className="text-gray-400 hover:text-red-500"
            >
              <Trash className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <p className="text-gray-300 mb-4">{func.description}</p>
        
        {func.parameters.length > 0 && (
          <div className="mb-4">
            <h4 className="text-gray-300 font-semibold mb-2">Parameters:</h4>
            <div className="bg-gray-700 rounded p-3">
              {func.parameters.map((param, index) => (
                <div key={index} className="mb-2 last:mb-0">
                  <div className="flex">
                    <span className="text-yellow-400 font-mono">{param.name}</span>
                    <span className="text-gray-400 ml-2 font-mono">: {param.type}</span>
                  </div>
                  <p className="text-gray-300 text-sm ml-4">{param.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div>
          <h4 className="text-gray-300 font-semibold mb-2">Returns:</h4>
          <div className="bg-gray-700 rounded p-3">
            <div className="text-green-400 font-mono">{func.returnType}</div>
            <p className="text-gray-300 text-sm ml-4">{func.returnDescription}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Function Documentation</h2>
        {!editingFunction && !newFunction && (
          <button
            onClick={startNewFunction}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            <Plus className="w-4 h-4 inline mr-1" />
            Add Function
          </button>
        )}
      </div>
      
      <div className="overflow-auto max-h-[calc(100vh-200px)]">
        {(editingFunction || newFunction) ? (
          renderFunctionForm()
        ) : (
          data.map(renderFunctionCard)
        )}
      </div>
      
      {!editingFunction && !newFunction && data.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p>No functions defined yet. Click "Add Function" to create one.</p>
        </div>
      )}
    </div>
  );
};

export default FunctionDocumentation;