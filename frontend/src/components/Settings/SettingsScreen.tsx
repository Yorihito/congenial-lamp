import React, { useState, useEffect } from 'react';
import type { UserPreferences } from '../../types/user';
import { DEFAULT_USER_PREFERENCES } from '../../types/user';
import { getPreferences, savePreferences, clearAllData } from '../../services/storage';
import './SettingsScreen.css';

interface SettingsScreenProps {
    onClose: () => void;
    facebookConnected: boolean;
    onFacebookDisconnect?: () => void;
    onFacebookConnect?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
    onClose,
    facebookConnected,
    onFacebookDisconnect,
    onFacebookConnect,
}) => {
    const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_USER_PREFERENCES);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {
        const prefs = await getPreferences();
        setPreferences(prefs);
    };

    const handlePreferenceChange = async <K extends keyof UserPreferences>(
        key: K,
        value: UserPreferences[K]
    ) => {
        const newPrefs = { ...preferences, [key]: value };
        setPreferences(newPrefs);
        await savePreferences(newPrefs);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleDeleteData = async () => {
        await clearAllData();
        setShowDeleteConfirm(false);
        window.location.reload();
    };

    return (
        <div className="settings-overlay" onClick={onClose}>
            <div className="settings-panel animate-fade-in" onClick={(e) => e.stopPropagation()}>
                <div className="settings-header">
                    <h2>設定</h2>
                    <button className="settings-close" onClick={onClose}>×</button>
                </div>

                <div className="settings-content">
                    {/* Facebook Connection */}
                    <div className="settings-section">
                        <h3>Facebook連携</h3>
                        <div className="setting-item">
                            <div className="setting-info">
                                <span className="setting-label">連携状態</span>
                                <span className={`status-badge ${facebookConnected ? 'connected' : 'disconnected'}`}>
                                    {facebookConnected ? '連携中' : '未連携'}
                                </span>
                            </div>
                            {facebookConnected ? (
                                <button className="setting-action danger" onClick={onFacebookDisconnect}>
                                    連携を解除
                                </button>
                            ) : (
                                <button className="setting-action primary" onClick={onFacebookConnect}>
                                    連携する
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Display Settings */}
                    <div className="settings-section">
                        <h3>表示設定</h3>

                        <div className="setting-item">
                            <span className="setting-label">最大ノード数</span>
                            <div className="setting-options">
                                {([6, 9, 12] as const).map((n) => (
                                    <button
                                        key={n}
                                        className={`option-btn ${preferences.maxNodes === n ? 'active' : ''}`}
                                        onClick={() => handlePreferenceChange('maxNodes', n)}
                                    >
                                        {n}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="setting-item">
                            <span className="setting-label">更新頻度</span>
                            <div className="setting-options">
                                {([
                                    { value: 'startup' as const, label: '起動時' },
                                    { value: 'daily' as const, label: '1日1回' },
                                    { value: 'manual' as const, label: '手動' },
                                ]).map(({ value, label }) => (
                                    <button
                                        key={value}
                                        className={`option-btn ${preferences.updateFrequency === value ? 'active' : ''}`}
                                        onClick={() => handlePreferenceChange('updateFrequency', value)}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="setting-item">
                            <span className="setting-label">表示モード</span>
                            <div className="setting-options">
                                {([
                                    { value: 'minimal' as const, label: 'ミニマル' },
                                    { value: 'label_emphasis' as const, label: 'ラベル強調' },
                                ]).map(({ value, label }) => (
                                    <button
                                        key={value}
                                        className={`option-btn ${preferences.displayMode === value ? 'active' : ''}`}
                                        onClick={() => handlePreferenceChange('displayMode', value)}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Data Management */}
                    <div className="settings-section">
                        <h3>データ管理</h3>
                        <div className="setting-item">
                            <div className="setting-info">
                                <span className="setting-label">ローカルデータ削除</span>
                                <span className="setting-hint">端末に保存されたデータを削除します</span>
                            </div>
                            <button
                                className="setting-action danger"
                                onClick={() => setShowDeleteConfirm(true)}
                            >
                                削除
                            </button>
                        </div>
                    </div>

                    {/* About */}
                    <div className="settings-section">
                        <h3>アプリについて</h3>
                        <div className="about-info">
                            <p>心の距離マップ v1.0.0</p>
                            <p className="text-muted">© 2026 Koro Map</p>
                        </div>
                    </div>
                </div>

                {saved && (
                    <div className="save-toast">✓ 保存しました</div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div className="confirm-overlay">
                        <div className="confirm-dialog">
                            <h3>データを削除しますか？</h3>
                            <p>すべてのローカルデータが削除されます。この操作は取り消せません。</p>
                            <div className="confirm-actions">
                                <button onClick={() => setShowDeleteConfirm(false)}>キャンセル</button>
                                <button className="danger" onClick={handleDeleteData}>削除する</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SettingsScreen;
