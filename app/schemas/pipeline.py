"""Pydantic models for the Pipeline DSL - shared contract with frontend."""

from pydantic import BaseModel, Field
from typing import Any, Optional
from enum import Enum


class ParamType(str, Enum):
    INT = "int"
    FLOAT = "float"
    BOOL = "bool"
    STRING = "string"
    ENUM = "enum"


class ParamMeta(BaseModel):
    """Metadata for a single node parameter."""
    name: str
    type: ParamType
    default: Any
    min: Optional[Any] = None
    max: Optional[Any] = None
    options: Optional[list[str]] = None  # For enum type


class NodeDef(BaseModel):
    """Definition of an available ISP node type."""
    type: str
    label: str
    category: str = "general"  # e.g., "input", "demosaic", "denoise", "color", "output"
    description: str = ""
    params: list[ParamMeta] = []


class PipelineNode(BaseModel):
    """An instantiated node in a pipeline."""
    id: str
    type: str
    params: dict[str, Any] = {}


class PipelineEdge(BaseModel):
    """A connection between two nodes."""
    source: str
    target: str


class PipelineConfig(BaseModel):
    """Full pipeline configuration (JSON DSL)."""
    pipeline_id: str = "default"
    nodes: list[PipelineNode] = []
    edges: list[PipelineEdge] = []


class PipelineResult(BaseModel):
    """Result from executing a pipeline."""
    pipeline_id: str
    status: str  # "success", "error"
    node_timings: dict[str, float] = {}  # node_id -> exec_time_ms
    error: Optional[str] = None


# WebSocket message types
class WSMessage(BaseModel):
    """Message sent via WebSocket."""
    type: str  # "param_change", "run_pipeline", "get_intermediate", "result"
    payload: dict[str, Any] = {}
