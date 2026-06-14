import type { NodeDef, PipelineConfig, PipelineResult } from '../types/pipeline';

const BASE_URL = '/api';

export async function fetchNodeLibrary(): Promise<NodeDef[]> {
  const res = await fetch(`${BASE_URL}/nodes/library`);
  if (!res.ok) throw new Error(`Failed to fetch node library: ${res.status}`);
  return res.json();
}

export async function savePipeline(config: PipelineConfig): Promise<{ pipeline_id: string; status: string }> {
  const res = await fetch(`${BASE_URL}/pipeline/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  if (!res.ok) throw new Error(`Failed to save pipeline: ${res.status}`);
  return res.json();
}

export async function loadPipeline(pipelineId: string): Promise<PipelineConfig> {
  const res = await fetch(`${BASE_URL}/pipeline/load/${pipelineId}`);
  if (!res.ok) throw new Error(`Failed to load pipeline: ${res.status}`);
  return res.json();
}

export async function deletePipeline(pipelineId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/pipeline/delete/${pipelineId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete pipeline: ${res.status}`);
}
