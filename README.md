# Shooting Game 射擊遊戲

這是一個全端射擊遊戲專案，包含 FastAPI 後端和 React 前端。

This is a full-stack shooting game project with FastAPI backend and React frontend.

## 專案結構 / Project Structure

```
shooting-game/
├── backend/          # FastAPI 後端
├── frontend/         # React 前端
└── README.md         # 本文件
```

## 快速開始 / Quick Start

### 前置需求 / Prerequisites

- **Python 3.10+** (後端)
- **Node.js** (前端)
- **MySQL** 資料庫
- **uv** (Python 套件管理器)
- **pnpm** (Node.js 套件管理器)

### 安裝 uv (如果尚未安裝)

```bash
# Windows (PowerShell)
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### 安裝 pnpm (如果尚未安裝)

```bash
npm install -g pnpm
```

---

## 後端設定 / Backend Setup

### 1. 進入後端目錄

```bash
cd backend
```

### 2. 安裝依賴

```bash
uv sync
```

### 3. MySQL 資料庫設定

1. 確保 MySQL 服務正在運行
2. 建立資料庫：
   ```sql
   CREATE DATABASE `shooting-game` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

### 4. 環境變數設定

在 `backend/` 目錄下建立 `.env` 檔案：

```env
# MySQL Database Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=shooting-game

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 5. 初始化資料庫

```bash
uv run python init_db.py
```

### 6. 啟動後端服務

**開發模式：**
```bash
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**生產模式：**
```bash
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
```

後端服務將運行在：**http://localhost:8000**

API 文件：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## 前端設定 / Frontend Setup

### 1. 進入前端目錄

```bash
cd frontend
```

### 2. 安裝依賴

```bash
pnpm install
```

### 3. 環境變數設定

在 `frontend/` 目錄下建立 `.env.local` 檔案：

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. 啟動前端開發伺服器

```bash
pnpm run dev
```

前端服務將運行在：**http://localhost:3000**

### 5. 建置生產版本

```bash
pnpm run build
```

### 6. 預覽生產版本

```bash
pnpm run preview
```

---

## API 端點 / API Endpoints

### 排行榜 / Leaderboard

- `GET /api/leaderboard?limit=10` - 取得排行榜
- `POST /api/leaderboard` - 新增分數記錄

---

## 技術棧 / Tech Stack

### 後端 / Backend

- **FastAPI** - Web 框架
- **uvicorn** - ASGI 伺服器
- **SQLAlchemy** - ORM 框架
- **PyMySQL** - MySQL 驅動程式
- **uv** - Python 套件管理器

### 前端 / Frontend

- **React 19** - UI 框架
- **TypeScript** - 型別系統
- **Vite** - 建置工具
- **pnpm** - Node.js 套件管理器

---

## 專案架構 / Project Architecture

### 後端架構 (MVC)

```
backend/
├── app/
│   ├── main.py                 # FastAPI 應用程式入口
│   ├── config.py               # 配置管理
│   ├── database.py             # 資料庫連接配置
│   ├── models/                 # 資料模型
│   │   ├── db_models.py        # SQLAlchemy 資料模型
│   │   └── leaderboard.py      # Pydantic 模型
│   ├── views/                  # API 端點
│   │   └── leaderboard.py
│   ├── controllers/            # 業務邏輯層
│   │   └── leaderboard_controller.py
│   ├── services/               # 服務層
│   │   └── database_service.py # MySQL Database
│   └── utils/                  # 工具函數
├── pyproject.toml
├── init_db.py
└── README.md
```

### 前端架構

```
frontend/
├── App.tsx                     # 主應用程式元件
├── index.tsx                   # 應用程式入口
├── index.html                  # HTML 模板
├── components/                 # React 元件
│   └── ArcadeCanvas.tsx
├── services/                   # 服務層
│   └── geminiService.ts
├── types.ts                    # TypeScript 型別定義
├── vite.config.ts              # Vite 配置
├── tsconfig.json               # TypeScript 配置
└── package.json
```

---

## 注意事項 / Important Notes

### 後端 / Backend

- 確保 MySQL 資料庫已建立並可連接
- 資料表會在應用程式啟動時自動建立
- 使用 `uv` 替代 `pip` 管理 Python 套件

### 前端 / Frontend

- 需要設定 `GEMINI_API_KEY` 環境變數
- 預設運行在 port 3000
- 使用 `pnpm` 管理 Node.js 套件

### 圖片上傳功能 / Image Upload Feature

- 上傳的圖片會使用 UUID 作為檔案名稱
- 所有圖片會自動轉換為 WebP 格式
- 編輯完成時，舊的圖片會被刪除，改用新的圖片

---

## 開發流程 / Development Workflow

1. **啟動後端服務**
   ```bash
   cd backend
   uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **啟動前端服務**（新終端機）
   ```bash
   cd frontend
   pnpm run dev
   ```

3. 開啟瀏覽器訪問：http://localhost:3000

---

## 授權 / License

本專案僅供學習和開發使用。

This project is for learning and development purposes only.

