import { type DragEvent } from 'react';
import { usePipelineStore } from '../../stores/pipelineStore';

export function NodeLibrary() {
  const { nodeLibrary } = usePipelineStore();

  const onDragStart = (event: DragEvent, nodeDef: (typeof nodeLibrary)[0]) => {
    event.dataTransfer.setData('application/simpletunning-node', JSON.stringify(nodeDef));
    event.dataTransfer.effectAllowed = 'move';
  };

  // Group nodes by category
  const grouped = nodeLibrary.reduce<Record<string, typeof nodeLibrary>>((acc, def) => {
    const cat = def.category || 'general';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(def);
    return acc;
  }, {});

  return (
    <div className="w-64 bg-surface flex flex-col border-r border-gray-700 overflow-y-auto">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Node Library</h2>
      </div>
      <div className="flex-1 p-2 space-y-4">
        {Object.entries(grouped).map(([category, nodes]) => (
          <div key={category}>
            <h3 className="text-xs text-gray-500 uppercase px-2 mb-1 tracking-wider">{category}</h3>
            {nodes.map((def) => (
              <div
                key={def.type}
                className="px-3 py-2 mx-1 my-0.5 rounded-md bg-surface-light hover:bg-gray-700 cursor-grab
                  border border-gray-700 hover:border-accent transition-colors"
                draggable
                onDragStart={(e) => onDragStart(e, def)}
              >
                <div className="text-sm text-gray-200">{def.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{def.description}</div>
              </div>
            ))}
          </div>
        ))}
        {nodeLibrary.length === 0 && (
          <p className="text-gray-500 text-sm px-2">Loading node library...</p>
        )}
      </div>
    </div>
  );
}
