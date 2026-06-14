"""REST API endpoints for pipeline management."""

from fastapi import APIRouter, HTTPException
from app.schemas.pipeline import (
    PipelineConfig,
    PipelineResult,
    NodeDef,
    ParamMeta,
    ParamType,
)

router = APIRouter()
router_nodes = APIRouter()


# --- Node Library ---

@router_nodes.get("/library")
async def get_node_library() -> list[NodeDef]:
    """Return all available ISP node types for the frontend library."""
    # In production, these would be dynamically loaded from C++ plugin registry
    return [
        NodeDef(
            type="RawReader",
            label="RAW Reader",
            category="input",
            description="Reads RAW/Bayer image from disk",
            params=[
                ParamMeta(name="file_path", type=ParamType.STRING, default=""),
                ParamMeta(name="bit_depth", type=ParamType.INT, default=14, min=8, max=16),
            ],
        ),
        NodeDef(
            type="Demosaic",
            label="Demosaic",
            category="cfa",
            description="Bayer pattern to RGB demosaicing",
            params=[
                ParamMeta(
                    name="method", type=ParamType.ENUM, default="Malvar",
                    options=["Malvar", "VNG", "Bilinear"]
                ),
            ],
        ),
        NodeDef(
            type="Denoise",
            label="Bilateral Denoise",
            category="denoise",
            description="Edge-preserving bilateral filter",
            params=[
                ParamMeta(name="sigma_color", type=ParamType.FLOAT, default=15.0, min=0.0, max=100.0),
                ParamMeta(name="sigma_space", type=ParamType.FLOAT, default=8.0, min=0.0, max=100.0),
                ParamMeta(name="kernel_size", type=ParamType.INT, default=5, min=3, max=15),
            ],
        ),
        NodeDef(
            type="ToneMapping",
            label="Tone Mapping",
            category="color",
            description="Gamma correction, exposure, and contrast adjustment",
            params=[
                ParamMeta(name="gamma", type=ParamType.FLOAT, default=2.2, min=0.1, max=10.0),
                ParamMeta(name="exposure", type=ParamType.FLOAT, default=0.0, min=-5.0, max=5.0),
                ParamMeta(name="contrast", type=ParamType.FLOAT, default=1.0, min=0.0, max=3.0),
            ],
        ),
    ]


# --- Pipeline CRUD ---

_pipeline_store: dict[str, PipelineConfig] = {}


@router.post("/save")
async def save_pipeline(config: PipelineConfig) -> dict:
    """Save a pipeline configuration."""
    _pipeline_store[config.pipeline_id] = config
    return {"pipeline_id": config.pipeline_id, "status": "saved"}


@router.get("/load/{pipeline_id}")
async def load_pipeline(pipeline_id: str) -> PipelineConfig:
    """Load a saved pipeline configuration."""
    if pipeline_id not in _pipeline_store:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    return _pipeline_store[pipeline_id]


@router.delete("/delete/{pipeline_id}")
async def delete_pipeline(pipeline_id: str) -> dict:
    """Delete a saved pipeline configuration."""
    if pipeline_id in _pipeline_store:
        del _pipeline_store[pipeline_id]
    return {"pipeline_id": pipeline_id, "status": "deleted"}
