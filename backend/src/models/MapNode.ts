// Map node model
export interface MapNode {
    id: string;
    label: string; // Default label (家族, 友達, etc.)
    customLabel?: string; // User customized label
    position: NodePosition;
    color: string;
    observationText: string;
}

export interface NodePosition {
    x: number;
    y: number;
    distance: 'near' | 'mid' | 'far';
}

// API request/response types
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

export interface MapGenerateResponse {
    mapId: string;
    generatedAt: string;
    nodes: MapNode[];
    basis: {
        facebookSignals: boolean;
        userHints: boolean;
        randomJitter: boolean;
    };
}

// Default labels for fallback mode
export const DEFAULT_LABELS = [
    '家族',
    '友達',
    '職場',
    '最近よく見かける人',
];

// Color themes based on distance
export const DISTANCE_COLORS = {
    near: '#FF6B6B', // Warm red/orange
    mid: '#4ECDC4', // Teal
    far: '#95A5A6', // Gray
};
