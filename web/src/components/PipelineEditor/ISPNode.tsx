import { Handle, Position, type NodeProps } from '@xyflow/react';

interface ISPNodeData {
  label: string;
  category: string;
  type: string;
}

export function ISPNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as ISPNodeData;

  const categoryColors: Record<string, string> = {
    input: 'border-l-green-500',
    cfa: 'border-l-blue-500',
    denoise: 'border-l-purple-500',
    color: 'border-l-orange-500',
    output: 'border-l-yellow-500',
  };

  const borderClass = categoryColors[nodeData.category] || 'border-l-gray-500';

  return (
    <div className={`isp-node ${selected ? 'selected' : ''} border-l-4 ${borderClass}`}>
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-gray-500" />
      <div className="node-header">{nodeData.label ?? nodeData.type}</div>
      <div className="node-type">{nodeData.category}</div>
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-gray-500" />
    </div>
  );
}
