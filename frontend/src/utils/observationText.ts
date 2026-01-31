// Observation text generation utility
// Following requirements: no numbers, no psychology terms, gentle tone

const OBSERVATION_TEMPLATES = {
    near: [
        '最近、目にすることが多かった',
        '考えが残りやすい',
        '無言でも違和感はない',
        '距離が近い',
        '存在感がある',
        '気楽な関係',
    ],
    mid: [
        '反応は少なめ',
        'でも存在感はある',
        '距離は安定している',
        '日常の接点がある',
        '特に変化はない',
        '穏やかな関係',
    ],
    far: [
        '会話は生まれていない',
        '少し気を使う',
        '距離がある',
        '関わりは薄め',
        '未整理の関係',
        '存在は感じる',
    ],
};

/**
 * Generate observation text for a given distance
 * Combines 2-3 phrases for natural, varied output
 */
export function generateObservationText(distance: 'near' | 'mid' | 'far'): string {
    const templates = OBSERVATION_TEMPLATES[distance];
    const count = 2 + Math.floor(Math.random() * 2); // 2-3 phrases
    const shuffled = [...templates].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);
    return selected.join('。') + '。';
}

/**
 * Get all observation templates (for offline generation)
 */
export function getObservationTemplates() {
    return OBSERVATION_TEMPLATES;
}

/**
 * Default node labels per requirements
 */
export const DEFAULT_LABELS = [
    '家族',
    '友達',
    '職場',
    '最近よく見かける人',
];
