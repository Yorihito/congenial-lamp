import React, { useState } from 'react';
import './OnboardingFlow.css';

interface OnboardingFlowProps {
    onComplete: (useFacebook: boolean) => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
    const [step, setStep] = useState(0);

    const handleFacebookConnect = () => {
        // Facebook OAuth flow will be triggered here
        onComplete(true);
    };

    const handleSkip = () => {
        onComplete(false);
    };

    return (
        <div className="onboarding-container">
            <div className="onboarding-content animate-fade-in">
                {step === 0 && (
                    <>
                        <div className="onboarding-logo">
                            <span className="logo-icon">🗺️</span>
                        </div>

                        <h1 className="onboarding-title">心の距離マップ</h1>

                        <p className="onboarding-subtitle">
                            最近の関わり方の気配から、距離を配置します。
                        </p>

                        <div className="onboarding-features">
                            <div className="feature-item">
                                <span className="feature-icon">✨</span>
                                <span>あなたの人間関係を地図として可視化</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">🔒</span>
                                <span>投稿内容やメッセージは取得しません</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">📱</span>
                                <span>スクショで簡単にシェア</span>
                            </div>
                        </div>

                        <button
                            className="onboarding-btn primary"
                            onClick={() => setStep(1)}
                        >
                            はじめる
                        </button>
                    </>
                )}

                {step === 1 && (
                    <>
                        <div className="onboarding-logo">
                            <span className="logo-icon">🔗</span>
                        </div>

                        <h2 className="onboarding-title">Facebookと連携</h2>

                        <p className="onboarding-description">
                            Facebookと連携すると、最近のアクティビティを参考にマップを生成します。
                        </p>

                        <div className="privacy-notice">
                            <p>🔒 プライバシー保護</p>
                            <ul>
                                <li>投稿内容は取得しません</li>
                                <li>メッセージは取得しません</li>
                                <li>友達の名前は表示されません</li>
                            </ul>
                        </div>

                        <button
                            className="onboarding-btn facebook"
                            onClick={handleFacebookConnect}
                        >
                            <svg className="facebook-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            Facebookで連携
                        </button>

                        <button className="onboarding-btn secondary" onClick={handleSkip}>
                            連携せずに試す
                        </button>

                        <p className="skip-hint">
                            後から設定で連携することもできます
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default OnboardingFlow;
