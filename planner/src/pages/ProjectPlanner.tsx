import React, { useState, useEffect } from 'react';
import { FileText, GitBranch, Code, Layers, MessageSquare, Zap } from 'lucide-react';

// Components for different tabs
import ProjectStructure from '../components/projectPlanner/ProjectStructure';
import FunctionDocumentation from '../components/projectPlanner/FunctionDocumentation';
import ActionFlows from '../components/projectPlanner/ActionFlows';
import HighLevelOverview from '../components/projectPlanner/HighLevelOverview';
import ChatInterface from '../components/projectPlanner/ChatInterface';

const ProjectPlanner: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'structure' | 'functions' | 'flows' | 'overview' | 'chat'>('chat');
  const [projectData, setProjectData] = useState<any>({
    structure: {},
    functions: [],
    flows: [],
    overview: {}
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([
    { role: 'system', content: 'Welcome to the Project Planner! I can help you design your project structure, define functions, visualize action flows, and provide high-level overviews. How would you like to start?' }
  ]);

  // Function to handle sending messages to the AI
  const handleSendMessage = async (message: string) => {
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    
    setLoading(true);
    
    // Simulate AI response (in a real implementation, this would call an API)
    setTimeout(() => {
      // Example AI response
      const aiResponse = { role: 'system', content: 'I\'ve analyzed your request. Would you like me to create a project structure based on your description, or would you prefer to start with defining the core functionalities?' };
      setMessages(prev => [...prev, aiResponse]);
      setLoading(false);
    }, 1500);
    
    // In a real implementation, you would:
    // 1. Call your AI service API
    // 2. Update the project data based on the AI response
    // 3. Update the messages state with the AI response
  };

  // Function to update project data from AI suggestions
  const updateProjectData = (section: string, data: any) => {
    setProjectData(prev => ({
      ...prev,
      [section]: data
    }));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-gray-700/30 mb-4">
        <button
          onClick={() => setActiveTab('structure')}
          className={`px-4 py-2 flex items-center ${activeTab === 'structure' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400'}`}
        >
          <Layers className="w-4 h-4 mr-2" />
          Project Structure
        </button>
        <button
          onClick={() => setActiveTab('functions')}
          className={`px-4 py-2 flex items-center ${activeTab === 'functions' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400'}`}
        >
          <Code className="w-4 h-4 mr-2" />
          Functions
        </button>
        <button
          onClick={() => setActiveTab('flows')}
          className={`px-4 py-2 flex items-center ${activeTab === 'flows' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400'}`}
        >
          <GitBranch className="w-4 h-4 mr-2" />
          Action Flows
        </button>
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 flex items-center ${activeTab === 'overview' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400'}`}
        >
          <FileText className="w-4 h-4 mr-2" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-4 py-2 flex items-center ${activeTab === 'chat' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400'}`}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Chat
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'structure' && <ProjectStructure data={projectData.structure} updateData={(data) => updateProjectData('structure', data)} />}
        {activeTab === 'functions' && <FunctionDocumentation data={projectData.functions} updateData={(data) => updateProjectData('functions', data)} />}
        {activeTab === 'flows' && <ActionFlows data={projectData.flows} updateData={(data) => updateProjectData('flows', data)} />}
        {activeTab === 'overview' && <HighLevelOverview data={projectData.overview} updateData={(data) => updateProjectData('overview', data)} />}
        {activeTab === 'chat' && (
          <ChatInterface 
            messages={messages} 
            onSendMessage={handleSendMessage} 
            loading={loading} 
          />
        )}
      </div>
    </div>
  );
};

export default ProjectPlanner;