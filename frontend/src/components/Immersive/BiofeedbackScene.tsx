/**
 * BiofeedbackScene.tsx
 * 
 * 主沉浸式场景容器
 * 集成 WebXR 和 R3F
 */

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, createXRStore } from '@react-three/xr';
import { OrbitControls, Html } from '@react-three/drei';
import { ForestEnvironment } from './ForestEnvironment';
import { BreathingGuide3D } from './BreathingGuide3D';
import { useImmersiveBiofeedback } from '../../hooks/useImmersiveBiofeedback';

interface BiofeedbackSceneProps {
    hrv: number;
    onExit: () => void;
}

const store = createXRStore();

export const BiofeedbackScene: React.FC<BiofeedbackSceneProps> = ({
    hrv,
    onExit
}) => {
    // 使用Hook获取反馈参数
    const bioState = useImmersiveBiofeedback(hrv);

    return (
        <div className="w-full h-screen fixed top-0 left-0 z-50 bg-black">
            {/* UI Overlay */}
            <div className="absolute top-4 left-4 z-50 flex gap-4">
                <button
                    onClick={onExit}
                    className="px-4 py-2 bg-white/20 backdrop-blur rounded-lg text-white hover:bg-white/30"
                >
                    退出沉浸模式
                </button>
                <div className="px-4 py-2 bg-black/40 backdrop-blur rounded-lg text-white text-sm">
                    HRV: {Math.round(hrv)} ms | 状态: {bioState.stressLevel > 0.6 ? '紧张' : '平静'}
                </div>
                <button
                    onClick={() => store.enterVR()}
                    className="px-4 py-2 bg-primary-500 rounded-lg text-white hover:bg-primary-600"
                >
                    进入 VR 模式
                </button>
            </div>

            <Canvas>
                <XR store={store}>
                    <Suspense fallback={<Html center>Loading 3D Environment...</Html>}>
                        <ForestEnvironment
                            windIntensity={bioState.windIntensity}
                            lightWarmth={bioState.lightWarmth}
                            particleSpeed={bioState.particleSpeed}
                        />
                        <BreathingGuide3D
                            phase={bioState.breathingPhase}
                            isInhaling={bioState.isInhaling}
                        />
                        <OrbitControls enableZoom={true} enablePan={false} />
                    </Suspense>
                </XR>
            </Canvas>
        </div>
    );
};
