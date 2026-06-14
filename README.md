# SimpleTunning - ISP Algorithm Tuning Platform

A node-based visual IDE for Image Signal Processing (ISP) algorithm tuning. Supports dynamic topology editing, real-time parameter adjustment, and intelligent caching for millisecond-level feedback.

## Architecture

```
Frontend (React + TypeScript + React Flow)
    │
    ├── REST ────── Backend (Python FastAPI)
    ├── WebSocket ──── Backend (Python FastAPI)
                         │
                         └── Pybind11 ──── C++ Engine (OpenCV + Taskflow)
```

## Quick Start

```bash
# Start backend
cd backend && pip install -r requirements.txt && uvicorn main:app --reload

# Start frontend (in another terminal)
cd frontend && npm install && npm run dev
```

## Project Structure

- `frontend/` — React + TypeScript + Vite + React Flow
- `backend/` — Python FastAPI + WebSocket
- `engine/` — C++ ISP algorithm engine (OpenCV + Taskflow + Pybind11)
- `schemas/` — Shared JSON Schema for pipeline DSL
