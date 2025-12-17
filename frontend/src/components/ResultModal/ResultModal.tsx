/**
 * ResultModal Component
 * 
 * Displays assessment results in a beautiful modal with Chinese text.
 * 用于显示评估结果的美观中文模态框
 */

import { useEffect, useRef } from 'react';

export interface AssessmentResult {
    total_score: number;
    max_score?: number;
    feedback: string[];
    details?: {
        roundness?: number | null;
        hands_angle?: number | null;
        number_count?: number | null;
    };
    clock_face_score?: number;
    clock_hands_score?: number;
    numbers_score?: number;
}

export interface ResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    result: AssessmentResult | null;
    title?: string;
}

export const ResultModal = ({
    isOpen,
    onClose,
    result,
    title = '评估结果'
}: ResultModalProps) => {
    const modalRef = useRef<HTMLDivElement>(null);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    // Click outside to close
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen || !result) return null;

    // Calculate score percentage
    const maxScore = result.max_score ?? 3;
    const scorePercentage = (result.total_score / maxScore) * 100;

    // Determine score color
    const getScoreColor = () => {
        if (scorePercentage >= 80) return 'text-green-500';
        if (scorePercentage >= 50) return 'text-yellow-500';
        return 'text-orange-500';
    };

    // Get score description
    const getScoreDescription = () => {
        if (scorePercentage >= 80) return '表现优秀！';
        if (scorePercentage >= 50) return '表现良好';
        return '仍有提升空间';
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
            onClick={handleBackdropClick}
        >
            <div
                ref={modalRef}
                className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-slideUp"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-primary-400 via-accent-400 to-warm-300 p-6 text-white">
                    <h2 className="text-2xl font-bold text-center">{title}</h2>
                    <p className="text-center text-white/80 mt-1">{getScoreDescription()}</p>
                </div>

                {/* Score Circle */}
                <div className="flex justify-center -mt-10">
                    <div className="relative w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center">
                        <div className={`text-3xl font-bold ${getScoreColor()}`}>
                            {result.total_score}
                            <span className="text-lg text-warm-400">/{maxScore}</span>
                        </div>
                        {/* Circular progress */}
                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <circle
                                cx="48"
                                cy="48"
                                r="44"
                                fill="none"
                                stroke="#f3f4f6"
                                strokeWidth="6"
                            />
                            <circle
                                cx="48"
                                cy="48"
                                r="44"
                                fill="none"
                                stroke="url(#gradient)"
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeDasharray={`${scorePercentage * 2.76} 276`}
                            />
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#a78bfa" />
                                    <stop offset="100%" stopColor="#fbbf24" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Individual Scores */}
                    {(result.clock_face_score !== undefined) && (
                        <div className="grid grid-cols-3 gap-3">
                            <div className="text-center p-3 bg-warm-50 rounded-xl">
                                <div className={`text-xl font-bold ${result.clock_face_score ? 'text-green-500' : 'text-warm-400'}`}>
                                    {result.clock_face_score ? '✓' : '✗'}
                                </div>
                                <div className="text-sm text-warm-600 mt-1">表盘</div>
                            </div>
                            <div className="text-center p-3 bg-warm-50 rounded-xl">
                                <div className={`text-xl font-bold ${result.clock_hands_score ? 'text-green-500' : 'text-warm-400'}`}>
                                    {result.clock_hands_score ? '✓' : '✗'}
                                </div>
                                <div className="text-sm text-warm-600 mt-1">指针</div>
                            </div>
                            <div className="text-center p-3 bg-warm-50 rounded-xl">
                                <div className={`text-xl font-bold ${result.numbers_score ? 'text-green-500' : 'text-warm-400'}`}>
                                    {result.numbers_score ? '✓' : '✗'}
                                </div>
                                <div className="text-sm text-warm-600 mt-1">数字</div>
                            </div>
                        </div>
                    )}

                    {/* Feedback */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium text-warm-500 uppercase tracking-wide">详细反馈</h3>
                        <ul className="space-y-2">
                            {result.feedback.map((item, index) => (
                                <li
                                    key={index}
                                    className="flex items-start space-x-2 text-warm-700 text-sm"
                                >
                                    <span className="text-primary-500 mt-0.5">•</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Technical Details (if available) */}
                    {result.details && (
                        <div className="pt-3 border-t border-warm-100">
                            <h3 className="text-xs font-medium text-warm-400 uppercase tracking-wide mb-2">技术指标</h3>
                            <div className="grid grid-cols-3 gap-2 text-xs text-warm-500">
                                {result.details.roundness != null && (
                                    <div>
                                        <span className="text-warm-400">圆度: </span>
                                        <span className="font-medium">{(result.details.roundness * 100).toFixed(0)}%</span>
                                    </div>
                                )}
                                {result.details.hands_angle != null && (
                                    <div>
                                        <span className="text-warm-400">夹角: </span>
                                        <span className="font-medium">{result.details.hands_angle.toFixed(1)}°</span>
                                    </div>
                                )}
                                {result.details.number_count != null && (
                                    <div>
                                        <span className="text-warm-400">数字: </span>
                                        <span className="font-medium">{result.details.number_count}个</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 pb-6">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-medium hover:from-primary-600 hover:to-accent-600 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        我知道了
                    </button>
                </div>

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

ResultModal.displayName = 'ResultModal';
