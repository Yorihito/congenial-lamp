import { SignalData, DEFAULT_SIGNALS } from '../models/AggregateSignal';

// Facebook Graph API configuration
const FACEBOOK_GRAPH_API_BASE = 'https://graph.facebook.com/v19.0';

export interface FacebookUserData {
    id: string;
    name: string;
}

export interface FacebookEngagementData {
    reactions: number;
    comments: number;
    posts: number;
}

/**
 * Verify Facebook access token validity
 */
export async function verifyAccessToken(accessToken: string): Promise<FacebookUserData | null> {
    try {
        const response = await fetch(
            `${FACEBOOK_GRAPH_API_BASE}/me?fields=id,name&access_token=${accessToken}`
        );

        if (!response.ok) {
            console.error('Facebook token verification failed:', response.status);
            return null;
        }

        const data = await response.json();
        return {
            id: data.id,
            name: data.name,
        };
    } catch (error) {
        console.error('Error verifying Facebook token:', error);
        return null;
    }
}

/**
 * Get user's engagement data from Facebook Graph API
 * Note: This fetches aggregate activity data, not individual post content
 */
export async function getEngagementData(
    accessToken: string,
    windowDays: number = 14
): Promise<FacebookEngagementData | null> {
    try {
        // Get user's posts count (only public posts the user has made)
        const postsResponse = await fetch(
            `${FACEBOOK_GRAPH_API_BASE}/me/posts?fields=id&limit=100&access_token=${accessToken}`
        );

        if (!postsResponse.ok) {
            console.error('Failed to fetch posts:', postsResponse.status);
            return null;
        }

        const postsData = await postsResponse.json();
        const postCount = postsData.data?.length || 0;

        // Get reactions the user has made
        // Note: Facebook API may limit what data is available
        let reactionCount = 0;
        let commentCount = 0;

        // Try to get user's activity feed
        const feedResponse = await fetch(
            `${FACEBOOK_GRAPH_API_BASE}/me/feed?fields=id,reactions.summary(true),comments.summary(true)&limit=50&access_token=${accessToken}`
        );

        if (feedResponse.ok) {
            const feedData = await feedResponse.json();
            for (const item of feedData.data || []) {
                if (item.reactions?.summary?.total_count) {
                    reactionCount += item.reactions.summary.total_count;
                }
                if (item.comments?.summary?.total_count) {
                    commentCount += item.comments.summary.total_count;
                }
            }
        }

        return {
            reactions: reactionCount,
            comments: commentCount,
            posts: postCount,
        };
    } catch (error) {
        console.error('Error fetching engagement data:', error);
        return null;
    }
}

/**
 * Convert raw engagement numbers to aggregate signal levels
 * to avoid exposing exact numbers
 */
export function convertToSignalData(engagement: FacebookEngagementData | null): SignalData {
    if (!engagement) {
        return DEFAULT_SIGNALS;
    }

    const { reactions, comments, posts } = engagement;

    // Convert to levels (avoiding exact numbers per requirements)
    const getLevel = (value: number, low: number, high: number): 'low' | 'medium' | 'high' => {
        if (value < low) return 'low';
        if (value < high) return 'medium';
        return 'high';
    };

    const getVolumeLevel = (value: number, low: number, high: number): 'low' | 'moderate' | 'high' => {
        if (value < low) return 'low';
        if (value < high) return 'moderate';
        return 'high';
    };

    // Calculate activity volume as combined metric
    const totalActivity = reactions + comments + posts;

    return {
        activityVolume: getVolumeLevel(totalActivity, 10, 50),
        reactionCount: getLevel(reactions, 5, 20),
        commentCount: getLevel(comments, 3, 10),
        postCount: getLevel(posts, 2, 10),
    };
}

/**
 * Fetch and process Facebook signals for a user
 */
export async function fetchFacebookSignals(
    accessToken: string,
    windowDays: number = 14
): Promise<SignalData> {
    const engagement = await getEngagementData(accessToken, windowDays);
    return convertToSignalData(engagement);
}
