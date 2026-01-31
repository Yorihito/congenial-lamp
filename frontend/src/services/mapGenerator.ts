import type { MapNodeInput, MapData, MapNode } from '../types/map';
import { DISTANCE_COLORS } from '../types/map';
import { generateObservationText, DEFAULT_LABELS } from '../utils/observationText';
import { v4 as uuidv4 } from 'uuid';

interface GenerateMapOptions {
    maxNodes?: number;
    jitterEnabled?: boolean;
    hasFacebookConnection?: boolean;
}

/**
 * Calculate distance based on user hints and random variation
 * For fallback mode without Facebook data
 */
function calculateDistance(
    userHint: 'near' | 'mid' | 'far' | null | undefined,
    _index: number
): 'near' | 'mid' | 'far' {
    if (userHint) {
        return userHint;
    }

    // Random distribution for fallback mode
    const random = Math.random();
    if (random < 0.33) return 'near';
    if (random < 0.66) return 'mid';
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
    const centerX = 200;
    const centerY = 200;

    const radii = {
        near: 60,
        mid: 120,
        far: 170,
    };

    const radius = radii[distance];
    const angleStep = (2 * Math.PI) / totalNodes;
    const baseAngle = index * angleStep - Math.PI / 2;

    const jitterX = jitterEnabled ? (Math.random() - 0.5) * 16 : 0;
    const jitterY = jitterEnabled ? (Math.random() - 0.5) * 16 : 0;

    return {
        x: Math.round(centerX + radius * Math.cos(baseAngle) + jitterX),
        y: Math.round(centerY + radius * Math.sin(baseAngle) + jitterY),
    };
}

/**
 * Generate map data locally (fallback mode)
 */
export function generateMapLocally(
    nodeInputs: MapNodeInput[],
    options: GenerateMapOptions = {}
): MapData {
    const {
        maxNodes = 12,
        jitterEnabled = true,
        hasFacebookConnection = false,
    } = options;

    // Use provided nodes or default labels
    let inputNodes = nodeInputs;
    if (!inputNodes || inputNodes.length === 0) {
        inputNodes = DEFAULT_LABELS.map((label, i) => ({
            id: `node-${i}`,
            label,
            customLabel: undefined,
            userHint: null,
        }));
    }

    const nodesToProcess = inputNodes.slice(0, maxNodes);
    const totalNodes = nodesToProcess.length;

    const nodes: MapNode[] = nodesToProcess.map((input, index) => {
        const distance = calculateDistance(input.userHint, index);
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
            color: DISTANCE_COLORS[distance],
            observationText: generateObservationText(distance),
        };
    });

    return {
        mapId: uuidv4(),
        generatedAt: new Date().toISOString(),
        nodes,
        basis: {
            facebookSignals: hasFacebookConnection,
            userHints: nodesToProcess.some((n) => n.userHint !== null),
            randomJitter: jitterEnabled,
        },
    };
}
