/** TypeScript types for the Pipeline DSL - shared contract with backend. */

export type ParamType = 'int' | 'float' | 'bool' | 'string' | 'enum';

export interface ParamMeta {
  name: string;
  type: ParamType;
  default: unknown;
  min?: number | null;
  max?: number | null;
  options?: string[] | null;
}

export interface NodeDef {
  type: string;
  label: string;
  category: string;
  description: string;
  params: ParamMeta[];
}

export interface PipelineNode {
  id: string;
  type: string;
  params: Record<string, unknown>;
}

export interface PipelineEdge {
  source: string;
  target: string;
}

export interface PipelineConfig {
  pipeline_id: string;
  nodes: PipelineNode[];
  edges: PipelineEdge[];
}

export interface PipelineResult {
  pipeline_id: string;
  status: string;
  node_timings: Record<string, number>;
  error?: string | null;
}

/** WebSocket message types */
export type WSMessageType =
  | 'param_change'
  | 'param_changed'
  | 'run_pipeline'
  | 'pipeline_complete'
  | 'node_progress'
  | 'get_intermediate'
  | 'intermediate_result'
  | 'error';

export interface WSMessage {
  type: WSMessageType;
  payload: Record<string, unknown>;
}
