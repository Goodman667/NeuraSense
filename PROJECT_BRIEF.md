# NeuraSense - AI 智能心理健康平台 完整项目介绍

> **本文件用于：AI 工具快速熟悉项目 / 论文背景素材**
> 最后更新：2026 年 2 月

---

## 一、项目概述

NeuraSense 是一个面向普通用户的 AI 心理健康管理 Web 应用（PWA），集成了 AI 对话咨询、标准化心理量表评估、多模态生物信号监测、JITAI 即时适应干预、Live2D 虚拟陪伴、结构化疗愈课程和社区互动，构成完整的心理健康管理闭环。

- **线上地址**：https://neurasense.cc/
- **前端部署**：Vercel（静态 CDN）
- **后端部署**：Render（FastAPI + Uvicorn）
- **API 文档**：https://api.neurasense.cc/docs
- **数据库**：Supabase (PostgreSQL)
- **GitHub**：https://github.com/Goodman667/NeuraSense

---

## 二、技术栈（含版本）

### 前端
| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19.x | UI 框架（函数组件 + Hooks） |
| TypeScript | 5.6.2 | 类型安全 |
| Vite | 6.x | 构建工具 |
| Zustand | 4.4.7 | 全局状态管理（用户/游戏化/onboarding） |
| TailwindCSS | 3.4.0 | 原子化样式（warm/primary/calm 自定义色系） |
| Three.js + React Three Fiber | ~0.182 / ~9.4 | 3D 沉浸场景（呼吸球、生物反馈森林） |
| Pixi.js + pixi-live2d-display | 6.5.10 / 0.4.0 | Live2D 虚拟 Avatar（Kei 模型） |
| Recharts | 2.12.7 | 数据图表（PHQ-9 趋势、情绪雷达图） |
| MediaPipe Face Mesh | 0.4.x | 眼动追踪（EAR 算法、PERCLOS） |
| vite-plugin-pwa + Workbox | — | PWA / Service Worker / 离线缓存 |
| Framer Motion | 12.x | 动画 |

### 后端
| 技术 | 版本 | 用途 |
|------|------|------|
| FastAPI | 0.124.4 | Web 框架（异步，DDD 架构） |
| Uvicorn | 0.38.0 | ASGI 服务器 |
| Python | 3.11+ | 运行时 |
| Supabase Python SDK | — | 主数据库操作（PostgreSQL） |
| Neo4j | 6.0.3 | 知识图谱（可选，有规则引擎兜底） |
| ZhipuAI SDK (GLM-4-Flash) | 2.1.5 | LLM 对话/评估/解读（免费 API） |
| scikit-learn | 1.8.0 | 趋势预测（RandomForest + LinearRegression） |
| NumPy / SciPy | 2.3.5 / 1.16.3 | 科学计算 |
| OpenCV | 4.11.0 | 画钟测验图像评分 |
| Edge-TTS | 7.2.7 | 中文语音合成（Microsoft） |
| ReportLab | 4.4.6 | PDF 评估报告生成 |

---

## 三、项目目录结构

```
NeuraSense-main/
├── frontend/
│   ├── src/
│   │   ├── App.tsx                      # 主入口：路由（landing/onboarding/main）+ 全局状态
│   │   │                                # 内联 StroopTestView / KeystrokeAnalysisView /
│   │   │                                # TrendPredictionView / BreathingBallView
│   │   ├── config/api.ts                # API_BASE 环境变量 (VITE_API_BASE)
│   │   ├── layouts/TabBar.tsx           # 底部导航（今日/聊天/工具箱/课程/我的）
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx          # 落地页（暗色主题 slate-900→indigo-950）
│   │   │   ├── OnboardingWizard.tsx     # 新用户多步引导（个人信息+目标+偏好）
│   │   │   ├── TodayPage.tsx            # 今日：情绪打卡滑块+任务+趋势图+日报
│   │   │   ├── ToolboxPage.tsx          # 工具箱：分类工具卡片+快捷入口
│   │   │   ├── ProgramsPage.tsx         # 疗愈课程：按天解锁课时+视频+工具
│   │   │   ├── MePage.tsx               # 个人中心：头像+统计+菜单
│   │   │   ├── AssessmentCenterPage.tsx # 量表评估中心入口页
│   │   │   ├── SettingsPage.tsx         # 账号设置（用户名/密码/通知）
│   │   │   ├── MessageCenterPage.tsx    # 消息中心
│   │   │   └── ToolRunner.tsx           # 工具运行器（统一容器页面）
│   │   ├── components/
│   │   │   ├── LazyErrorBoundary.tsx    # React 类组件错误边界（防动态导入失败白屏）
│   │   │   ├── PWAInstallPrompt.tsx     # PWA 安装引导横幅（Android+iOS，7天记住关闭）
│   │   │   ├── PageSkeleton.tsx         # 各 Tab 骨架屏（loading 占位）
│   │   │   ├── Auth/AuthModal.tsx       # 登录/注册弹窗（JWT + 微信 OAuth）
│   │   │   ├── Chat/PsyChat.tsx         # AI 咨询对话（语音输入+TTS+情绪标注+建议）
│   │   │   ├── Assessment/
│   │   │   │   ├── PHQ9Scale.tsx        # 抑郁量表（9题，27分制，完整评分+AI解读）
│   │   │   │   ├── GAD7Scale.tsx        # 焦虑量表（7题）
│   │   │   │   ├── PSSScale.tsx         # 压力知觉量表（10题）
│   │   │   │   ├── SASScale.tsx         # 焦虑自评量表（20题）
│   │   │   │   ├── SDSScale.tsx         # 抑郁自评量表（20题）
│   │   │   │   ├── ScaleSelector.tsx    # 量表选择器
│   │   │   │   ├── PDFDownloadButton.tsx # PDF 导出
│   │   │   │   └── MarkdownText.tsx     # AI 解读 Markdown 渲染
│   │   │   ├── JITAI/
│   │   │   │   ├── GuardianCard.tsx     # JITAI 状态守护卡片
│   │   │   │   └── InterventionModal.tsx # 干预弹窗（呼吸/CBT/正念/社区）
│   │   │   ├── VirtualAvatar/VirtualAvatar.tsx  # Live2D 虚拟形象（唇同步+眼动追踪）
│   │   │   ├── EmbodiedAvatar/EmbodiedAvatar.tsx # Three.js 3D 呼吸引导球
│   │   │   ├── BioSignalPanel/BioSignalAIPanel.tsx # 多模态生物信号 AI 分析面板
│   │   │   ├── Community/
│   │   │   │   ├── CommunityFeed.tsx    # 社区动态（发帖/回复/点赞）
│   │   │   │   ├── CommunityLeaderboard.tsx # 排行榜
│   │   │   │   └── PrivateMessage.tsx   # 私信
│   │   │   ├── Gamification/AchievementCenter.tsx  # 成就系统（徽章/积分/里程碑）
│   │   │   ├── Journal/MoodJournal.tsx  # 心情日记
│   │   │   ├── EMA/EMACheckIn.tsx       # 经验取样法签到
│   │   │   ├── DrawingCanvas/DrawingCanvas.tsx # 画钟测验画布
│   │   │   ├── Crisis/CrisisPanel.tsx   # 危机干预面板（热线电话）
│   │   │   ├── Immersive/
│   │   │   │   ├── BiofeedbackScene.tsx # Three.js 全屏生物反馈场景
│   │   │   │   ├── ForestEnvironment.tsx # 3D 森林环境
│   │   │   │   └── BreathingGuide3D.tsx # 3D 呼吸引导
│   │   │   ├── OculometricMonitor/OculometricMonitor.tsx # 眼动监控面板
│   │   │   ├── VoiceAnalyzerMonitor/VoiceAnalyzerMonitor.tsx # 语音分析监控面板
│   │   │   ├── EmotionDetector/EmotionDetector.tsx # 面部情绪（⚠️模拟，非真实ML）
│   │   │   ├── Visualization/
│   │   │   │   ├── EmotionRadarChart.tsx # 情绪雷达图
│   │   │   │   ├── PredictionTrendChart.tsx # 预测趋势图
│   │   │   │   └── VoiceSpectrogram.tsx  # 语音频谱图
│   │   │   ├── Phenotyping/PhysiologicalInsights.tsx # 生理洞察面板
│   │   │   ├── Report/DualModalityReport.tsx # 双模态报告
│   │   │   ├── Dashboard/               # 旧仪表盘组件（部分已迁移至 TodayPage）
│   │   │   └── UI/ThemeToggle.tsx       # 主题切换按钮
│   │   ├── hooks/
│   │   │   ├── useOculometricSensor.ts  # MediaPipe 眼动追踪（EAR、PERCLOS、眨眼状态机）
│   │   │   ├── useVoiceAnalyzer.ts      # 语音特征提取（Jitter/Shimmer/基频/语速）
│   │   │   ├── useKeystrokeDynamics.ts  # 击键动力学（焦虑指数/专注度/错误率）
│   │   │   ├── useBioSignalAggregator.ts # 多模态生物信号聚合（5秒窗口均值）
│   │   │   ├── useJITAI.ts              # JITAI 轮询 Hook（5分钟间隔触发检查）
│   │   │   ├── useHealthConnect.ts      # 健康数据接入（HRV、步数）
│   │   │   └── useDigitalPhenotyping.ts # 数字表型特征向量计算
│   │   └── store/
│   │       ├── index.ts                 # 主 Store（useAppStore：用户/错误/评估历史）
│   │       ├── useGamificationStore.ts  # 游戏化 Store（streak/积分/checkStreak）
│   │       └── useOnboardingStore.ts    # Onboarding 完成状态（服务端同步）
│   ├── public/
│   │   ├── models/kei/                  # Live2D Kei 模型文件（moc3+纹理+动作+音频）
│   │   ├── audio/voice-feature-processor.js # AudioWorklet 语音特征处理器
│   │   └── lib/live2dcubismcore.min.js  # Live2D SDK Core
│   ├── vite.config.ts                   # Vite：PWA 插件、分包策略（vendor/three/pixi分包）
│   ├── tailwind.config.js               # Tailwind 扩展主题（warm/primary/calm/storm 色系）
│   ├── .env.development                 # 开发环境：VITE_API_BASE=http://localhost:8000/api/v1
│   └── .env.production                  # 生产环境：VITE_API_BASE=https://api.neurasense.cc/api/v1
│
├── backend/
│   └── app/
│       ├── main.py                      # FastAPI 入口（CORS、路由挂载、启动种子数据同步）
│       ├── api/
│       │   ├── __init__.py              # 路由总集成（18 个子路由 + 核心端点实现）
│       │   ├── tools_router.py          # 工具条目 CRUD（对接 tool_items 表）
│       │   ├── programs_router.py       # 课程/课时（programs + program_days）
│       │   ├── checkin_router.py        # 每日情绪维度打卡
│       │   ├── assessments_router.py    # 量表结果存取（assessment_records）
│       │   ├── journal_router.py        # 心情日记（journal_entries）
│       │   ├── ema_router.py            # 经验取样记录（ema_records）
│       │   ├── jitai_router.py          # JITAI 干预触发与完成上报
│       │   ├── community_router.py      # 社区动态/私信（community_posts/messages）
│       │   ├── memory_router.py         # 对话记忆片段存取（user_memory）
│       │   ├── notifications_router.py  # 通知推送记录
│       │   ├── prediction_router.py     # 7天 PHQ-9 趋势预测
│       │   ├── phenotyping_router.py    # 数字表型特征存储
│       │   ├── validation_router.py     # 双模态一致性验证
│       │   ├── wechat_auth_router.py    # 微信 OAuth 2.0 登录
│       │   ├── profile_router.py        # 用户档案管理（onboarding_data）
│       │   └── exercises_router.py      # 练习完成记录
│       └── services/
│           ├── llm/                     # ZhipuAI GLM-4-Flash 封装（counselor + 通用对话）
│           ├── chat/                    # 统一对话服务（asyncio.gather 并行处理）
│           ├── assessment/stealth_phq9.py # 隐形 PHQ-9（双角色 CoT prompt + Trie 危机检测）
│           ├── scoring/clock_scorer.py  # 画钟测验：AI 视觉模型优先，OpenCV 兜底
│           ├── emotion/fusion.py        # 多模态情感融合（文本关键词+语音阈值→风险分级）
│           ├── jitai/engine.py          # JITAI 引擎（6维脆弱性评分+规则干预选择）
│           ├── knowledge/
│           │   ├── graph_service.py     # Neo4j 图服务
│           │   ├── clinical_logic.py    # 临床推理引擎（加权路径：Score(D)=ΣWeight×Severity）
│           │   └── graph_service.py     # GraphRAG 检索
│           ├── phenotyping/
│           │   ├── feature_engine.py    # 数字表型特征提取
│           │   └── predictor.py         # 表型预测（⚠️ 在随机合成数据训练，结果参考用）
│           ├── prediction/trend_predictor.py # RandomForest+LinearRegression 集成趋势预测
│           ├── database/supabase_client.py   # Supabase Python 客户端封装
│           ├── auth/
│           │   ├── auth_service.py      # JWT 认证 + 用户管理（Supabase）
│           │   └── wechat_oauth.py      # 微信 OAuth 2.0
│           ├── tts/tts_service.py       # Edge-TTS（4种声音+5种情绪语调）
│           ├── report/pdf_service.py    # ReportLab PDF 报告生成
│           └── validation/dual_modality.py  # 表情-语音一致性检测
│
├── backend/data/                        # 种子数据（JSON，启动时自动同步到 Supabase）
│   ├── tool_items_v2.json               # 工具箱条目初始数据
│   ├── programs.json                    # 课程元信息
│   ├── program_days.json                # 课时内容（含 video_url/video_title B站外链）
│   └── jitai_interventions.json        # JITAI 干预内容库
│
└── docker-compose.yml                   # 本地开发 Docker 编排（可选）
```

---

## 四、已实现的 API 端点

```
# ── 核心评估 ──────────────────────────────────────────────────
GET  /api/v1/assessments                         量表列表
POST /api/v1/assessments/cdt/score               画钟测验评分（AI优先+OpenCV兜底）
POST /api/v1/assessment/stealth/chat             隐形 PHQ-9 对话评估
GET  /api/v1/assessment/stealth/{id}/summary     获取隐形评估结果
DELETE /api/v1/assessment/stealth/{id}           重置评估会话

# ── 知识图谱 ──────────────────────────────────────────────────
POST /api/v1/graph/symptoms                      更新用户症状图
POST /api/v1/graph/biomarkers                    更新生物标记
GET  /api/v1/graph/inference/{user_id}           疾病推理（GraphRAG）
GET  /api/v1/graph/paths/{symptom}               N-hop 症状路径
POST /api/v1/graph/initialize                    初始化图谱 Schema

# ── 情感分析 ──────────────────────────────────────────────────
POST /api/v1/emotion/analyze                     多模态情感分析（文本+语音特征）
POST /api/v1/knowledge/symptoms                  症状→疾病知识查询
POST /api/v1/biosignal/analyze                   多模态生物信号 AI 综合分析

# ── 对话 ──────────────────────────────────────────────────────
POST /api/v1/chat                                统一对话（消息+生物信号→回复+Avatar指令）
POST /api/v1/counselor/chat                      AI 咨询师直接对话
GET  /api/v1/counselor/prompt                    获取咨询师 prompt 模板

# ── TTS ───────────────────────────────────────────────────────
POST /api/v1/tts                                 文字转语音（Edge-TTS）
GET  /api/v1/tts/voices                          可用声音+情绪列表

# ── 用户认证 ──────────────────────────────────────────────────
POST /api/v1/auth/register                       注册
POST /api/v1/auth/login                          登录（返回 JWT token）
POST /api/v1/auth/logout                         登出
GET  /api/v1/auth/me                             当前用户信息
GET  /api/v1/auth/wechat                         微信 OAuth 跳转
GET  /api/v1/auth/wechat/callback                微信 OAuth 回调

# ── 评估历史 ──────────────────────────────────────────────────
POST /api/v1/history/save                        保存量表评估记录
GET  /api/v1/history                             获取评估历史（支持 scale_type 过滤）
POST /api/v1/report/pdf                          生成 PDF 评估报告

# ── 子路由（独立文件） ────────────────────────────────────────
/api/v1/checkin/*                                每日情绪打卡
/api/v1/programs/*                               课程/课时 CRUD
/api/v1/tools/*                                  工具箱条目
/api/v1/journal/*                                心情日记
/api/v1/ema/*                                    经验取样记录
/api/v1/community/*                              社区动态/私信
/api/v1/jitai/*                                  JITAI 干预触发/完成
/api/v1/phenotyping/*                            数字表型存储
/api/v1/prediction/*                             趋势预测
/api/v1/validation/*                             双模态验证
/api/v1/profile/*                                用户档案/onboarding
/api/v1/exercises/*                              练习记录
/api/v1/memory/*                                 对话记忆
/api/v1/notifications/*                          通知推送
```

---

## 五、各模块实现状态

### 完整实现（可用）

| 模块 | 说明 |
|------|------|
| 落地页 LandingPage | 全暗色主题，glass morphism 功能卡片，CTA 按钮 |
| 新用户引导 OnboardingWizard | 多步向导（基本信息+目标+偏好），与服务端同步 |
| 今日打卡 TodayPage | 情绪/压力/精力/睡眠 4 维滑块打卡 + 7 天趋势折线图 + 任务清单 |
| 工具箱 ToolboxPage | 分类工具卡片 + 快捷入口，API 驱动动态加载 |
| 疗愈课程 ProgramsPage | 按天解锁课时 + B 站视频引导 + 实践工具 + 进度追踪 |
| 个人中心 MePage | 深色渐变头部 + 统计卡片（连击/积分/周活跃） + 菜单 |
| 设置页 SettingsPage | 账号信息修改 + 通知开关 |
| AI 咨询对话 PsyChat | 语音输入 + Edge-TTS + 情绪标注 + 快捷建议 + 危机关键词触发 |
| 心理量表（PHQ-9/GAD-7/PSS/SAS/SDS） | 完整问题流 + AI 智能解读 + PDF 报告 + 历史存储 |
| 画钟测验 CDT | Canvas 手绘 + AI 视觉评分 + OpenCV 兜底 |
| 隐形 PHQ-9 评估 | 双角色 CoT prompt，对话中同步更新 9 维症状分 |
| JITAI 干预 | 5 分钟轮询 + 多类型干预（呼吸/CBT/正念/社区）+ 效果上报 |
| 3D 呼吸球 | Three.js / BreathingBallView，4 阶段呼吸循环，4-10 BPM 可调 |
| Stroop 色词测试 | 10 题，综合评分（准确率×0.6 + 反应时×0.4） |
| 键盘动力学分析 | 焦虑指数 + 专注度 + 打字速度 + 击键间隔方差 |
| AI 趋势预测 | RandomForest + LinearRegression，7 天 PHQ-9 曲线 + 风险等级 |
| 用户认证 | 注册/登录/JWT，微信 OAuth 接入 |
| 游戏化系统 | 连续打卡 Streak + 积分 + 成就徽章 + 社区排行榜 |
| 社区功能 | 发帖/回复/点赞/私信/排行榜 |
| 心情日记 | 富文本日记 + 情绪标签 |
| EMA 经验取样 | 推送式情绪打卡弹窗 |
| 危机干预 | 关键词检测 + 24h 热线（400-161-9995 / 12320-5） |
| Live2D Avatar | Kei 模型，口型同步（TTS 驱动），情绪动作，眼部追踪 |
| 沉浸式生物反馈 | Three.js 全屏森林场景 + HRV 联动 |
| TTS 语音合成 | Edge-TTS，晓晓/晓伊/云健/云希，5 种情绪语调 |
| PDF 报告 | ReportLab，含评估详情 + AI 解读 |
| 知识图谱推理 | Neo4j 临床推理引擎（兜底：临床规则加权路径） |
| 眼动追踪 Hook | MediaPipe Face Mesh EAR 算法、PERCLOS、眨眼状态机 |
| PWA | vite-plugin-pwa + Service Worker + 安装引导横幅 |
| 暗色模式 | TailwindCSS dark: 类，localStorage 持久化 |
| 防白屏机制 | LazyErrorBoundary + lazyRetry + key={activeTab} 三层防御 |

### 部分实现 / 存在已知缺陷

| 模块 | 现状 | 备注 |
|------|------|------|
| 面部情绪检测 EmotionDetector | 摄像头接入 + UI 完整，但核心检测为**加权随机模拟** | 注释："In production use face-api.js" |
| 多模态情感融合 emotion/fusion.py | 文本用关键词匹配，语音用硬编码阈值，非真正 NLP/ML | 输出结构完整但精度有限 |
| 数字表型预测 phenotyping/predictor.py | RandomForest 在**随机合成数据**训练 | 结果仅供展示，需真实数据重训 |
| 向量记忆 memory/ | 字符级 hash 伪 embedding + JSON 存储 | 非真正 sentence-transformer |
| 知识图谱规模 | 仅 3 疾病（MDD/GAD/甲减），9 症状，权重静态 | DSM-5 覆盖率极低 |
| 语音分析 useVoiceAnalyzer | Jitter/Shimmer/基频结构完整，AudioWorklet 不完善 | 计算值参考用 |

---

## 六、核心数据流

### 6.1 统一对话 API 并行处理

```
用户消息 + 生物信号（眨眼率 / 声音抖动 / 疲劳指数）
    │
    ▼
POST /api/v1/chat  →  chat/unified_chat.py
    │
    ├── asyncio.gather 并行执行:
    │   ├── LLM 隐形 PHQ-9 评估（生成回复 + 更新 9 维症状分）
    │   └── Neo4j 图谱推理（当前症状 → 潜在疾病）
    │
    ▼
聚合结果 → reply_text + avatar_command
    │                      ├── emotion（calm/sad/neutral）
    │                      ├── breathing_bpm（呼吸引导频率）
    │                      └── enable_entrainment（呼吸夹带开关）
    ▼
前端：渲染 AI 回复 + 驱动 Live2D Avatar + 呼吸引导
```

### 6.2 JITAI 触发流程

```
前端 useJITAI Hook（每 5 分钟）
    │
    ▼
GET /api/v1/jitai/intervention
    │
    ├── 后端计算触发分数：
    │   脆弱性 = 压力指数 + 时间因子 + 随机扰动 - 冷却惩罚
    │
    ├── 分数 > 阈值  →  返回干预内容（breathing / cbt / mindfulness / social）
    └── 分数 ≤ 阈值  →  返回 {should_intervene: false}
    │
    ▼
前端显示 InterventionModal → 用户完成
    │
    ▼
POST /api/v1/jitai/complete  →  上报情绪前后变化
```

### 6.3 数字表型特征向量

```
useDigitalPhenotyping Hook 整合多源数据:
├── 被动信号：屏幕使用时长、App 切换频率（Health Connect）
├── 主动信号：EMA 打卡情绪分、日记词频
└── 生物信号：眨眼率（专注代理）、Jitter（焦虑代理）
    │
    ▼
POST /api/v1/phenotyping/features  →  存储到 Supabase
```

---

## 七、数据库表结构（Supabase PostgreSQL）

| 表名 | 主要字段 | 用途 |
|------|---------|------|
| `users` | id, username, nickname, password_hash, created_at | 用户账户 |
| `assessment_records` | user_id, scale_type, total_score, answers, severity, ai_interpretation | 量表历史 |
| `journal_entries` | user_id, content, mood_tags, created_at | 心情日记 |
| `ema_records` | user_id, mood, stress, energy, sleep, context | EMA 打卡 |
| `checkin_records` | user_id, mood, stress, energy, sleep, date | 每日打卡 |
| `programs` | id, title, description, category, duration_days, difficulty | 课程元信息 |
| `program_days` | program_id, day_number, title, learn_text, tool_id, video_url, video_title | 课时内容 |
| `user_programs` | user_id, program_id, current_day, started_at, completed_at | 课程进度 |
| `tool_items` | id, name, category, icon, description, is_active | 工具箱条目 |
| `community_posts` | user_id, content, likes, category, is_anonymous | 社区动态 |
| `community_messages` | sender_id, receiver_id, content, read_at | 私信 |
| `onboarding_data` | user_id, completed, goals, preferences, completed_at | 引导完成状态 |
| `user_memory` | user_id, content, embedding_hash, created_at | 对话记忆 |
| `notifications` | user_id, type, content, read, created_at | 通知 |

---

## 八、部署架构

```
用户浏览器
    │
    ├── HTTPS → Vercel（neurasense.cc）
    │              ├── React SPA 静态文件 (dist/)
    │              └── Service Worker 离线缓存（PWA）
    │
    └── HTTPS → Render（api.neurasense.cc）
                   FastAPI + Uvicorn
                   │
                   ├── Supabase PostgreSQL  ←─ 主数据存储（必需）
                   ├── ZhipuAI API          ←─ GLM-4-Flash 对话/评估（必需）
                   ├── Microsoft Edge TTS   ←─ 中文语音合成（免费）
                   ├── Neo4j                ←─ 知识图谱（可选，有规则引擎兜底）
                   └── Redis                ←─ 缓存（可选，当前轮询替代）
```

### 环境变量

**后端（Render）：**
```
ZHIPU_API_KEY=          必填，ZhipuAI API 密钥（code.zhipu.ai 申请）
SUPABASE_URL=           必填，Supabase 项目 URL
SUPABASE_SERVICE_KEY=   必填，service_role 密钥（绕过 RLS）
JWT_SECRET=             必填，JWT 签名密钥（随机字符串）
NEO4J_URI=              可选，bolt://...
NEO4J_USER=             可选，neo4j
NEO4J_PASSWORD=         可选
WECHAT_APP_ID=          可选，微信公众号 AppID
WECHAT_APP_SECRET=      可选
```

**前端（Vercel 构建设置）：**
```
VITE_API_BASE=https://api.neurasense.cc/api/v1
```

---

## 九、UI 设计规范（2026 年 2 月版本）

当前设计语言已全面重新设计，从"通用 AI 风格"改为更有质感的"专业心理健康应用"风格：

| 元素 | 规范 |
|------|------|
| 全局背景 | Apple 风格 `#f5f5f7`（亮色）/ `gray-900`（暗色）|
| 主色调 | `from-indigo-600 to-purple-600`（替代旧版 pink-orange）|
| 页面头部 | 深色渐变 `from-slate-800 via-indigo-900 to-slate-900` |
| 卡片 | 实色 `bg-white dark:bg-gray-800` + 实色边框（无毛玻璃 backdrop-blur）|
| 图标 | 全部 Heroicons 风格 SVG，已替换所有 Emoji |
| 交互 | `cursor-pointer` + `transition-all duration-200` + `hover:shadow-md` |
| 暗色模式 | TailwindCSS `dark:` 类，`localStorage.darkMode` 持久化 |

---

## 十、已解决的关键 Bug

| Bug | 原因 | 解决方案 | 提交 |
|-----|------|---------|------|
| 快速切换 Tab 白屏 | React.lazy 动态导入在并发请求时失败 | `lazyRetry`（100ms 重试）+ `LazyErrorBoundary` + `key={activeTab}` | daaa6c5 |
| program_days video 字段缺失 | 旧数据行无 video_url 列 | 启动时 `_sync_seed_data_to_supabase()` 自动 upsert | 4c22144 |
| 小程序 web-view 不可用 | 个人小程序账号不支持 web-view | 废弃小程序方案，改用 PWA | daaa6c5 |

---

## 十一、待开发功能

| 功能 | 优先级 | 说明 |
|------|--------|------|
| Capacitor 原生 App 打包 | 中 | iOS/Android APK/IPA，基于当前 PWA 代码 |
| WebSocket 实时通知 | 低 | 当前为 HTTP 轮询，未来改为 WS 推送 |
| Neo4j 上线（扩大知识量） | 低 | 当前仅 3 疾病/9 症状，需扩展到 DSM-5 全覆盖 |
| 真实 ML 数字表型模型 | 低 | 需收集真实用户数据后重新训练 |
| 国际化（英文） | 低 | i18n 框架已有，需补全英文翻译 |

---

## 十二、论文相关技术背景

本项目可支撑的研究方向：

| 研究方向 | 项目对应模块 | 关键参考文献 |
|---------|------------|------------|
| 移动健康应用（mHealth） | PWA + 全端功能 | Linardon et al., 2020, *World Psychiatry* |
| JITAI 即时适应干预 | JITAI 引擎 + InterventionModal | Nahum-Shani et al., 2018, *Health Psychology* |
| LLM 在心理评估中的应用 | 隐形 PHQ-9（双角色 CoT） | Wei et al., 2022, *NeurIPS*（CoT Prompting） |
| 数字表型 | useDigitalPhenotyping + 生物信号 Hooks | Onnela & Rauch, 2016, *Neuropsychopharmacology* |
| 多模态情感计算 | emotion/fusion.py + BioSignalPanel | Poria et al., 2017, *Information Fusion* |
| 知识图谱推理（GraphRAG） | clinical_logic.py + Neo4j | Edge et al., 2024, *arXiv* |
| PHQ-9 量表有效性 | PHQ9Scale + Stealth Assessment | Kroenke et al., 2001, *J. General Internal Medicine* |
| 画钟测验认知评估 | DrawingCanvas + clock_scorer.py | Shulman, 2000, *Int. J. Geriatric Psychiatry* |

---

## 十三、技术约束（开发约定）

- **前端**：React 19 + TypeScript + Vite + TailwindCSS（固定，不换框架）
- **后端**：FastAPI + Python 3.11+（固定，不换框架）
- **主数据库**：Supabase PostgreSQL（通过 supabase-py SDK 访问）
- **LLM**：ZhipuAI GLM-4-Flash 为主力（env: `ZHIPU_API_KEY`），映射到代码内的 `LLM_API_KEY`
- **部署**：前端 Vercel（自动 deploy main 分支），后端 Render（自动 deploy main 分支）
- **接口**：前后端分离，REST API，CORS 允许所有来源（`allow_origins=["*"]`）
- **认证**：JWT token，通过 URL 参数 `?token=` 或 Authorization header 传递
- **代码风格**：Python 用 ruff + black（line-length 88），TypeScript 用项目内 ESLint 配置
