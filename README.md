# NeuraSense — AI 智能心理健康平台

<p align="center">
  <strong>基于多模态生物信号感知与 LLM 的全周期心理健康管理系统</strong>
</p>

<p align="center">
  <a href="https://neurasense.cc">线上地址：neurasense.cc</a> ·
  <a href="https://api.neurasense.cc/docs">API 文档</a>
</p>

---

## 一、项目概述

NeuraSense 是一个面向普通用户的 AI 心理健康管理 Web 应用（PWA），核心理念是：

> **"让心理健康管理像记录天气一样自然。"**

系统整合了对话式 AI 咨询、标准化心理量表评估、JITAI 即时适应干预、多模态生物信号监测（眼动、声音、击键）、Live2D 虚拟陪伴 Avatar、疗愈课程、工具箱等模块，构成一套完整的心理健康管理闭环。

**当前版本：** v0.1.0（2026 年 2 月）
**部署状态：** 已上线（前端 Vercel，后端 Render）

---

## 二、技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| **前端框架** | React 19 + TypeScript | 函数组件 + Hooks 架构 |
| **前端构建** | Vite 6 + TailwindCSS v3 | 热更新开发，按需加载 |
| **状态管理** | Zustand | 全局状态（用户、游戏化、onboarding） |
| **3D 渲染** | Three.js + React Three Fiber | 3D 沉浸场景 |
| **图表可视化** | Recharts | PHQ-9 趋势图、情绪雷达图等 |
| **Live2D** | pixi-live2d-display + PixiJS | 虚拟 Avatar（Kei 模型） |
| **PWA** | vite-plugin-pwa + Workbox | Service Worker 离线缓存，可添加到主屏幕 |
| **后端框架** | Python FastAPI（异步） | DDD 领域驱动架构 |
| **数据库** | Supabase PostgreSQL | 用户数据、评估历史、日记、课程 |
| **AI / LLM** | ZhipuAI GLM-4-Flash | 对话咨询、隐形 PHQ-9 评估、生物信号解读 |
| **语音合成** | Microsoft Edge TTS | 免费中文 TTS，支持情绪语调 |
| **知识图谱** | Neo4j（可选）| 症状-疾病 GraphRAG 推理 |
| **部署** | 前端 Vercel，后端 Render | 全球 CDN + 免费 Serverless |

---

## 三、系统架构

```
NeuraSense-main/
│
├── frontend/                   # React 前端（PWA）
│   ├── src/
│   │   ├── App.tsx             # 主入口：路由（landing/onboarding/main）、全局状态
│   │   ├── config/api.ts       # API_BASE 环境变量配置
│   │   ├── layouts/
│   │   │   └── TabBar.tsx      # 底部导航栏（今日/聊天/工具箱/课程/我的）
│   │   ├── pages/              # 五大主 Tab 页面
│   │   │   ├── LandingPage.tsx     # 落地页（暗色主题）
│   │   │   ├── OnboardingWizard.tsx # 新用户引导向导
│   │   │   ├── TodayPage.tsx       # 今日签到、情绪打卡、任务中心
│   │   │   ├── ToolboxPage.tsx     # 工具箱（评估工具 + 练习工具）
│   │   │   ├── ProgramsPage.tsx    # 结构化疗愈课程
│   │   │   ├── MePage.tsx          # 个人中心（设置、成就、历史）
│   │   │   ├── AssessmentCenterPage.tsx # 量表评估中心
│   │   │   ├── SettingsPage.tsx    # 账号设置
│   │   │   └── MessageCenterPage.tsx   # 消息中心
│   │   ├── components/
│   │   │   ├── Auth/AuthModal.tsx      # 登录/注册弹窗
│   │   │   ├── Chat/PsyChat.tsx        # AI 心理咨询对话界面
│   │   │   ├── Assessment/             # 各量表组件（PHQ-9, GAD-7, SAS, SDS, PSS）
│   │   │   ├── JITAI/                  # 即时干预弹窗（GuardianCard + InterventionModal）
│   │   │   ├── VirtualAvatar/          # Live2D 虚拟陪伴 Avatar
│   │   │   ├── EmbodiedAvatar/         # 呼吸引导 Avatar（Three.js）
│   │   │   ├── BioSignalPanel/         # AI 生物信号综合分析面板
│   │   │   ├── Community/              # 社区（动态/排行榜/私信）
│   │   │   ├── Journal/MoodJournal.tsx # 心情日记
│   │   │   ├── EMA/EMACheckIn.tsx      # 经验取样法打卡
│   │   │   ├── Gamification/           # 成就系统、积分、连续打卡
│   │   │   ├── Immersive/              # 沉浸式生物反馈场景（Three.js 3D）
│   │   │   ├── LazyErrorBoundary.tsx   # 动态导入失败时的错误边界（防白屏）
│   │   │   └── PWAInstallPrompt.tsx    # PWA 安装引导横幅
│   │   ├── hooks/
│   │   │   ├── useOculometricSensor.ts # 眼动/疲劳检测（摄像头 + MediaPipe）
│   │   │   ├── useVoiceAnalyzer.ts     # 语音特征分析（Jitter/Shimmer/基频）
│   │   │   ├── useKeystrokeDynamics.ts # 键盘动力学（焦虑/专注度评估）
│   │   │   ├── useBioSignalAggregator.ts # 多模态信号聚合
│   │   │   ├── useJITAI.ts             # JITAI 引擎 Hook（定时轮询干预）
│   │   │   ├── useHealthConnect.ts     # 健康数据接入（HRV 等）
│   │   │   └── useDigitalPhenotyping.ts # 数字表型特征计算
│   │   └── store/
│   │       ├── index.ts                # 主应用 Store（useAppStore）
│   │       ├── useGamificationStore.ts # 游戏化 Store（streak、积分）
│   │       └── useOnboardingStore.ts   # 引导完成状态 Store
│   ├── public/
│   │   └── models/kei/                 # Live2D Kei 模型（moc3 + 纹理 + 动作）
│   ├── vite.config.ts                  # Vite 配置（PWA 插件、代理、分包）
│   └── tailwind.config.js             # Tailwind 主题（warm/primary/calm 色系）
│
├── backend/                    # FastAPI 后端（DDD 架构）
│   ├── app/
│   │   ├── main.py             # FastAPI 入口：CORS、路由挂载、启动数据同步
│   │   ├── api/
│   │   │   ├── __init__.py         # 主路由聚合（18 个子路由）
│   │   │   ├── tools_router.py     # 工具条目 CRUD
│   │   │   ├── programs_router.py  # 课程/课时内容
│   │   │   ├── checkin_router.py   # 每日签到打卡
│   │   │   ├── assessments_router.py # 量表结果存取
│   │   │   ├── journal_router.py   # 心情日记
│   │   │   ├── ema_router.py       # 经验取样法记录
│   │   │   ├── jitai_router.py     # JITAI 干预触发
│   │   │   ├── community_router.py # 社区动态/私信
│   │   │   ├── memory_router.py    # 用户记忆持久化
│   │   │   ├── notifications_router.py # 通知推送
│   │   │   ├── prediction_router.py # 7天 PHQ-9 趋势预测
│   │   │   ├── phenotyping_router.py # 数字表型特征存储
│   │   │   ├── validation_router.py  # 双模态一致性验证
│   │   │   ├── wechat_auth_router.py # 微信 OAuth 登录
│   │   │   ├── profile_router.py   # 用户档案管理
│   │   │   ├── exercises_router.py # 练习记录
│   │   │   └── memory_router.py    # 对话记忆
│   │   ├── services/
│   │   │   ├── llm/                # ZhipuAI GLM-4-Flash 调用封装
│   │   │   ├── chat/               # 统一对话服务（聚合 LLM + 图谱推理）
│   │   │   ├── assessment/stealth_phq9.py # 隐形 PHQ-9 双角色 CoT 评估
│   │   │   ├── scoring/            # 画钟测验 OpenCV + AI 评分
│   │   │   ├── emotion/fusion.py   # 多模态情绪融合（文本+语音）
│   │   │   ├── jitai/engine.py     # JITAI 干预规则引擎
│   │   │   ├── knowledge/          # 知识图谱服务（Neo4j + 临床规则引擎）
│   │   │   ├── phenotyping/        # 数字表型特征工程
│   │   │   ├── prediction/trend_predictor.py # RandomForest + LinearRegression 趋势预测
│   │   │   ├── database/supabase_client.py # Supabase 客户端封装
│   │   │   ├── auth/auth_service.py # JWT 认证 + 用户管理
│   │   │   ├── tts/tts_service.py  # Edge TTS 语音合成
│   │   │   ├── report/pdf_service.py # PDF 评估报告生成
│   │   │   └── validation/dual_modality.py # 表情-语音一致性检测
│   │   └── domain/                 # 领域模型定义
│   └── data/                       # 种子数据（JSON）
│       ├── tool_items_v2.json      # 工具条目初始数据
│       ├── programs.json           # 课程初始数据
│       ├── program_days.json       # 课时内容（含视频链接）
│       └── jitai_interventions.json # JITAI 干预内容库
│
└── docker-compose.yml              # 本地开发容器编排（可选）
```

---

## 四、核心功能详解

### 4.1 AI 心理咨询对话（Chat Tab）

- **模型**：ZhipuAI GLM-4-Flash（免费 API，支持长上下文）
- **功能**：
  - 温暖共情的对话风格，由系统 Prompt 约束为心理咨询师角色
  - 实时危机关键词检测（"自杀"、"不想活"等），触发危机援助弹窗
  - 对话同时融合生物信号上下文（眨眼率、声音抖动、疲劳指数）
  - Avatar 联动：AI 回复后控制 Live2D Kei 说话/情绪动作
- **API**：`POST /api/v1/chat`

### 4.2 隐形 PHQ-9 评估（Stealth Assessment）

核心创新点：通过自然对话在用户不知情的情况下完成 PHQ-9 抑郁筛查。

- **机制**：双角色 CoT（Chain-of-Thought）Prompt
  - 显性角色：温暖的咨询师，与用户自然交谈
  - 隐性角色：临床评估员，同步更新 9 个症状维度的评分
- **实现**：`backend/app/services/assessment/stealth_phq9.py`
- **API**：`POST /api/v1/assessment/stealth/chat`、`GET /api/v1/assessment/stealth/{session_id}/summary`

### 4.3 多模态生物信号监测

| 信号类型 | 采集方式 | 指标 | Hook |
|---------|---------|------|------|
| 眼动 | 摄像头 + MediaPipe | 眨眼率、PERCLOS（眼睛闭合比）、凝视稳定性 | `useOculometricSensor` |
| 声音 | 麦克风 + Web Audio API | Jitter（周期抖动）、Shimmer（振幅抖动）、基频、语速 | `useVoiceAnalyzer` |
| 击键 | DOM keydown/keyup 事件 | 按键间隔方差、错误率、焦虑指数、专注度 | `useKeystrokeDynamics` |
| 健康数据 | Health Connect API | HRV、步数 | `useHealthConnect` |

多路信号经 `useBioSignalAggregator` 汇聚，上报 `POST /api/v1/biosignal/analyze` 获取 AI 综合解读。

### 4.4 JITAI（即时适应干预）

Just-In-Time Adaptive Interventions：在用户状态恶化时主动推送干预。

- **触发条件**：压力指数超阈值 / 定时随机触发（`useJITAI` Hook，默认 5 分钟间隔）
- **干预内容**：从 `jitai_interventions.json` 加载分类干预（呼吸练习/认知重构/正念提示）
- **交互**：`InterventionModal` 弹窗，完成后记录效果（情绪前后对比）
- **API**：`GET /api/v1/jitai/intervention`、`POST /api/v1/jitai/complete`

### 4.5 标准化心理量表

通过 `AssessmentCenterPage` 统一管理，全部支持：
- 作答 → AI 智能解读 → PDF 报告下载 → 历史记录存储

| 量表 | 全称 | 评估维度 |
|------|------|---------|
| PHQ-9 | 患者健康问卷-9 | 抑郁症筛查（9 题，27 分制） |
| GAD-7 | 广泛性焦虑障碍-7 | 焦虑症筛查（7 题） |
| SDS | 抑郁自评量表 | Zung 抑郁自评（20 题） |
| SAS | 焦虑自评量表 | Zung 焦虑自评（20 题） |
| PSS | 压力感知量表 | 近 1 个月主观压力感知（10 题） |
| CDT | 画钟测验 | 认知功能评估，OpenCV + AI 双重评分 |

### 4.6 AI 趋势预测

- **模型**：RandomForest + LinearRegression 集成，预测未来 7 天 PHQ-9 走势
- **前置条件**：至少 3 次历史 PHQ-9 记录
- **输出**：趋势方向（改善/稳定/恶化）、风险等级、7 天预测分数曲线
- **API**：`POST /api/v1/prediction/forecast`

### 4.7 知识图谱推理（GraphRAG）

可选模块（需 Neo4j），已有内置临床规则引擎回退方案：

- **架构**：`(:User)-[:HAS_SYMPTOM]->(:Symptom)-[:INDICATES]->(:Disorder)`
- **推理公式**：`Score(D) = Σ Weight(s→D) × Severity(s)`
- **功能**：症状查询、N-hop 邻居检索、加权路径推理
- **API**：`POST /api/v1/graph/symptoms`、`GET /api/v1/graph/inference/{user_id}`

### 4.8 Live2D 虚拟 Avatar

- **模型**：Kei（kei_basic_free，Live2D Cubism）
- **功能**：口型同步（TTS 语音驱动）、情绪动作切换、眼部追踪、呼吸夹带
- **技术**：`pixi-live2d-display`，模型文件位于 `frontend/public/models/kei/`
- **组件**：`VirtualAvatar`（精灵 Avatar）、`EmbodiedAvatar`（Three.js 3D 呼吸引导球）

### 4.9 疗愈课程（Programs Tab）

- **结构**：课程（Program）→ 课时（Day）→ 工具（Tool）
- **内容**：每课时含学习文本、引导视频（B 站外链）、复习问题、实践工具
- **锁定机制**：按天解锁（当天课时完成才可进入下一天）
- **存储**：Supabase `programs`、`program_days`、`user_programs` 表

### 4.10 工具箱（Toolbox Tab）

按类别（评估/认知/正念/放松）组织的互动工具：

| 工具 | 类型 | 核心功能 |
|------|------|---------|
| Stroop 色词测试 | 认知测试 | 10 题色词干扰，评估认知灵活性 |
| 3D 呼吸球 | 放松练习 | 4-7-8 呼吸法，4–10 BPM 可调 |
| 键盘动力学分析 | 生物信号 | 打字模式分析焦虑指数 + 专注度 |
| AI 趋势预测 | 数据分析 | 7 天 PHQ-9 预测走势图 |
| 沉浸式生物反馈 | 3D 沉浸 | Three.js 全屏自然场景 + HRV 反馈 |
| PHQ-9/GAD-7 等 | 量表评估 | 标准化问卷 |

### 4.11 今日打卡（Today Tab）

- 情绪维度滑动打卡：心情、压力、精力、睡眠（0-10 分）
- 每日任务清单（完成得积分）
- 情绪趋势折线图（近 7 天）
- 一键跳转 AI 对话

### 4.12 游戏化系统

- **连续打卡 Streak**：每日首次打卡维持 streak，断打归零
- **积分系统**：完成任务/评估/日记/练习分别得不同积分
- **成就中心**：解锁各类里程碑成就徽章
- **排行榜**：社区积分排名

### 4.13 社区模块

- **动态广场**：匿名发布情绪动态，支持点赞
- **社区排行榜**：积分周榜
- **私信**：用户间一对一私信
- **API**：`community_router.py`

### 4.14 PWA 支持

- 已配置 VitePWA 插件 + Workbox Service Worker
- 支持 Android（beforeinstallprompt）和 iOS Safari 的添加到主屏幕
- `PWAInstallPrompt.tsx`：底部安装横幅，7 天记住关闭状态
- 离线缓存静态资源（HTML / CSS / JS / 模型文件）

---

## 五、部署架构

```
用户浏览器
    │
    ├─ HTTPS ──> Vercel (neurasense.cc)
    │              React 静态文件 (dist/)
    │              Service Worker 离线缓存
    │
    └─ HTTPS ──> Render (api.neurasense.cc)
                   FastAPI + Uvicorn
                   │
                   ├─> Supabase PostgreSQL（主数据库）
                   │     用户、评估、日记、课程、工具、社区
                   │
                   ├─> ZhipuAI API（GLM-4-Flash）
                   │     对话、评估解读、生物信号分析
                   │
                   ├─> Microsoft Edge TTS（语音合成）
                   │
                   └─> Neo4j（可选，知识图谱）
```

**环境变量（Render 后端）：**

```
ZHIPU_API_KEY=          # ZhipuAI API 密钥（必填）
SUPABASE_URL=           # Supabase 项目 URL（必填）
SUPABASE_SERVICE_KEY=   # Supabase service_role 密钥（必填）
JWT_SECRET=             # JWT 签名密钥（必填）
NEO4J_URI=              # Neo4j 连接地址（可选）
NEO4J_USER=             # Neo4j 用户名（可选）
NEO4J_PASSWORD=         # Neo4j 密码（可选）
WECHAT_APP_ID=          # 微信公众号 AppID（可选，用于 OAuth）
WECHAT_APP_SECRET=      # 微信公众号 AppSecret（可选）
```

**环境变量（前端构建）：**

```
VITE_API_BASE=https://api.neurasense.cc/api/v1   # 生产 API 地址
```

---

## 六、本地开发

### 前提条件

- Node.js 20+
- Python 3.11+
- （可选）Docker Desktop

### 前端

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
npm run build      # 构建到 dist/
```

### 后端

```bash
cd backend
pip install -r requirements.txt   # 或 poetry install
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
# API 文档：http://localhost:8000/docs
```

### 环境配置

后端在 `backend/` 目录创建 `.env` 文件（参考上文环境变量列表）。

前端本地开发默认指向 `https://api.neurasense.cc`，可在 `frontend/.env.development` 中覆盖：

```
VITE_API_BASE=http://localhost:8000/api/v1
```

---

## 七、Supabase 数据库表结构

| 表名 | 用途 |
|------|------|
| `users` | 用户账户（id, username, nickname, password_hash） |
| `assessment_records` | 量表评估历史记录 |
| `journal_entries` | 心情日记条目 |
| `ema_records` | EMA 经验取样打卡记录 |
| `checkin_records` | 每日情绪维度打卡数据 |
| `programs` | 疗愈课程元信息 |
| `program_days` | 课程课时（含视频 URL） |
| `user_programs` | 用户课程进度跟踪 |
| `tool_items` | 工具箱条目（API 驱动） |
| `community_posts` | 社区动态 |
| `community_messages` | 私信记录 |
| `onboarding_data` | 用户引导完成状态 |
| `user_memory` | AI 对话记忆片段 |
| `notifications` | 通知推送记录 |

启动时 `main.py` 的 `_sync_seed_data_to_supabase()` 会自动将本地 JSON 种子数据同步到数据库（幂等，不重复插入）。

---

## 八、关键技术实现细节

### 8.1 防白屏机制（LazyErrorBoundary）

React.lazy 动态导入在快速切换 Tab 时可能失败，导致白屏：

```tsx
// App.tsx
function lazyRetry(importFn) {
    return lazy(() =>
        importFn().catch(() =>
            new Promise(resolve => setTimeout(() => resolve(importFn()), 100))
        )
    );
}

// 包裹页面内容
<LazyErrorBoundary key={activeTab}>
    <Suspense fallback={<PageSkeleton />}>
        <TodayPage ... />
    </Suspense>
</LazyErrorBoundary>
```

三层防御：① `lazyRetry` 100ms 后自动重试 → ② `LazyErrorBoundary` 显示重试按钮 → ③ `key={activeTab}` 切换 Tab 时自动重置错误状态。

### 8.2 统一对话 API 的并行处理

```python
# backend/app/services/chat/__init__.py
# 1. 接收 message + bio_signals
# 2. asyncio.gather 并行执行：
#    - LLM 隐形 PHQ-9 评估（生成回复 + 更新症状分）
#    - Neo4j 图谱推理（当前症状 → 潜在疾病）
# 3. 聚合结果 → reply_text + avatar_command（情绪/呼吸频率/夹带开关）
```

### 8.3 数字表型特征工程

`useDigitalPhenotyping` Hook 将多源数据整合为数字表型向量，供后端预测模型使用：

- **被动信号**：屏幕使用时长、App 切换频率（Health Connect）
- **主动信号**：EMA 打卡情绪分、日记词频
- **生物信号**：眨眼率（专注度代理指标）、Jitter（焦虑代理指标）

### 8.4 JITAI 引擎逻辑

```
每 5 分钟轮询一次 /api/v1/jitai/intervention
├── 后端计算触发分数（压力指数 + 随机因子 + 冷却时间）
├── 分数 > 阈值 → 返回干预内容（type: breathing/cbt/mindfulness/social）
└── 前端显示 InterventionModal → 用户完成后上报效果
```

---

## 九、UI 设计规范

当前设计语言（2026 年 2 月重新设计）：

- **背景色**：Apple 风格 `#f5f5f7`（亮色）/ `gray-900`（暗色）
- **主色调**：`from-indigo-600 to-purple-600`（替代旧版 pink-orange 渐变）
- **页面头部**：深色渐变横幅 `from-slate-800 via-indigo-900 to-slate-900`
- **卡片**：实色白底 `bg-white dark:bg-gray-800`，实色边框 `border-warm-100 dark:border-gray-700`（无毛玻璃）
- **图标**：全部 SVG 行内图标（Heroicons 风格），已替换所有 Emoji 图标
- **字体**：系统字体栈（无特殊引入）
- **暗色模式**：TailwindCSS `dark:` 类，通过 `localStorage.darkMode` 持久化

---

## 十、已知问题与开发计划

### 已解决
- [x] 快速切换 Tab 白屏 → LazyErrorBoundary + lazyRetry
- [x] program_days 视频字段同步 → 启动时自动 upsert
- [x] 小程序 web-view（个人号不支持，已放弃，改用 PWA）

### 待完成
- [ ] Capacitor 打包为原生 iOS/Android App（方案 B，用户已知晓）
- [ ] 完善数字表型模型（当前为规则引擎，未来用真实数据训练 ML 模型）
- [ ] Neo4j 知识图谱上线（当前有临床规则引擎兜底）
- [ ] 消息通知 WebSocket 推送（当前为轮询）
- [ ] 国际化（当前仅中文）

---

## 十一、参考文献（用于论文写作）

本项目涉及以下研究领域，可参考：

1. **JITAI**：Nahum-Shani, I., et al. (2018). Just-in-Time Adaptive Interventions (JITAIs) in Mobile Health. *Health Psychology*.
2. **隐形评估 / CoT Prompt**：Wei, J., et al. (2022). Chain-of-Thought Prompting Elicits Reasoning in Large Language Models. *NeurIPS*.
3. **数字表型**：Onnela, J. P., & Rauch, S. L. (2016). Harnessing smartphone-based digital phenotyping to enhance behavioral and mental health. *Neuropsychopharmacology*.
4. **多模态情绪识别**：Poria, S., et al. (2017). A review of affective computing: From unimodal analysis to multimodal fusion. *Information Fusion*.
5. **PHQ-9 验证**：Kroenke, K., et al. (2001). The PHQ-9: Validity of a Brief Depression Severity Measure. *Journal of General Internal Medicine*.
6. **画钟测验**：Shulman, K. I. (2000). Clock-drawing: Is it the ideal cognitive screening test? *International Journal of Geriatric Psychiatry*.
7. **GraphRAG**：Edge, D., et al. (2024). From Local to Global: A Graph RAG Approach to Query-Focused Summarization. *arXiv*.
8. **PWA 心理健康应用**：Linardon, J., et al. (2020). The Efficacy of App-Supported Smartphone Interventions for Mental Health Problems. *World Psychiatry*.

---

## 十二、版本历史

| 提交 | 内容 |
|------|------|
| `0dceb30` | 全站 UI 重设计：暗色头部、Apple 风格背景、靛紫主题 |
| `eb06157` | 全站 Emoji 替换为 SVG 图标 + PWA 安装引导 |
| `daaa6c5` | 修复快速切换 Tab 白屏 + 移除小程序代码 |
| `4068522` | 添加微信小程序外壳（已废弃，个人号不支持 web-view） |
| `4c22144` | 修复 program_days video_url/video_title 字段同步 |

---

© 2024–2026 NeuraSense. All rights reserved.
