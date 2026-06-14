import { create } from 'zustand';
import type { NodeDef, PipelineNode, PipelineEdge, PipelineConfig } from '../types/pipeline';
import { fetchNodeLibrary, savePipeline } from '../services/api';
import { wsClient } from '../services/websocket';

interface PipelineStore {
  // Node library
  nodeLibrary: NodeDef[];
  loadNodeLibrary: () => Promise<void>;

  // Pipeline state
  pipelineId: string;
  nodes: PipelineNode[];
  edges: PipelineEdge[];

  // UI state
  selectedNodeId: string | null;
  running: boolean;
  nodeTimings: Record<string, number>;

  // Actions
  setSelectedNode: (id: string | null) => void;
  addNode: (def: NodeDef, position: { x: number; y: number }) => void;
  updateNodeParams: (nodeId: string, params: Record<string, unknown>) => void;
  addEdge: (source: string, target: string) => void;
  removeNode: (id: string) => void;
  removeEdge: (source: string, target: string) => void;
  runPipeline: () => Promise<void>;
  getSelectedNode: () => PipelineNode | undefined;
}

let nodeCounter = 0;

export const usePipelineStore = create<PipelineStore>((set, get) => ({
  nodeLibrary: [],
  pipelineId: 'default',
  nodes: [],
  edges: [],
  selectedNodeId: null,
  running: false,
  nodeTimings: {},

  loadNodeLibrary: async () => {
    try {
      const lib = await fetchNodeLibrary();
      set({ nodeLibrary: lib });
    } catch (e) {
      console.error('Failed to load node library:', e);
    }
  },

  setSelectedNode: (id) => set({ selectedNodeId: id }),

  addNode: (def, position) => {
    const id = `${def.type}_${++nodeCounter}`;
    const params: Record<string, unknown> = {};
    def.params.forEach((p) => {
      params[p.name] = p.default;
    });

    set((state) => ({
      nodes: [...state.nodes, { id, type: def.type, params }],
    }));

    // Notify backend via WS
    wsClient.send({
      type: 'param_change',
      payload: { action: 'add_node', node_id: id, node_type: def.type },
    });
  },

  updateNodeParams: (nodeId, params) => {
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId ? { ...n, params: { ...n.params, ...params } } : n
      ),
    }));

    // Real-time param update via WS
    for (const [key, value] of Object.entries(params)) {
      wsClient.send({
        type: 'param_change',
        payload: { node_id: nodeId, param_name: key, value },
      });
    }
  },

  addEdge: (source, target) => {
    set((state) => ({
      edges: [...state.edges, { source, target }],
    }));
  },

  removeNode: (id) => {
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== id),
      edges: state.edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
    }));
  },

  removeEdge: (source, target) => {
    set((state) => ({
      edges: state.edges.filter(
        (e) => !(e.source === source && e.target === target)
      ),
    }));
  },

  runPipeline: async () => {
    const { pipelineId, nodes, edges } = get();
    set({ running: true });

    wsClient.send({
      type: 'run_pipeline',
      payload: { pipeline_id: pipelineId, nodes, edges },
    });
  },

  getSelectedNode: () => {
    const { nodes, selectedNodeId } = get();
    return nodes.find((n) => n.id === selectedNodeId);
  },
}));
