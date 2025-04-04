import React, { useState } from 'react';
import { Folder, File, ChevronDown, ChevronRight, Edit, Save, X, Plus, Trash } from 'lucide-react';

interface ProjectStructureProps {
  data: any;
  updateData: (data: any) => void;
}

const ProjectStructure: React.FC<ProjectStructureProps> = ({ data, updateData }) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newItemType, setNewItemType] = useState<'file' | 'folder' | null>(null);
  const [newItemParent, setNewItemParent] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');

  React.useEffect(() => {
    if (!data || Object.keys(data).length === 0) {
      updateData({
        name: 'root',
        type: 'folder',
        children: [
          {
            name: 'src',
            type: 'folder',
            children: [
              {
                name: 'components',
                type: 'folder',
                children: [
                  { name: 'Header.tsx', type: 'file' },
                  { name: 'Footer.tsx', type: 'file' }
                ]
              },
              {
                name: 'pages',
                type: 'folder',
                children: [
                  { name: 'Home.tsx', type: 'file' },
                  { name: 'About.tsx', type: 'file' }
                ]
              },
              { name: 'App.tsx', type: 'file' },
              { name: 'index.tsx', type: 'file' }
            ]
          },
          {
            name: 'public',
            type: 'folder',
            children: [
              { name: 'index.html', type: 'file' },
              { name: 'favicon.ico', type: 'file' }
            ]
          },
          { name: 'package.json', type: 'file' },
          { name: 'README.md', type: 'file' }
        ]
      });
    }
  }, [data, updateData]);

  const toggleFolder = (path: string) => {
    const newExpandedFolders = new Set(expandedFolders);
    if (newExpandedFolders.has(path)) {
      newExpandedFolders.delete(path);
    } else {
      newExpandedFolders.add(path);
    }
    setExpandedFolders(newExpandedFolders);
  };

  const startEditing = (path: string, currentName: string) => {
    setEditingNode(path);
    setEditValue(currentName);
  };

  const cancelEditing = () => {
    setEditingNode(null);
    setEditValue('');
  };

  const saveEditing = (path: string) => {
    if (editValue.trim()) {
      const newData = JSON.parse(JSON.stringify(data));
      
      const pathParts = path.split('/').filter(Boolean);
      let current = newData;
      
      for (let i = 0; i < pathParts.length - 1; i++) {
        const folder = current.children.find((c: any) => c.name === pathParts[i]);
        if (folder) {
          current = folder;
        }
      }
      
      const nodeIndex = current.children.findIndex((c: any) => c.name === pathParts[pathParts.length - 1]);
      if (nodeIndex !== -1) {
        current.children[nodeIndex].name = editValue;
        updateData(newData);
      }
    }
    
    cancelEditing();
  };

  const startAddingItem = (parentPath: string, type: 'file' | 'folder') => {
    setNewItemParent(parentPath);
    setNewItemType(type);
    setNewItemName('');
  };

  const cancelAddingItem = () => {
    setNewItemParent(null);
    setNewItemType(null);
    setNewItemName('');
  };

  const saveNewItem = () => {
    if (newItemName.trim() && newItemType && newItemParent !== null) {
      const newData = JSON.parse(JSON.stringify(data));
      
      const pathParts = newItemParent.split('/').filter(Boolean);
      let current = newData;
      
      for (const part of pathParts) {
        if (part) {
          const folder = current.children.find((c: any) => c.name === part);
          if (folder) {
            current = folder;
          }
        }
      }
      
      const newItem = {
        name: newItemName,
        type: newItemType,
        ...(newItemType === 'folder' ? { children: [] } : {})
      };
      
      current.children = current.children || [];
      current.children.push(newItem);
      
      setExpandedFolders(new Set([...expandedFolders, newItemParent]));
      
      updateData(newData);
      cancelAddingItem();
    }
  };

  const deleteItem = (path: string) => {
    const newData = JSON.parse(JSON.stringify(data));
    
    const pathParts = path.split('/').filter(Boolean);
    let current = newData;
    
    for (let i = 0; i < pathParts.length - 1; i++) {
      const folder = current.children.find((c: any) => c.name === pathParts[i]);
      if (folder) {
        current = folder;
      }
    }
    
    const nodeIndex = current.children.findIndex((c: any) => c.name === pathParts[pathParts.length - 1]);
    if (nodeIndex !== -1) {
      current.children.splice(nodeIndex, 1);
      updateData(newData);
    }
  };

  const renderTree = (node: any, path = '') => {
    const currentPath = path ? `${path}/${node.name}` : node.name;
    const isExpanded = expandedFolders.has(currentPath);
    const isFolder = node.type === 'folder';
    
    return (
      <div key={currentPath} className="ml-4">
        <div className="flex items-center py-1">
          {isFolder && (
            <button 
              onClick={() => toggleFolder(currentPath)}
              className="mr-1 focus:outline-none"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          )}
          
          {isFolder ? <Folder className="w-4 h-4 mr-1 text-yellow-400" /> : <File className="w-4 h-4 mr-1 text-blue-400" />}
          
          {editingNode === currentPath ? (
            <div className="flex items-center">
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="bg-gray-700 text-white px-2 py-1 rounded mr-1"
                autoFocus
              />
              <button onClick={() => saveEditing(currentPath)} className="text-green-500 mr-1">
                <Save className="w-4 h-4" />
              </button>
              <button onClick={cancelEditing} className="text-red-500">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center flex-1">
              <span className="mr-2">{node.name}</span>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex">
                <button onClick={() => startEditing(currentPath, node.name)} className="text-gray-400 hover:text-white mr-1">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => deleteItem(currentPath)} className="text-gray-400 hover:text-red-500">
                  <Trash className="w-4 h-4" />
                </button>
                {isFolder && (
                  <>
                    <button onClick={() => startAddingItem(currentPath, 'file')} className="text-gray-400 hover:text-white ml-1">
                      <Plus className="w-4 h-4" /> <File className="w-3 h-3" />
                    </button>
                    <button onClick={() => startAddingItem(currentPath, 'folder')} className="text-gray-400 hover:text-white ml-1">
                      <Plus className="w-4 h-4" /> <Folder className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        
        {isFolder && isExpanded && (
          <div className="ml-4">
            {newItemParent === currentPath && (
              <div className="flex items-center py-1">
                {newItemType === 'folder' ? (
                  <Folder className="w-4 h-4 mr-1 text-yellow-400" />
                ) : (
                  <File className="w-4 h-4 mr-1 text-blue-400" />
                )}
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder={`New ${newItemType}`}
                  className="bg-gray-700 text-white px-2 py-1 rounded mr-1"
                  autoFocus
                />
                <button onClick={saveNewItem} className="text-green-500 mr-1">
                  <Save className="w-4 h-4" />
                </button>
                <button onClick={cancelAddingItem} className="text-red-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            
            {node.children && node.children.map((child: any) => renderTree(child, currentPath))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Project Structure</h2>
        <div>
          <button 
            onClick={() => startAddingItem('root', 'folder')}
            className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600"
          >
            Add Root Folder
          </button>
          <button 
            onClick={() => startAddingItem('root', 'file')}
            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
          >
            Add Root File
          </button>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-4 overflow-auto max-h-[calc(100vh-200px)]">
        {data && data.children && (
          <div>
            {newItemParent === 'root' && (
              <div className="flex items-center py-1 ml-4">
                {newItemType === 'folder' ? (
                  <Folder className="w-4 h-4 mr-1 text-yellow-400" />
                ) : (
                  <File className="w-4 h-4 mr-1 text-blue-400" />
                )}
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder={`New ${newItemType}`}
                  className="bg-gray-700 text-white px-2 py-1 rounded mr-1"
                  autoFocus
                />
                <button onClick={saveNewItem} className="text-green-500 mr-1">
                  <Save className="w-4 h-4" />
                </button>
                <button onClick={cancelAddingItem} className="text-red-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            
            {data.children.map((node: any) => renderTree(node))}
          </div>
        )}
      </div>
      
      <div className="mt-4 text-sm text-gray-400">
        <p>Tip: Click on folder icons to expand/collapse. Use the edit buttons to rename items.</p>
      </div>
    </div>
  );
};

export default ProjectStructure;