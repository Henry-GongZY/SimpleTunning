"""WebSocket handler for real-time pipeline interaction."""

import json
import time
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()


class PipelineSession:
    """Manages a single WebSocket session for pipeline tuning."""

    def __init__(self, websocket: WebSocket):
        self.ws = websocket
        self.pipeline_id: str | None = None
        self.running = False

    async def handle_message(self, raw: str):
        """Dispatch incoming WebSocket messages."""
        try:
            msg = json.loads(raw)
            msg_type = msg.get("type", "")

            if msg_type == "param_change":
                await self._on_param_change(msg.get("payload", {}))
            elif msg_type == "run_pipeline":
                await self._on_run_pipeline(msg.get("payload", {}))
            elif msg_type == "get_intermediate":
                await self._on_get_intermediate(msg.get("payload", {}))
            else:
                await self._send_error(f"Unknown message type: {msg_type}")

        except json.JSONDecodeError:
            await self._send_error("Invalid JSON")

    async def _on_param_change(self, payload: dict):
        """Handle real-time parameter change from inspector slider."""
        node_id = payload.get("node_id")
        param_name = payload.get("param_name")
        value = payload.get("value")

        # TODO: Call C++ engine's incremental execution
        # For now, acknowledge
        await self.ws.send_json({
            "type": "param_changed",
            "payload": {
                "node_id": node_id,
                "param_name": param_name,
                "value": value,
                "timestamp": time.time(),
            },
        })

    async def _on_run_pipeline(self, payload: dict):
        """Execute entire pipeline and stream results back."""
        self.running = True

        # Simulate per-node progress
        nodes = payload.get("nodes", [])
        for i, node in enumerate(nodes):
            if not self.running:
                break

            # TODO: Replace with actual C++ engine call
            await asyncio.sleep(0.01)  # Simulate work

            await self.ws.send_json({
                "type": "node_progress",
                "payload": {
                    "node_id": node.get("id"),
                    "status": "completed",
                    "progress": (i + 1) / len(nodes),
                    "timing_ms": 1.5,
                },
            })

        self.running = False
        await self.ws.send_json({
            "type": "pipeline_complete",
            "payload": {"status": "success", "total_time_ms": len(nodes) * 1.5},
        })

    async def _on_get_intermediate(self, payload: dict):
        """Retrieve intermediate result image for a specific node."""
        node_id = payload.get("node_id")

        # TODO: Fetch from C++ MemoryPool via Pybind11
        await self.ws.send_json({
            "type": "intermediate_result",
            "payload": {
                "node_id": node_id,
                "available": True,
                # In production: binary image data follows
            },
        })

    async def _send_error(self, message: str):
        await self.ws.send_json({
            "type": "error",
            "payload": {"message": message},
        })


@router.websocket("/ws/pipeline")
async def websocket_pipeline(ws: WebSocket):
    """Main WebSocket endpoint for pipeline tuning."""
    await ws.accept()

    session = PipelineSession(ws)

    try:
        while True:
            data = await ws.receive_text()
            await session.handle_message(data)
    except WebSocketDisconnect:
        session.running = False
    except Exception as e:
        session.running = False
        try:
            await ws.send_json({"type": "error", "payload": {"message": str(e)}})
        except Exception:
            pass
