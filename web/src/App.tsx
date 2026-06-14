import { useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { PipelineEditor } from './components/PipelineEditor/PipelineEditor';
import { NodeLibrary } from './components/NodeLibrary/NodeLibrary';
import { Inspector } from './components/Inspector/Inspector';
import { ImageViewer } from './components/ImageViewer/ImageViewer';
import { StatsPanel } from './components/StatsPanel/StatsPanel';
import { usePipelineStore } from './stores/pipelineStore';
import { wsClient } from './services/websocket';

function PipelineApp() {
  const { loadNodeLibrary, runPipeline } = usePipelineStore();

  useEffect(() => {
    loadNodeLibrary();
    wsClient.connect();
    return () => wsClient.disconnect();
  }, [loadNodeLibrary]);

  return (
    <div className="h-full flex flex-col bg-surface-dark">
      {/* Toolbar */}
      <header className="h-11 bg-surface border-b border-gray-700 flex items-center px-4 gap-3 flex-shrink-0">
        <h1 className="text-sm font-bold text-accent tracking-wide">
          SimpleTunning
          <span className="text-gray-500 font-normal ml-2 text-xs">ISP Algorithm Tuning Platform</span>
        </h1>
        <div className="flex-1" />
        <button
          onClick={runPipeline}
          className="px-3 py-1 bg-accent text-black text-xs font-semibold rounded-md
            hover:bg-cyan-300 transition-colors"
        >
          Run Pipeline
        </button>
      </header>

      {/* Main content */}
      <div className="flex-1 flex min-h-0">
        <NodeLibrary />
        <div className="flex-1 flex flex-col min-w-0">
          <PipelineEditor />
          <div className="h-48 flex gap-2 p-2 bg-surface-dark border-t border-gray-700">
            <ImageViewer title="Pipeline Output" className="flex-1" />
            <StatsPanel />
          </div>
        </div>
        <Inspector />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <PipelineApp />
    </ReactFlowProvider>
  );
}
