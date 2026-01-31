import { MapNode, MapGenerateRequest, MapGenerateResponse, DEFAULT_LABELS, DISTANCE_COLORS } from '../models/MapNode';
import { SignalData, DEFAULT_SIGNALS } from '../models/AggregateSignal';
import { randomUUID } from 'crypto';

// Observation text templates (no numbers, per requirements)
const OBSERVATION_TEMPLATES = {
    near: [
        '最近、目にすることが多かった',
        '考えが残りやすい',
        '無言でも違和感はない',
        '距離が近い',
        '存在感がある',
    ],
    mid: [
        '反応は少なめ',
        'でも存在感はある',
        '距離は安定している',
        '日常の接点がある',
        '特に変化はない',
    ],
    far: [
        '会話は生まれていない',
        '少し気を使う',
        '距離がある',
        '関わりは薄め',
        '未整理の関係',
    ],
};

/**
 * Generate observation text for a node based on distance
 * Combines 2-4 templates to create natural-sounding text
 */
function generateObservationText(distance: 'near' | 'mid' | 'far'): string {
    const templates = OBSERVATION_TEMPLATES[distance];
    const count = 2 + Math.floor(Math.random() * 2); // 2-3 phrases
    const shuffled = [...templates].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);
    return selected.join('。') + '。';
}

/**
 * Calculate distance based on Facebook signals and user hints
 */
function calculateDistance(
    userHint: 'near' | 'mid' | 'far' | null | undefined,
    signals: SignalData,
    index: number
): 'near' | 'mid' | 'far' {
    // If user provided a hint, weight it heavily
    if (userHint) {
        return userHint;
    }

    // Use signals to influence distance
    // High activity tends toward 'near', low toward 'far'
    const activityWeight = signals.activityVolume === 'high' ? 0.3 : signals.activityVolume === 'moderate' ? 0.5 : 0.7;

    // Add some randomness for variety
    const random = Math.random();
    const combined = (random + activityWeight) / 2;

    if (combined < 0.35) return 'near';
    if (combined < 0.7) return 'mid';
    return 'far';
}

/**
 * Calculate node position using radial scatter layout
 */
function calculatePosition(
    distance: 'near' | 'mid' | 'far',
    index: number,
    totalNodes: number,
    jitterEnabled: boolean
): { x: number; y: number } {
    // Center is at (200, 200), total canvas 400x400
    const centerX = 200;
    const centerY = 200;

    // Distance radii
    const radii = {
        near: 60,
        mid: 120,
        far: 170,
    };

    const radius = radii[distance];

    // Angle based on node index
    const angleStep = (2 * Math.PI) / totalNodes;
    const baseAngle = index * angleStep - Math.PI / 2; // Start from top

    // Add jitter if enabled
    const jitterX = jitterEnabled ? (Math.random() - 0.5) * 16 : 0;
    const jitterY = jitterEnabled ? (Math.random() - 0.5) * 16 : 0;

    return {
        x: Math.round(centerX + radius * Math.cos(baseAngle) + jitterX),
        y: Math.round(centerY + radius * Math.sin(baseAngle) + jitterY),
    };
}

/**
 * Get color for distance
 */
function getColorForDistance(distance: 'near' | 'mid' | 'far'): string {
    return DISTANCE_COLORS[distance];
}

/**
 * Generate map from request
 */
export function generateMap(
    request: MapGenerateRequest,
    signals: SignalData = DEFAULT_SIGNALS,
    hasFacebookConnection: boolean = false
): MapGenerateResponse {
    const maxNodes = request.preferences?.maxNodes || 12;
    const jitterEnabled = request.preferences?.jitterEnabled ?? true;

    // Use provided nodes or default labels
    let inputNodes = request.nodes;
    if (!inputNodes || inputNodes.length === 0) {
        inputNodes = DEFAULT_LABELS.map((label, i) => ({
            id: `node-${i}`,
            label,
            customLabel: undefined,
            userHint: null,
        }));
    }

    // Limit to maxNodes
    const nodesToProcess = inputNodes.slice(0, maxNodes);
    const totalNodes = nodesToProcess.length;

    // Generate map nodes
    const nodes: MapNode[] = nodesToProcess.map((input, index) => {
        const distance = calculateDistance(input.userHint, signals, index);
        const position = calculatePosition(distance, index, totalNodes, jitterEnabled);

        return {
            id: input.id,
            label: input.label,
            customLabel: input.customLabel,
            position: {
                x: position.x,
                y: position.y,
                distance,
            },
            color: getColorForDistance(distance),
            observationText: generateObservationText(distance),
        };
    });

    return {
        mapId: randomUUID(),
        generatedAt: new Date().toISOString(),
        nodes,
        basis: {
            facebookSignals: hasFacebookConnection,
            userHints: nodesToProcess.some((n) => n.userHint !== null),
            randomJitter: jitterEnabled,
        },
    };
}

/**
 * Get observation text templates (for client-side generation)
 */
export function getObservationTemplates() {
    return OBSERVATION_TEMPLATES;
}
