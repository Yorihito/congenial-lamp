// Map-related types
export interface MapNode {
    id: string;
    label: string;
    customLabel?: string;
    position: NodePosition;
    color: string;
    observationText: string;
}

export interface NodePosition {
    x: number;
    y: number;
    distance: 'near' | 'mid' | 'far';
}

export interface MapData {
    mapId: string;
    generatedAt: string;
    nodes: MapNode[];
    basis: {
        facebookSignals: boolean;
        userHints: boolean;
        randomJitter: boolean;
    };
}

export interface MapGenerateRequest {
    nodes: MapNodeInput[];
    preferences?: {
        maxNodes?: number;
        jitterEnabled?: boolean;
    };
}

export interface MapNodeInput {
    id: string;
    label: string;
    customLabel?: string;
    userHint?: 'near' | 'mid' | 'far' | null;
}

// Distance colors
export const DISTANCE_COLORS = {
    near: '#FF6B6B',
    mid: '#4ECDC4',
    far: '#95A5A6',
};

// Default labels
export const DEFAULT_LABELS = ['家族', '友達', '職場', '最近よく見かける人'];
