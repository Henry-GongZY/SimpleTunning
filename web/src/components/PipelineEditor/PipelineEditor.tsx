import { useCallback, useRef, type DragEvent } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
  useNodesState,
  useEdgesState,
  SelectionMode,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { usePipelineStore } from '../../stores/pipelineStore';
import type { NodeDef } from '../../types/pipeline';
import { ISPNode } from './ISPNode';

const nodeTypes: NodeTypes = {
  ispNode: ISPNode,
};

export function PipelineEditor() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { nodes: pipelineNodes, edges: pipelineEdges, addNode, addEdge: addPipelineEdge, removeNode, removeEdge, setSelectedNode } =
    usePipelineStore();

  const [reactFlowNodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [reactFlowEdges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target) {
        addPipelineEdge(connection.source, connection.target);
        setEdges((eds) => [...eds, { id: `${connection.source}->${connection.target}`, ...connection } as Edge]);
      }
    },
    [addPipelineEdge, setEdges]
  );

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      const raw = event.dataTransfer.getData('application/simpletunning-node');
      if (!raw) return;

      const nodeDef: NodeDef = JSON.parse(raw);
      const position = {
        x: event.clientX - (reactFlowWrapper.current?.getBoundingClientRect().left ?? 0),
        y: event.clientY - (reactFlowWrapper.current?.getBoundingClientRect().top ?? 0),
      };

      addNode(nodeDef, position);
    },
    [addNode]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode(node.id);
    },
    [setSelectedNode]
  );

  const onNodesDelete = useCallback(
    (nodes: Node[]) => {
      nodes.forEach((n) => removeNode(n.id));
    },
    [removeNode]
  );

  return (
    <div ref={reactFlowWrapper} className="flex-1 h-full" onDragOver={onDragOver} onDrop={onDrop}>
      <ReactFlow
        nodes={reactFlowNodes}
        edges={reactFlowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodesDelete={onNodesDelete}
        nodeTypes={nodeTypes}
        selectionMode={SelectionMode.Partial}
        deleteKeyCode={['Backspace', 'Delete']}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#1e293b" />
        <Controls className="!bg-surface !border-gray-700 !rounded-lg" />
        <MiniMap
          style={{ backgroundColor: '#0f0f23' }}
          maskColor="rgba(0, 0, 0, 0.5)"
          nodeColor={(node) => {
            switch (node.data?.category) {
              case 'input': return '#10b981';
              case 'output': return '#f59e0b';
              case 'denoise': return '#7c3aed';
              default: return '#00d4ff';
            }
          }}
        />
      </ReactFlow>
    </div>
  );
}
