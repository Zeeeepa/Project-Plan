import React, { useState, useEffect } from 'react';
import { Plus, Edit, Save, X, Trash, ArrowRight } from 'lucide-react';

interface FlowStep {
  id: string;
  name: string;
  description: string;
  actor: string;
}

interface Flow {
  id: string;
  name: string;
  description: string;
  steps: FlowStep[];
}

interface ActionFlowsProps {
  data: Flow[];
  updateData: (data: Flow[]) => void;
}

const ActionFlows: React.FC<ActionFlowsProps> = ({ data, updateData }) => {
  const [activeFlow, setActiveFlow] = useState<string | null>(null);
  const [editingFlow, setEditingFlow] = useState<boolean>(false);
  const [currentFlow, setCurrentFlow] = useState<Flow>({
    id: '',
    name: '',
    description: '',
    steps: []
  });

  useEffect(() => {
    if (!data || data.length === 0) {
      const sampleData = [
        {
          id: '1',
          name: 'User Registration',
          description: 'Process for new user registration',
          steps: [
            {
              id: '1-1',
              name: 'Submit Registration Form',
              description: 'User fills out and submits the registration form',
              actor: 'User'
            },
            {
              id: '1-2',
              name: 'Validate Input',
              description: 'System validates the user input for correctness',
              actor: 'System'
            },
            {
              id: '1-3',
              name: 'Create User Account',
              description: 'System creates a new user account in the database',
              actor: 'System'
            },
            {
              id: '1-4',
              name: 'Send Verification Email',
              description: 'System sends a verification email to the user',
              actor: 'System'
            },
            {
              id: '1-5',
              name: 'Verify Email',
              description: 'User clicks the verification link in the email',
              actor: 'User'
            },
            {
              id: '1-6',
              name: 'Activate Account',
              description: 'System activates the user account',
              actor: 'System'
            }
          ]
        },
        {
          id: '2',
          name: 'Checkout Process',
          description: 'E-commerce checkout flow',
          steps: [
            {
              id: '2-1',
              name: 'Review Cart',
              description: 'User reviews items in the shopping cart',
              actor: 'User'
            },
            {
              id: '2-2',
              name: 'Enter Shipping Information',
              description: 'User enters shipping address and selects shipping method',
              actor: 'User'
            },
            {
              id: '2-3',
              name: 'Enter Payment Information',
              description: 'User enters payment details',
              actor: 'User'
            },
            {
              id: '2-4',
              name: 'Validate Payment',
              description: 'System validates payment information with payment processor',
              actor: 'System'
            },
            {
              id: '2-5',
              name: 'Confirm Order',
              description: 'User reviews and confirms the order',
              actor: 'User'
            },
            {
              id: '2-6',
              name: 'Process Order',
              description: 'System processes the order and sends confirmation',
              actor: 'System'
            }
          ]
        }
      ];
      
      updateData(sampleData);
      setActiveFlow(sampleData[0].id);
    } else if (data.length > 0 && !activeFlow) {
      setActiveFlow(data[0].id);
    }
  }, [data, updateData, activeFlow]);

  const startNewFlow = () => {
    setEditingFlow(true);
    setCurrentFlow({
      id: Date.now().toString(),
      name: '',
      description: '',
      steps: []
    });
  };

  const startEditFlow = (flow: Flow) => {
    setEditingFlow(true);
    setCurrentFlow({ ...flow });
  };

  const cancelEditFlow = () => {
    setEditingFlow(false);
    setCurrentFlow({
      id: '',
      name: '',
      description: '',
      steps: []
    });
  };

  const saveFlow = () => {
    if (currentFlow.name.trim()) {
      const flowExists = data.some(f => f.id === currentFlow.id);
      
      if (flowExists) {
        updateData(data.map(f => f.id === currentFlow.id ? currentFlow : f));
      } else {
        updateData([...data, currentFlow]);
      }
      
      setActiveFlow(currentFlow.id);
      setEditingFlow(false);
    }
  };

  const deleteFlow = (id: string) => {
    const newData = data.filter(f => f.id !== id);
    updateData(newData);
    
    if (activeFlow === id) {
      setActiveFlow(newData.length > 0 ? newData[0].id : null);
    }
  };

  const addStep = () => {
    setCurrentFlow({
      ...currentFlow,
      steps: [
        ...currentFlow.steps,
        {
          id: `${currentFlow.id}-${currentFlow.steps.length + 1}`,
          name: '',
          description: '',
          actor: 'User'
        }
      ]
    });
  };

  const updateStep = (index: number, field: keyof FlowStep, value: string) => {
    const newSteps = [...currentFlow.steps];
    newSteps[index] = {
      ...newSteps[index],
      [field]: value
    };
    
    setCurrentFlow({
      ...currentFlow,
      steps: newSteps
    });
  };

  const removeStep = (index: number) => {
    setCurrentFlow({
      ...currentFlow,
      steps: currentFlow.steps.filter((_, i) => i !== index)
    });
  };

  const moveStepUp = (index: number) => {
    if (index === 0) return;
    
    const newSteps = [...currentFlow.steps];
    const temp = newSteps[index];
    newSteps[index] = newSteps[index - 1];
    newSteps[index - 1] = temp;
    
    setCurrentFlow({
      ...currentFlow,
      steps: newSteps
    });
  };

  const moveStepDown = (index: number) => {
    if (index === currentFlow.steps.length - 1) return;
    
    const newSteps = [...currentFlow.steps];
    const temp = newSteps[index];
    newSteps[index] = newSteps[index + 1];
    newSteps[index + 1] = temp;
    
    setCurrentFlow({
      ...currentFlow,
      steps: newSteps
    });
  };

  const renderFlowEditor = () => {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Flow Name</label>
          <input
            type="text"
            value={currentFlow.name}
            onChange={(e) => setCurrentFlow({ ...currentFlow, name: e.target.value })}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded"
            placeholder="e.g., User Registration"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Description</label>
          <textarea
            value={currentFlow.description}
            onChange={(e) => setCurrentFlow({ ...currentFlow, description: e.target.value })}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded"
            rows={2}
            placeholder="Describe the purpose of this flow"
          />
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-gray-300">Steps</label>
            <button
              onClick={addStep}
              className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Add Step
            </button>
          </div>
          
          {currentFlow.steps.map((step, index) => (
            <div key={step.id} className="bg-gray-700 p-3 rounded mb-3">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-gray-300">Step {index + 1}</h4>
                <div className="flex space-x-2">
                  <button
                    onClick={() => moveStepUp(index)}
                    disabled={index === 0}
                    className={`text-gray-400 ${index === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:text-white'}`}
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveStepDown(index)}
                    disabled={index === currentFlow.steps.length - 1}
                    className={`text-gray-400 ${index === currentFlow.steps.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:text-white'}`}
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => removeStep(index)}
                    className="text-red-400 hover:text-red-500"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Name</label>
                  <input
                    type="text"
                    value={step.name}
                    onChange={(e) => updateStep(index, 'name', e.target.value)}
                    className="w-full bg-gray-600 text-white px-2 py-1 rounded"
                    placeholder="e.g., Submit Form"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Actor</label>
                  <select
                    value={step.actor}
                    onChange={(e) => updateStep(index, 'actor', e.target.value)}
                    className="w-full bg-gray-600 text-white px-2 py-1 rounded"
                  >
                    <option value="User">User</option>
                    <option value="System">System</option>
                    <option value="Admin">Admin</option>
                    <option value="External">External System</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-1">Description</label>
                <input
                  type="text"
                  value={step.description}
                  onChange={(e) => updateStep(index, 'description', e.target.value)}
                  className="w-full bg-gray-600 text-white px-2 py-1 rounded"
                  placeholder="What happens in this step?"
                />
              </div>
            </div>
          ))}
          
          {currentFlow.steps.length === 0 && (
            <div className="text-center py-4 text-gray-400 bg-gray-700 rounded">
              <p>No steps added yet. Click "Add Step" to create the first step.</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={cancelEditFlow}
            className="bg-gray-600 text-white px-4 py-2 rounded mr-2 hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={saveFlow}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            disabled={!currentFlow.name.trim()}
          >
            Save Flow
          </button>
        </div>
      </div>
    );
  };

  const renderFlowViewer = () => {
    const flow = data.find(f => f.id === activeFlow);
    
    if (!flow) {
      return (
        <div className="text-center py-8 text-gray-400">
          <p>No flow selected or available. Create a new flow to get started.</p>
        </div>
      );
    }
    
    return (
      <div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-blue-400">{flow.name}</h3>
            <p className="text-gray-300">{flow.description}</p>
          </div>
          <div>
            <button
              onClick={() => startEditFlow(flow)}
              className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600"
            >
              <Edit className="w-4 h-4 inline mr-1" />
              Edit Flow
            </button>
            <button
              onClick={() => deleteFlow(flow.id)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              <Trash className="w-4 h-4 inline mr-1" />
              Delete
            </button>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          {flow.steps.map((step, index) => (
            <div key={step.id} className="mb-4 last:mb-0">
              <div className="flex items-start">
                <div className={`rounded-full w-8 h-8 flex items-center justify-center mr-3 ${
                  step.actor === 'User' ? 'bg-blue-500' : 
                  step.actor === 'System' ? 'bg-green-500' : 
                  step.actor === 'Admin' ? 'bg-purple-500' : 'bg-yellow-500'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1 bg-gray-700 p-3 rounded">
                  <div className="flex justify-between">
                    <h4 className="font-semibold text-white">{step.name}</h4>
                    <span className={`text-sm px-2 py-1 rounded ${
                      step.actor === 'User' ? 'bg-blue-600 text-blue-100' : 
                      step.actor === 'System' ? 'bg-green-600 text-green-100' : 
                      step.actor === 'Admin' ? 'bg-purple-600 text-purple-100' : 'bg-yellow-600 text-yellow-100'
                    }`}>
                      {step.actor}
                    </span>
                  </div>
                  <p className="text-gray-300 mt-1">{step.description}</p>
                </div>
              </div>
              
              {index < flow.steps.length - 1 && (
                <div className="flex justify-center my-2">
                  <ArrowRight className="text-gray-500" />
                </div>
              )}
            </div>
          ))}
          
          {flow.steps.length === 0 && (
            <div className="text-center py-4 text-gray-400">
              <p>No steps defined for this flow. Edit the flow to add steps.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 grid grid-cols-4 gap-4 h-full">
      <div className="col-span-1 bg-gray-800 rounded-lg p-4 overflow-auto max-h-[calc(100vh-200px)]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Flows</h3>
          <button
            onClick={startNewFlow}
            className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600"
            disabled={editingFlow}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-2">
          {data.map(flow => (
            <button
              key={flow.id}
              onClick={() => !editingFlow && setActiveFlow(flow.id)}
              className={`w-full text-left px-3 py-2 rounded ${
                activeFlow === flow.id ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              } ${editingFlow ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={editingFlow}
            >
              {flow.name}
            </button>
          ))}
          
          {data.length === 0 && !editingFlow && (
            <div className="text-center py-4 text-gray-400">
              <p>No flows defined yet.</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="col-span-3 overflow-auto max-h-[calc(100vh-200px)]">
        {editingFlow ? renderFlowEditor() : renderFlowViewer()}
      </div>
    </div>
  );
};

export default ActionFlows;