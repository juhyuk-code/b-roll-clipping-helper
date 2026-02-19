import useStore from './store/useStore';
import DropZone from './components/DropZone';
import AnalyzingView from './components/AnalyzingView';
import CuratorView from './components/CuratorView';

export default function App() {
  const appState = useStore((s) => s.appState);

  return (
    <div className="min-h-screen bg-bg">
      {appState === 'EMPTY' && <DropZone />}
      {appState === 'PARSING' && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-400 text-sm">Parsing script...</div>
        </div>
      )}
      {appState === 'ANALYZING' && <AnalyzingView />}
      {appState === 'CURATING' && <CuratorView />}
    </div>
  );
}
