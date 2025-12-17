# PsyAntigravity 智能心理测评平台

<p align="center">
  <strong>🧠 基于人工智能的专业心理健康评估系统</strong>
</p>

## 📖 项目简介

PsyAntigravity 是一个智能化心理测评平台，旨在提供精准、科学的心理健康分析与建议。该平台整合了多种标准化心理测评量表，并结合人工智能技术进行智能分析。

### 主要功能

- 🕐 **画钟测验 (CDT)** - 基于笔触轨迹的认知功能评估
- 📋 **PHQ-9** - 抑郁症筛查问卷
- 📊 **GAD-7** - 焦虑症筛查量表
- 🧬 **医疗知识图谱** - 基于 Neo4j 的症状-疾病关联分析

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + TypeScript + Vite + TailwindCSS + Zustand |
| 后端 | Python FastAPI (异步模式) + Poetry |
| 用户数据库 | PostgreSQL 15 |
| 知识图谱 | Neo4j 5 |
| 缓存 | Redis 7 |
| 容器编排 | Docker Compose |

## 🚀 快速启动

### 前置要求

- [Docker](https://www.docker.com/) (v20.10+)
- [Docker Compose](https://docs.docker.com/compose/) (v2.0+)

### 启动步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd PsyAntigravity
   ```

2. **启动所有服务**
   ```bash
   docker-compose up --build
   ```

3. **访问应用**
   - 前端界面: http://localhost:3000
   - 后端 API: http://localhost:8000
   - API 文档: http://localhost:8000/docs
   - Neo4j 浏览器: http://localhost:7474

### 服务端口

| 服务 | 端口 | 说明 |
|------|------|------|
| Frontend | 3000 | React 开发服务器 |
| Backend | 8000 | FastAPI 服务 |
| PostgreSQL | 5432 | 用户数据存储 |
| Neo4j HTTP | 7474 | 知识图谱浏览器 |
| Neo4j Bolt | 7687 | 知识图谱连接 |
| Redis | 6379 | 缓存服务 |

## 📁 项目结构

```
PsyAntigravity/
├── docker-compose.yml      # Docker 服务编排
├── README.md               # 项目说明文档
│
├── backend/                # FastAPI 后端 (DDD 架构)
│   ├── Dockerfile
│   ├── pyproject.toml      # Poetry 依赖配置
│   └── app/
│       ├── main.py         # 应用入口
│       ├── domain/         # 领域模型层
│       ├── services/       # 业务服务层
│       └── api/            # API 路由层
│
└── frontend/               # React 前端
    ├── Dockerfile
    ├── package.json
    ├── vite.config.ts      # Vite 配置 (含后端代理)
    ├── tailwind.config.js
    └── src/
        ├── App.tsx         # 主应用组件
        ├── types/          # TypeScript 类型定义
        │   └── assessment.ts   # 测评相关类型
        └── store/          # Zustand 状态管理
```

## 🔧 开发指南

### 本地开发 (不使用 Docker)

**后端开发**
```bash
cd backend
poetry install
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**前端开发**
```bash
cd frontend
npm install
npm run dev
```

### 关键类型定义

`DigitizerPoint` 接口用于记录画钟测验时的笔触轨迹：

```typescript
interface DigitizerPoint {
  x: number;        // X 坐标 (像素)
  y: number;        // Y 坐标 (像素)
  pressure: number; // 笔压 (0.0 - 1.0)
  timestamp: number; // 时间戳 (毫秒)
}
```

## 📄 许可证

© 2024 PsyAntigravity. All rights reserved.
