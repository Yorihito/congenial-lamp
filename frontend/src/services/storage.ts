import Dexie, { type Table } from 'dexie';
import type { MapData, MapNodeInput } from '../types/map';
import type { UserPreferences } from '../types/user';
import { DEFAULT_USER_PREFERENCES } from '../types/user';

// Database schema
interface LocalMapData extends MapData {
    id?: number;
    cachedAt: number;
}

interface LocalSettings {
    id?: number;
    key: string;
    value: string;
}

class KoroMapDatabase extends Dexie {
    maps!: Table<LocalMapData>;
    settings!: Table<LocalSettings>;
    nodeInputs!: Table<{ nodeId: string; label: string; customLabel?: string; userHint?: 'near' | 'mid' | 'far' | null }>;

    constructor() {
        super('KoroMapDB');
        this.version(1).stores({
            maps: '++id, mapId, cachedAt',
            settings: '++id, key',
            nodeInputs: '++id, label',
        });
    }
}

const db = new KoroMapDatabase();

// Cache validity duration (24 hours)
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000;

/**
 * Save map data to local storage
 */
export async function saveMapData(mapData: MapData): Promise<void> {
    // Clear old maps and save new one
    await db.maps.clear();
    await db.maps.add({
        ...mapData,
        cachedAt: Date.now(),
    });
}

/**
 * Get cached map data if valid
 */
export async function getCachedMapData(): Promise<MapData | null> {
    const maps = await db.maps.toArray();
    if (maps.length === 0) return null;

    const latestMap = maps[0];
    const age = Date.now() - latestMap.cachedAt;

    if (age > CACHE_DURATION_MS) {
        // Cache expired
        await db.maps.clear();
        return null;
    }

    return latestMap;
}

/**
 * Check if cache is valid
 */
export async function isCacheValid(): Promise<boolean> {
    const mapData = await getCachedMapData();
    return mapData !== null;
}

/**
 * Save user preferences
 */
export async function savePreferences(preferences: UserPreferences): Promise<void> {
    await db.settings.where('key').equals('preferences').delete();
    await db.settings.add({
        key: 'preferences',
        value: JSON.stringify(preferences),
    });
}

/**
 * Get user preferences
 */
export async function getPreferences(): Promise<UserPreferences> {
    const setting = await db.settings.where('key').equals('preferences').first();
    if (!setting) return DEFAULT_USER_PREFERENCES;

    try {
        return JSON.parse(setting.value);
    } catch {
        return DEFAULT_USER_PREFERENCES;
    }
}

/**
 * Save node inputs (for persistence between sessions)
 */
export async function saveNodeInputs(nodes: MapNodeInput[]): Promise<void> {
    await db.nodeInputs.clear();
    await db.nodeInputs.bulkAdd(nodes.map(n => ({
        nodeId: n.id,
        label: n.label,
        customLabel: n.customLabel,
        userHint: n.userHint,
    })));
}

/**
 * Get saved node inputs
 */
export async function getNodeInputs(): Promise<MapNodeInput[]> {
    const items = await db.nodeInputs.toArray();
    return items.map(item => ({
        id: item.nodeId,
        label: item.label,
        customLabel: item.customLabel,
        userHint: item.userHint,
    }));
}

/**
 * Clear all local data
 */
export async function clearAllData(): Promise<void> {
    await db.maps.clear();
    await db.settings.clear();
    await db.nodeInputs.clear();
}

/**
 * Save onboarding complete flag
 */
export async function setOnboardingComplete(complete: boolean): Promise<void> {
    await db.settings.where('key').equals('onboardingComplete').delete();
    await db.settings.add({
        key: 'onboardingComplete',
        value: String(complete),
    });
}

/**
 * Check if onboarding is complete
 */
export async function isOnboardingComplete(): Promise<boolean> {
    const setting = await db.settings.where('key').equals('onboardingComplete').first();
    return setting?.value === 'true';
}

export { db };
