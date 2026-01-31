import { useState, useEffect } from 'react';
import { MapView, NodeDetail } from './components/Map';
import { OnboardingFlow } from './components/Onboarding';
import { SettingsScreen } from './components/Settings';
import type { MapNode, MapNodeInput, MapData } from './types/map';
import {
  isOnboardingComplete,
  setOnboardingComplete,
  getCachedMapData,
  saveMapData,
  getNodeInputs,
  saveNodeInputs,
  getPreferences,
} from './services/storage';
import { generateMapLocally } from './services/mapGenerator';
import './styles/global.css';
import './App.css';

function App() {
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);
  const [facebookConnected, setFacebookConnected] = useState(false);
  const [nodeInputs, setNodeInputs] = useState<MapNodeInput[]>([]);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      const onboardingDone = await isOnboardingComplete();

      if (!onboardingDone) {
        setShowOnboarding(true);
        setLoading(false);
        return;
      }

      // Try to load cached map
      const cached = await getCachedMapData();
      const savedNodes = await getNodeInputs();

      if (savedNodes.length > 0) {
        setNodeInputs(savedNodes);
      }

      if (cached) {
        setMapData(cached);
      } else {
        // Generate new map (fallback mode)
        await generateNewMap(savedNodes);
      }
    } catch (error) {
      console.error('Failed to initialize app:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewMap = async (nodes?: MapNodeInput[]) => {
    const prefs = await getPreferences();
    const newMap = generateMapLocally(nodes || nodeInputs, {
      maxNodes: prefs.maxNodes,
      jitterEnabled: true,
      hasFacebookConnection: facebookConnected,
    });

    setMapData(newMap);
    await saveMapData(newMap);
  };

  const handleOnboardingComplete = async (useFacebook: boolean) => {
    setFacebookConnected(useFacebook);
    await setOnboardingComplete(true);
    setShowOnboarding(false);

    // Generate initial map
    await generateNewMap();
  };

  const handleNodeClick = (node: MapNode) => {
    setSelectedNode(node);
  };

  const handleLabelEdit = async (nodeId: string, newLabel: string) => {
    // Update node inputs
    const updatedInputs = nodeInputs.map((n) =>
      n.id === nodeId ? { ...n, customLabel: newLabel } : n
    );
    setNodeInputs(updatedInputs);
    await saveNodeInputs(updatedInputs);

    // Update current map data
    if (mapData) {
      const updatedNodes = mapData.nodes.map((n) =>
        n.id === nodeId ? { ...n, customLabel: newLabel } : n
      );
      const updatedMap = { ...mapData, nodes: updatedNodes };
      setMapData(updatedMap);
      await saveMapData(updatedMap);
    }

    setSelectedNode(null);
  };

  const handleRefresh = async () => {
    await generateNewMap();
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner" />
        <p>読み込み中...</p>
      </div>
    );
  }

  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">心の距離マップ</h1>
        <button className="header-btn" onClick={() => setShowSettings(true)}>
          ⚙️
        </button>
      </header>

      <main className="app-main">
        {mapData && (
          <MapView
            nodes={mapData.nodes}
            onNodeClick={handleNodeClick}
          />
        )}

        <div className="map-actions">
          <button className="refresh-btn" onClick={handleRefresh}>
            🔄 更新
          </button>
        </div>
      </main>

      {selectedNode && (
        <NodeDetail
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          onLabelEdit={handleLabelEdit}
        />
      )}

      {showSettings && (
        <SettingsScreen
          onClose={() => setShowSettings(false)}
          facebookConnected={facebookConnected}
          onFacebookDisconnect={() => setFacebookConnected(false)}
          onFacebookConnect={() => setFacebookConnected(true)}
        />
      )}
    </div>
  );
}

export default App;
