// Aggregate signal model for Table Storage
export interface AggregateSignal {
    partitionKey: string; // userId
    rowKey: string; // timestamp (ISO string)
    windowDays: number;
    signals: string; // JSON stringified SignalData
    collectedAt: Date;
    validUntil: Date;
}

export interface SignalData {
    activityVolume: 'low' | 'moderate' | 'high';
    reactionCount: 'low' | 'medium' | 'high';
    commentCount: 'low' | 'medium' | 'high';
    postCount: 'low' | 'medium' | 'high';
}

// API response types
export interface AggregateSignalResponse {
    userId: string;
    windowDays: number;
    signals: SignalData;
    collectedAt: string;
    validUntil: string;
}

// Default fallback signals when Facebook is not connected
export const DEFAULT_SIGNALS: SignalData = {
    activityVolume: 'moderate',
    reactionCount: 'medium',
    commentCount: 'medium',
    postCount: 'medium',
};
