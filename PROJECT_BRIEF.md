# NeuraSense - AI 智能心理健康评估平台 完整项目介绍

## 一、项目概述

NeuraSense 是一个 AI 驱动的心理健康评估与干预平台，集成了标准化心理量表、AI 对话咨询、多模态生物信号采集（面部、语音、眼动、击键）、知识图谱推理和自适应干预系统。

- **线上地址**: https://neurasense.cc/
- **前端部署**: Vercel
- **后端部署**: Render
- **数据库**: Supabase (PostgreSQL)
- **GitHub**: https://github.com/Goodman667/NeuraSense

---

## 二、技术栈

### 前端
| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19.2.0 | UI 框架 |
| TypeScript | 5.6.2 | 类型安全 |
| Vite | 5.4.10 | 构建工具 |
| Zustand | 4.4.7 | 状态管理 |
| TailwindCSS | 3.4.0 | 样式 |
| Three.js + React Three Fiber | 0.182.0 / 9.4.2 | 3D 可视化（呼吸球） |
| React Three XR | 6.6.28 | WebXR 沉浸式场景 |
| Pixi.js + pixi-live2d-display | 6.5.10 / 0.4.0 | Live2D 虚拟形象 |
| Framer Motion | 12.23.26 | 动画 |
| Recharts | 2.12.7 | 数据图表 |
| MediaPipe Face Mesh | 0.4.x | 面部关键点检测（眼动追踪） |

### 后端
| 技术 | 版本 | 用途 |
|------|------|------|
| FastAPI | 0.124.4 | Web 框架 |
| Uvicorn | 0.38.0 | ASGI 服务器 |
| Python | 3.11+ | 运行时 |
| SQLAlchemy + AsyncPG | 2.0.23 / 0.29.0 | ORM |
| Neo4j | 6.0.3 | 知识图谱 |
| Redis | 5.0.1 | 缓存 |
| ZhipuAI (GLM-4) | 2.1.5 | LLM 对话/评估 |
| Google Generative AI | 0.8.5 | LLM 备选 |
| scikit-learn | 1.8.0 | 预测模型 |
| NumPy / SciPy | 2.3.5 / 1.16.3 | 科学计算 |
| OpenCV | 4.11.0 | 图像处理（画钟测验） |
| Edge-TTS | 7.2.7 | 文字转语音 |
| ReportLab | 4.4.6 | PDF 报告生成 |

---

## 三、项目目录结构

```
NeuraSense-main/
├── frontend/
│   └── src/
│       ├── App.tsx                          # 主应用（路由、页面状态管理、Stroop 测试内联）
│       ├── config/api.ts                    # API 基础 URL 配置
│       ├── i18n/                            # 国际化（中/英文切换）
│       ├── store/
│       │   ├── useAppStore.ts               # 用户认证、评估历史、绘画状态
│       │   └── useGamificationStore.ts      # 徽章、积分、连续打卡
│       ├── hooks/
│       │   ├── useBioSignalAggregator.ts    # 多模态生物信号聚合
│       │   ├── useOculometricSensor.ts      # MediaPipe 眼动追踪（EAR、PERCLOS、眨眼检测）
│       │   ├── useVoiceAnalyzer.ts          # 语音特征提取（pitch、jitter、shimmer）
│       │   ├── useKeystrokeDynamics.ts      # 击键动力学
│       │   ├── useJITAI.ts                  # 即时自适应干预 hook
│       │   ├── useHealthConnect.ts          # 健康数据连接
│       │   └── useDigitalPhenotyping.ts     # 数字表型特征提取
│       └── components/
│           ├── Dashboard/Dashboard.tsx       # 主面板（心情打卡、历史记录、快捷入口）
│           ├── Assessment/
│           │   ├── PHQ9Scale.tsx             # 抑郁量表-9项（完整评分+AI解读）
│           │   ├── GAD7Scale.tsx             # 焦虑量表-7项
│           │   ├── PSSScale.tsx              # 压力知觉量表-10项
│           │   ├── SASScale.tsx              # 焦虑自评量表
│           │   ├── SDSScale.tsx              # 抑郁自评量表
│           │   ├── ScaleSelector.tsx         # 量表选择器
│           │   └── PDFDownloadButton.tsx     # PDF 导出
│           ├── Chat/PsyChat.tsx             # AI 心理咨询对话（语音输入+TTS+表情标注）
│           ├── Auth/AuthModal.tsx            # 登录/注册（JWT + 微信 OAuth 桩）
│           ├── 3D/BreathingBall3D.tsx        # 3D 粒子呼吸球（Fibonacci 分布+呼吸引导）
│           ├── VirtualAvatar/VirtualAvatar.tsx  # Live2D 虚拟形象（唇同步+眼动跟踪）
│           ├── EmotionDetector/EmotionDetector.tsx  # 面部情绪检测（⚠️ 模拟数据非真实 ML）
│           ├── VoiceAnalyzerMonitor/         # 语音分析监控面板
│           ├── OculometricMonitor/           # 眼动监控面板
│           ├── BioSignalPanel/BioSignalAIPanel.tsx  # 多模态生物信号 AI 分析面板
│           ├── CognitiveGame/StroopTest.tsx  # Stroop 色词测试
│           ├── CognitiveTest/CognitiveTestPanel.tsx # 认知测试面板
│           ├── DrawingCanvas/DrawingCanvas.tsx  # 画钟测验画布
│           ├── Community/
│           │   ├── CommunityFeed.tsx         # 社区动态（发帖/回复/点赞）
│           │   ├── CommunityLeaderboard.tsx  # 排行榜
│           │   └── PrivateMessage.tsx        # 私信
│           ├── Gamification/AchievementCenter.tsx  # 成就系统
│           ├── Journal/MoodJournal.tsx       # 心情日记
│           ├── EMA/EMACheckIn.tsx            # 生态瞬时评估签到
│           ├── JITAI/
│           │   ├── GuardianCard.tsx          # 守护卡片
│           │   └── InterventionModal.tsx     # 干预弹窗
│           ├── Crisis/CrisisPanel.tsx        # 危机干预面板（⚠️ 基本空壳）
│           ├── Immersive/
│           │   ├── BiofeedbackScene.tsx      # WebXR 沉浸式生物反馈
│           │   ├── ForestEnvironment.tsx     # 3D 森林环境
│           │   └── BreathingGuide3D.tsx      # 3D 呼吸引导
│           ├── Visualization/
│           │   ├── EmotionRadarChart.tsx     # 情绪雷达图
│           │   ├── PredictionTrendChart.tsx  # 预测趋势图
│           │   └── VoiceSpectrogram.tsx      # 语音频谱图
│           ├── Phenotyping/PhysiologicalInsights.tsx  # 生理洞察
│           ├── Report/DualModalityReport.tsx # 双模态报告
│           └── UI/ThemeToggle.tsx            # 主题切换
│
├── backend/
│   └── app/
│       ├── main.py                          # FastAPI 应用入口 + CORS
│       ├── api/__init__.py                  # 路由总集成（1041行，所有端点）
│       ├── api/
│       │   ├── prediction_router.py         # 趋势预测
│       │   ├── validation_router.py         # 评估验证
│       │   ├── wechat_auth_router.py        # 微信认证
│       │   ├── journal_router.py            # 心情日记
│       │   ├── ema_router.py                # 生态瞬时评估
│       │   ├── community_router.py          # 社区功能
│       │   ├── jitai_router.py              # JITAI 干预
│       │   └── phenotyping_router.py        # 数字表型
│       └── services/
│           ├── llm/counselor.py             # AI 咨询师（ZhipuAI GLM-4 集成）
│           ├── assessment/stealth_phq9.py   # 隐性 PHQ-9 评估（双角色 CoT prompt）
│           ├── chat/unified_chat.py         # 统一聊天服务（asyncio.gather 并行处理）
│           ├── emotion/fusion.py            # 多模态情感融合（文本+语音→风险分级）
│           ├── knowledge/
│           │   ├── graph_rag.py             # GraphRAG 知识检索
│           │   ├── graph_service.py         # Neo4j 图服务
│           │   └── clinical_logic.py        # 临床推理引擎（加权路径推理）
│           ├── prediction/trend_predictor.py  # ML 趋势预测（RandomForest + LinearRegression）
│           ├── phenotyping/
│           │   ├── feature_engine.py        # 数字表型特征提取
│           │   └── predictor.py             # 表型预测（⚠️ 在随机数据上训练）
│           ├── memory/vector_store.py       # 向量记忆存储（⚠️ hash 伪 embedding）
│           ├── jitai/engine.py              # JITAI 引擎（规则引擎，6维脆弱性评分）
│           ├── scoring/clock_scorer.py      # 画钟测验评分
│           ├── tts/tts_service.py           # TTS 语音合成（Edge-TTS）
│           ├── report/pdf_service.py        # PDF 报告生成
│           ├── auth/auth_service.py         # 用户认证
│           ├── auth/wechat_oauth.py         # 微信 OAuth
│           ├── database/supabase_client.py  # Supabase 连接（仅连接器）
│           └── validation/dual_modality.py  # 双模态验证
└── docker-compose.yml                       # Docker 编排
```

---

## 四、已实现的 API 端点

```
GET  /api/v1/assessments                         # 量表列表
POST /api/v1/assessments/cdt/score               # 画钟测验评分
POST /api/v1/emotion/analyze                     # 多模态情感分析
POST /api/v1/knowledge/symptoms                  # 症状→疾病查询
POST /api/v1/counselor/chat                      # AI 咨询师对话
GET  /api/v1/counselor/prompt                    # 获取咨询师 prompt

POST /api/v1/assessment/stealth/chat             # 隐性 PHQ-9 对话评估
GET  /api/v1/assessment/stealth/{id}/summary     # 获取隐性评估结果
DELETE /api/v1/assessment/stealth/{id}           # 重置评估会话

POST /api/v1/graph/symptoms                      # 更新症状图谱
POST /api/v1/graph/biomarkers                    # 更新生物标记
GET  /api/v1/graph/inference/{user_id}           # 疾病推理（GraphRAG）
GET  /api/v1/graph/paths/{symptom}               # 症状路径查询
POST /api/v1/graph/initialize                    # 初始化图谱 Schema

POST /api/v1/chat                                # 统一聊天（消息+生物信号→回复+Avatar指令）
POST /api/v1/tts                                 # 文字转语音
GET  /api/v1/tts/voices                          # 可用语音列表

POST /api/v1/auth/register                       # 注册
POST /api/v1/auth/login                          # 登录
POST /api/v1/auth/logout                         # 登出
GET  /api/v1/auth/me                             # 获取当前用户

POST /api/v1/history/save                        # 保存评估记录
GET  /api/v1/history                             # 获取评估历史
POST /api/v1/report/pdf                          # 生成 PDF 报告
POST /api/v1/biosignal/analyze                   # 多模态生物信号 AI 分析

# 子路由（prediction、validation、journal、ema、community、jitai、phenotyping 各自独立路由）
```

---

## 五、各模块实现状态（诚实评估）

### 完整实现（可用）
| 模块 | 说明 |
|------|------|
| 心理量表 PHQ-9/GAD-7/PSS/SAS/SDS | 完整的多步骤 UI + 评分 + AI 解读 + PDF 导出 |
| AI 咨询对话 PsyChat | 语音输入(Web Speech API) + TTS + 情绪标注 + 快捷建议 |
| 隐性 PHQ-9 评估 | 双角色 CoT prompt，LLM 同时扮演咨询师和评估员，Trie 危机检测 |
| 3D 呼吸球 | React Three Fiber 粒子动画，Fibonacci 球面分布，4 阶段呼吸引导 |
| 画钟测验 | Canvas 绘画 + OpenCV 评分 |
| Dashboard | 心情打卡、评估历史、健康指标、每日建议 |
| 用户认证 | 注册/登录/JWT token |
| 社区功能 | 发帖/回复/点赞/分类 |
| 成就系统 | 徽章/积分/连续打卡 |
| 眼动 Hook | MediaPipe Face Mesh 真实实现，EAR 算法、PERCLOS、眨眼状态机 |
| 临床推理引擎 | Neo4j 加权路径推理：Score(D) = Σ Weight(s→D) × Severity(s) |
| 趋势预测 | RandomForest + LinearRegression 集成学习，7 天预测+置信区间 |
| JITAI 引擎 | 6 维脆弱性评分 + 规则干预选择（呼吸、CBT、感恩、社区） |
| TTS | Edge-TTS 中文语音合成，4 种声音+5 种情绪 |
| PDF 报告 | ReportLab 生成评估报告 |

### 部分实现 / 简化版
| 模块 | 现状 | 问题 |
|------|------|------|
| 情绪检测 EmotionDetector | 有摄像头接入，有 UI，但核心检测是**加权随机模拟** | 注释写 "In production, this would use face-api.js or TensorFlow.js" |
| 情感融合 emotion/fusion.py | 文本分析是**关键词匹配**，语音分析是**硬编码阈值** | 无真正的 NLP/ML 模型 |
| 向量记忆 vector_store.py | 用字符级 hash 生成伪 embedding + JSON 文件存储 | 非真正的 sentence-transformer |
| 数字表型预测 predictor.py | RandomForest 在**随机合成数据**上训练，7 天趋势是均值回归+高斯噪声 | 预测结果无意义 |
| 知识图谱知识量 | 仅 3 个疾病（MDD、GAD、甲减），9 个症状，权重静态硬编码 | 远不够覆盖 DSM-5 |
| 语音分析 hook | 有 pitch/jitter/shimmer 结构，AudioWorklet 不完整 | 半成品 |
| 危机面板 CrisisPanel | 组件存在但基本空壳 | 无实质功能 |
| 数据库操作 | supabase_client.py 仅是连接器 | 无 CRUD 逻辑 |

### 未实现 / 缺失
| 功能 | 说明 |
|------|------|
| Landing Page / 首页 | 没有，直接进 Dashboard |
| 用户 Onboarding 引导 | 无新用户引导流程 |
| 深色模式 | ThemeToggle 组件存在但未真正实现 |
| 个人资料/设置页 | 无 |
| 通知系统 | 无 |
| 数据导出/隐私控制 | 无 |
| 多语言完整支持 | i18n 框架在但翻译不完整 |
| 真实移动端适配 | 基本响应式但未针对手机优化 |

---

## 六、核心数据流

```
用户消息 + 生物信号（眼动/语音/面部/击键）
         │
         ▼
  POST /api/v1/chat (unified_chat.py)
         │
         ├──→ asyncio.gather 并行执行:
         │     ├── LLM 隐性 PHQ-9 评估 (stealth_phq9.py)
         │     ├── Neo4j 图谱推理 (clinical_logic.py)
         │     └── 情感融合分析 (fusion.py)
         │
         ▼
  聚合结果 → 生成回复文本 + Avatar 控制指令
         │
         ▼
  前端渲染: AI 回复 + 虚拟形象动作 + 呼吸引导参数
```

---

## 七、部署架构

```
用户浏览器
    │
    ├── 前端 (Vercel) ──→ React SPA
    │         │
    │         ▼
    └── 后端 (Render) ──→ FastAPI
              │
              ├── Supabase (PostgreSQL) ── 用户数据、评估历史
              ├── Neo4j ── 知识图谱（当前 Render 上可能未部署）
              ├── Redis ── 缓存（当前 Render 上可能未部署）
              └── ZhipuAI API ── GLM-4 大模型
```

---

## 八、我的优化目标

**核心诉求：把项目做到能上架的水平，功能需要全面且有深度。**

当前问题：
1. 功能数量不够多——缺少很多心理健康 App 该有的功能
2. 已有功能很多是简化版/模拟的——不够"真"
3. 没有完整的用户旅程——缺少首页、引导、设置等基础页面
4. 数据可视化和报告不够丰富
5. 缺少很多专业心理学功能

**希望达到的效果：**
- 对标市面上的专业心理健康 App（如 Calm、Headspace、壹心理、简单心理）
- 但有 AI 技术的差异化优势（多模态分析、隐性评估、知识图谱推理）
- 功能全面：评估、干预、追踪、社区、教育全覆盖
- 每个功能有足够深度，不是摆设

---

## 九、技术约束

- 前端：React 19 + TypeScript + Vite + TailwindCSS（已确定，不换框架）
- 后端：FastAPI + Python（已确定，不换框架）
- 数据库：Supabase PostgreSQL（主库）、Neo4j（图谱）、Redis（缓存）
- LLM：ZhipuAI GLM-4（主力）、Google Generative AI（备选）
- 部署：Vercel（前端）+ Render（后端）
- 不需要考虑安全合规问题（开发阶段）
- 前后端分离架构，通过 REST API 通信
