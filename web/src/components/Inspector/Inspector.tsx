import { usePipelineStore } from '../../stores/pipelineStore';
import type { ParamMeta } from '../../types/pipeline';

export function Inspector() {
  const { selectedNodeId, nodes, nodeLibrary, updateNodeParams } = usePipelineStore();

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  if (!selectedNode) {
    return (
      <div className="w-72 bg-surface border-l border-gray-700 flex items-center justify-center">
        <p className="text-gray-500 text-sm text-center px-4">
          Select a node to view and edit its parameters
        </p>
      </div>
    );
  }

  const def = nodeLibrary.find((d) => d.type === selectedNode.type);

  const renderControl = (param: ParamMeta, value: unknown) => {
    const onChange = (newValue: unknown) => {
      updateNodeParams(selectedNode.id, { [param.name]: newValue });
    };

    switch (param.type) {
      case 'float':
      case 'int':
        return (
          <div key={param.name} className="space-y-1">
            <div className="flex justify-between">
              <label className="text-xs text-gray-400">{param.name}</label>
              <span className="text-xs text-gray-500">{String(value)}</span>
            </div>
            <input
              type="range"
              min={Number(param.min ?? 0)}
              max={Number(param.max ?? 100)}
              step={param.type === 'float' ? 0.1 : 1}
              value={Number(value)}
              onChange={(e) => onChange(param.type === 'int' ? parseInt(e.target.value) : parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer
                accent-accent"
            />
          </div>
        );
      case 'bool':
        return (
          <div key={param.name} className="flex justify-between items-center">
            <label className="text-xs text-gray-400">{param.name}</label>
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => onChange(e.target.checked)}
              className="w-4 h-4 rounded accent-accent"
            />
          </div>
        );
      case 'enum':
      case 'string':
        if (param.options?.length) {
          return (
            <div key={param.name} className="space-y-1">
              <label className="text-xs text-gray-400">{param.name}</label>
              <select
                value={String(value)}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-2 py-1 text-xs bg-surface-light border border-gray-600 rounded text-gray-200"
              >
                {param.options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          );
        }
        return (
          <div key={param.name} className="space-y-1">
            <label className="text-xs text-gray-400">{param.name}</label>
            <input
              type="text"
              value={String(value)}
              onChange={(e) => onChange(e.target.value)}
              className="w-full px-2 py-1 text-xs bg-surface-light border border-gray-600 rounded text-gray-200"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-72 bg-surface border-l border-gray-700 flex flex-col overflow-y-auto">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Inspector</h2>
        <div className="mt-2">
          <span className="text-sm text-gray-200 font-medium">
            {def?.label ?? selectedNode.type}
          </span>
          <span className="text-xs text-gray-500 ml-2">{selectedNode.id}</span>
        </div>
      </div>
      <div className="flex-1 p-4 space-y-4">
        {def?.params.map((param) => {
          const value = selectedNode.params[param.name] ?? param.default;
          return renderControl(param, value);
        })}
        {(!def?.params || def.params.length === 0) && (
          <p className="text-gray-500 text-xs">No configurable parameters</p>
        )}
      </div>
    </div>
  );
}
