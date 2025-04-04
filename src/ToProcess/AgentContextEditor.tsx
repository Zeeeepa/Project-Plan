import React, { useState, useEffect } from 'react';
import { 
  Save, X, Plus, Trash2, Upload, FileCode, 
  FileText, BrainCircuit, Target, Edit
} from 'lucide-react';
import { AgentContext, saveAgentContext, updateAgentContext } from '../utils/store';
import { v4 as uuidv4 } from 'uuid';

interface AgentContextEditorProps {
  context?: AgentContext;
  onClose: () => void;
  onSave: (context: AgentContext) => void;
}

export default function AgentContextEditor({ context, onClose, onSave }: AgentContextEditorProps) {
  const [name, setName] = useState(context?.name || '');
  const [description, setDescription] = useState(context?.description || '');
  const [mainGoal, setMainGoal] = useState(context?.mainGoal || '');
  const [textOverview, setTextOverview] = useState(context?.textOverview || '');
  const [codeFiles, setCodeFiles] = useState<AgentContext['codeFiles']>(context?.codeFiles || []);
  const [editingFileIndex, setEditingFileIndex] = useState<number | null>(null);
  const [editingFileName, setEditingFileName] = useState('');
  const [editingFileContent, setEditingFileContent] = useState('');
  const [editingFileLanguage, setEditingFileLanguage] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      alert('Please provide a name for the agent context');
      return;
    }

    const contextData: Omit<AgentContext, 'id' | 'createdAt' | 'updatedAt'> = {
      name,
      description,
      mainGoal,
      textOverview,
      codeFiles
    };

    if (context) {
      // Update existing context
      const updatedContext = updateAgentContext(context.id, contextData);
      if (updatedContext) {
        onSave(updatedContext);
      }
    } else {
      // Create new context
      const newContext = saveAgentContext(contextData);
      onSave(newContext);
    }
  };

  const handleAddFile = () => {
    setEditingFileIndex(null);
    setEditingFileName('');
    setEditingFileContent('');
    setEditingFileLanguage('javascript');
  };

  const handleEditFile = (index: number) => {
    const file = codeFiles[index];
    setEditingFileIndex(index);
    setEditingFileName(file.name);
    setEditingFileContent(file.content);
    setEditingFileLanguage(file.language);
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = [...codeFiles];
    newFiles.splice(index, 1);
    setCodeFiles(newFiles);
  };

  const handleSaveFile = () => {
    if (!editingFileName.trim()) {
      alert('Please provide a file name');
      return;
    }

    const newFile = {
      id: editingFileIndex !== null ? codeFiles[editingFileIndex].id : uuidv4(),
      name: editingFileName,
      content: editingFileContent,
      language: editingFileLanguage
    };

    if (editingFileIndex !== null) {
      // Update existing file
      const newFiles = [...codeFiles];
      newFiles[editingFileIndex] = newFile;
      setCodeFiles(newFiles);
    } else {
      // Add new file
      setCodeFiles([...codeFiles, newFile]);
    }

    // Reset editing state
    setEditingFileIndex(null);
    setEditingFileName('');
    setEditingFileContent('');
    setEditingFileLanguage('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      if (event.target && typeof event.target.result === 'string') {
        // Determine language from file extension
        const extension = file.name.split('.').pop()?.toLowerCase() || '';
        let language = 'text';

        switch (extension) {
          case 'js':
            language = 'javascript';
            break;
          case 'ts':
            language = 'typescript';
            break;
          case 'py':
            language = 'python';
            break;
          case 'java':
            language = 'java';
            break;
          case 'html':
            language = 'html';
            break;
          case 'css':
            language = 'css';
            break;
          case 'json':
            language = 'json';
            break;
          case 'md':
            language = 'markdown';
            break;
          // Add more mappings as needed
        }

        setEditingFileName(file.name);
        setEditingFileContent(event.target.result);
        setEditingFileLanguage(language);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="glass-card p-6 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent flex items-center">
            <BrainCircuit className="w-7 h-7 mr-2 text-indigo-400" />
            {context ? 'Edit Agent Context' : 'New Agent Context'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-700/50 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 glass-card rounded-lg bg-gray-800/20"
                placeholder="Agent name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 glass-card rounded-lg bg-gray-800/20"
                placeholder="Brief description of this agent's purpose"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Main Goal
              </label>
              <textarea
                value={mainGoal}
                onChange={(e) => setMainGoal(e.target.value)}
                className="w-full p-2 glass-card rounded-lg bg-gray-800/20 resize-none h-20"
                placeholder="Define the main goal or objective for this agent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Context Overview
              </label>
              <textarea
                value={textOverview}
                onChange={(e) => setTextOverview(e.target.value)}
                className="w-full p-2 glass-card rounded-lg bg-gray-800/20 resize-none h-32"
                placeholder="Provide a comprehensive overview or context for the agent"
              />
            </div>
          </div>

          {/* Code Files */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-400">
                Code Files
              </label>
              <button
                onClick={handleAddFile}
                className="btn-secondary text-xs py-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add File</span>
              </button>
            </div>

            {codeFiles.length > 0 ? (
              <div className="space-y-2">
                {codeFiles.map((file, index) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-2 glass-card rounded-lg bg-gray-800/20"
                  >
                    <div className="flex items-center">
                      <FileCode className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{file.name}</span>
                      <span className="ml-2 text-xs text-gray-500">
                        {file.content.length} characters
                      </span>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEditFile(index)}
                        className="p-1.5 rounded-lg hover:bg-gray-700/50 transition-colors"
                      >
                        <Edit className="w-4 h-4 text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleRemoveFile(index)}
                        className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-gray-700 rounded-lg mb-4">
                <FileCode className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400">No code files added yet</p>
                <p className="text-sm text-gray-500">
                  Add code files to provide context for the agent
                </p>
              </div>
            )}

            {/* File Upload */}
            <div className="flex items-center justify-center">
              <label className="btn-secondary cursor-pointer">
                <Upload className="w-5 h-5" />
                <span>Upload File</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".js,.ts,.py,.java,.html,.css,.json,.md,.txt"
                />
              </label>
            </div>
          </div>

          {/* File Editor */}
          {(editingFileIndex !== null || editingFileName) && (
            <div className="mt-4 p-4 glass-card rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">
                  {editingFileIndex !== null ? 'Edit File' : 'New File'}
                </h3>
                <button
                  onClick={() => {
                    setEditingFileIndex(null);
                    setEditingFileName('');
                    setEditingFileContent('');
                    setEditingFileLanguage('');
                  }}
                  className="p-1.5 rounded-lg hover:bg-gray-700/50 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      File Name
                    </label>
                    <input
                      type="text"
                      value={editingFileName}
                      onChange={(e) => setEditingFileName(e.target.value)}
                      className="w-full p-2 glass-card rounded-lg bg-gray-800/20"
                      placeholder="e.g., main.js"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Language
                    </label>
                    <select
                      value={editingFileLanguage}
                      onChange={(e) => setEditingFileLanguage(e.target.value)}
                      className="p-2 glass-card rounded-lg bg-gray-800/20"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="typescript">TypeScript</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="html">HTML</option>
                      <option value="css">CSS</option>
                      <option value="json">JSON</option>
                      <option value="markdown">Markdown</option>
                      <option value="text">Plain Text</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Content
                  </label>
                  <textarea
                    value={editingFileContent}
                    onChange={(e) => setEditingFileContent(e.target.value)}
                    className="w-full p-2 glass-card rounded-lg bg-gray-800/20 resize-none h-64 font-mono text-sm"
                    placeholder="// Enter your code here"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveFile}
                    className="btn-primary"
                  >
                    <Save className="w-5 h-5" />
                    <span>Save File</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-gray-700/30">
            <button
              onClick={onClose}
              className="btn-secondary mr-2"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn-primary"
            >
              <Save className="w-5 h-5" />
              <span>Save Context</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
