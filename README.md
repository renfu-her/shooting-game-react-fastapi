# Shooting Game 射擊遊戲

這是一個全端射擊遊戲專案，包含 FastAPI 後端和 React 前端。

This is a full-stack shooting game project with FastAPI backend and React frontend.

## 專案結構 / Project Structure

```
shooting-game/
├── backend/          # FastAPI 後端
│   ├── app/          # 應用程式主目錄
│   ├── pyproject.toml
│   └── init_db.py    # 資料庫初始化腳本
├── frontend/         # React 前端
│   ├── src/          # 原始碼目錄
│   ├── services/     # API 服務
│   └── package.json
└── README.md         # 本文件
```

---

## 快速開始 / Quick Start

### 前置需求 / Prerequisites

- **Python 3.10+** (後端)
- **Node.js 18+** (前端)
- **MySQL 8.0+** 資料庫
- **uv** (Python 套件管理器)
- **pnpm** (Node.js 套件管理器)

### 安裝工具

#### 安裝 uv (Python 套件管理器)

```bash
# Windows (PowerShell)
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh
```

#### 安裝 pnpm (Node.js 套件管理器)

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

這會自動安裝所有必要的 Python 套件。

### 3. MySQL 資料庫設定

1. **確保 MySQL 服務正在運行**

2. **建立資料庫**：
   ```sql
   CREATE DATABASE `shooting-game` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

3. **確認資料庫連接資訊**（預設值）：
   - Host: `localhost`
   - Port: `3306`
   - User: `root`
   - Password: (空)
   - Database: `shooting-game`

### 4. 環境變數設定

在 `backend/` 目錄下建立 `.env` 檔案：

```env
# MySQL Database Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=shooting-game

# API Token Configuration (用於 API 認證)
API_TOKEN=shooting-game-api-token-2024

# CORS Configuration (允許的前端來源)
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

**重要說明**：
- `API_TOKEN` 是後端 API 的認證 token，前端需要使用此 token 來訪問 API
- 如果未設定，預設值為 `shooting-game-api-token-2024`
- 生產環境請務必更改為安全的 token

### 5. 初始化資料庫

```bash
uv run python init_db.py
```

這會建立必要的資料表（`leaderboard`）。

### 6. 啟動後端服務

**開發模式（自動重載）：**
```bash
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**生產模式（使用 Gunicorn，推薦）：**
```bash
# 使用配置文件
uv run gunicorn app.main:app -c gunicorn_config.py

# 或直接指定參數
uv run gunicorn app.main:app \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000
```

**生產模式（使用 Uvicorn，簡單部署）：**
```bash
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
```

> **注意**：Gunicorn 是生產環境推薦的 WSGI 伺服器，提供更好的性能和穩定性。詳細配置請參考 `backend/README.md`。

後端服務將運行在：**http://localhost:8000**

### 7. 驗證後端運行

- **API 文件**：
  - Swagger UI: http://localhost:8000/docs
  - ReDoc: http://localhost:8000/redoc

- **健康檢查**：
  ```bash
  curl http://localhost:8000/health
  ```

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
# Gemini API Key (用於 AI 教練評論功能)
GEMINI_API_KEY=your_gemini_api_key_here

# 後端 API 設定（可選，有預設值）
# VITE_API_BASE_URL=http://localhost:8000/api
# VITE_API_TOKEN=shooting-game-api-token-2024
```

**重要說明**：
- `GEMINI_API_KEY` 是必需的，用於生成 AI 教練評論
- `VITE_API_BASE_URL` 和 `VITE_API_TOKEN` 可選，如果不設定會使用預設值
- 預設 API 基礎 URL: `http://localhost:8000/api`
- 預設 API Token: `shooting-game-api-token-2024`（需與後端 `.env` 中的 `API_TOKEN` 一致）

### 4. 啟動前端開發伺服器

```bash
pnpm run dev
```

前端服務將運行在：**http://localhost:3000**

### 5. 建置生產版本

```bash
pnpm run build
```

建置後的檔案會在 `dist/` 目錄中。

### 6. 預覽生產版本

```bash
pnpm run preview
```

---

## API 端點說明 / API Endpoints

### 認證端點 / Authentication Endpoints

#### 獲取 API Token
- **端點**: `GET /api/auth/token`
- **認證**: 不需要
- **說明**: 獲取用於 API 認證的 token
- **回應範例**:
  ```json
  {
    "token": "shooting-game-api-token-2024",
    "message": "Use this token in Authorization header as Bearer token"
  }
  ```

#### 驗證 Token
- **端點**: `GET /api/auth/verify?token={token}`
- **認證**: 不需要
- **說明**: 驗證提供的 token 是否有效
- **回應範例**:
  ```json
  {
    "valid": true,
    "message": "Token is valid"
  }
  ```

### 排行榜端點 / Leaderboard Endpoints

#### 取得排行榜
- **端點**: `GET /api/leaderboard?limit=10`
- **認證**: 需要（Bearer Token）
- **參數**:
  - `limit` (可選): 返回的記錄數量，預設 10，最大 100
- **請求範例**:
  ```bash
  curl -H "Authorization: Bearer shooting-game-api-token-2024" \
       http://localhost:8000/api/leaderboard?limit=10
  ```
- **回應範例**:
  ```json
  {
    "entries": [
      {
        "id": 1,
        "name": "Player One",
        "score": 1500,
        "maxCombo": 12,
        "timestamp": 1702123456789
      }
    ],
    "total": 1
  }
  ```

#### 新增分數記錄
- **端點**: `POST /api/leaderboard`
- **認證**: 需要（Bearer Token）
- **請求 Body**:
  ```json
  {
    "name": "Player One",
    "score": 1500,
    "maxCombo": 12
  }
  ```
- **請求範例**:
  ```bash
  curl -X POST \
       -H "Authorization: Bearer shooting-game-api-token-2024" \
       -H "Content-Type: application/json" \
       -d '{"name":"Player One","score":1500,"maxCombo":12}' \
       http://localhost:8000/api/leaderboard
  ```
- **回應範例**:
  ```json
  {
    "id": 1,
    "name": "Player One",
    "score": 1500,
    "maxCombo": 12,
    "timestamp": 1702123456789
  }
  ```

### 認證方式 / Authentication

所有需要認證的 API 端點都必須在 HTTP Header 中包含 Bearer Token：

```
Authorization: Bearer shooting-game-api-token-2024
```

**重要**：
- Token 必須與後端 `.env` 檔案中的 `API_TOKEN` 設定一致
- 如果 token 無效或缺失，API 會返回 `401 Unauthorized`

---

## 技術棧 / Tech Stack

### 後端 / Backend

- **FastAPI** - 現代化的 Python Web 框架
- **uvicorn** - ASGI 伺服器
- **SQLAlchemy** - ORM 框架
- **PyMySQL** - MySQL 驅動程式
- **uv** - 快速的 Python 套件管理器

### 前端 / Frontend

- **React 19** - UI 框架
- **TypeScript** - 型別系統
- **Vite** - 快速的建置工具
- **pnpm** - 高效的 Node.js 套件管理器
- **Tailwind CSS** - 透過 CDN 使用

---

## 專案架構 / Project Architecture

### 後端架構 (MVC Pattern)

```
backend/
├── app/
│   ├── main.py                      # FastAPI 應用程式入口
│   ├── config.py                    # 配置管理（環境變數）
│   ├── database.py                   # 資料庫連接和初始化
│   ├── models/                      # 資料模型
│   │   ├── db_models.py             # SQLAlchemy 資料模型（LeaderboardEntryDB）
│   │   └── leaderboard.py           # Pydantic 模型（API 請求/回應）
│   ├── views/                       # API 端點（路由）
│   │   ├── auth.py                 # 認證相關端點
│   │   └── leaderboard.py          # 排行榜相關端點
│   ├── controllers/                 # 業務邏輯層
│   │   └── leaderboard_controller.py
│   ├── services/                    # 服務層
│   │   ├── auth_service.py         # 認證服務（token 驗證）
│   │   └── database_service.py     # 資料庫操作服務
│   └── utils/                       # 工具函數
│       └── auth_dependency.py      # FastAPI 認證依賴
├── pyproject.toml                   # 專案配置和依賴
├── init_db.py                       # 資料庫初始化腳本
└── README.md                        # 後端說明文件
```

### 前端架構

```
frontend/
├── App.tsx                          # 主應用程式元件
├── index.tsx                        # 應用程式入口
├── index.html                       # HTML 模板
├── components/                      # React 元件
│   └── ArcadeCanvas.tsx            # 遊戲畫布元件
├── services/                        # 服務層
│   ├── apiService.ts               # 後端 API 服務
│   └── geminiService.ts            # Gemini AI 服務
├── types.ts                         # TypeScript 型別定義
├── vite.config.ts                  # Vite 配置
├── tsconfig.json                    # TypeScript 配置
└── package.json                    # 專案配置和依賴
```

---

## 資料流程 / Data Flow

### 前端到後端

1. **用戶完成遊戲** → 前端收集分數資料
2. **前端調用 API** → `addScoreToLeaderboard()` 發送 POST 請求
3. **請求包含 Token** → `Authorization: Bearer {token}` header
4. **後端驗證 Token** → `auth_dependency.py` 驗證 token
5. **後端處理請求** → `leaderboard_controller.py` 處理業務邏輯
6. **資料庫儲存** → `database_service.py` 寫入 MySQL
7. **返回結果** → 前端更新排行榜顯示

### 排行榜載入

1. **前端載入時** → `useEffect` 調用 `getLeaderboard()`
2. **發送 GET 請求** → 帶上 Bearer Token
3. **後端查詢資料庫** → 返回排行榜資料
4. **前端顯示** → 更新 UI 顯示排行榜

---

## 開發流程 / Development Workflow

### 完整啟動流程

1. **啟動 MySQL 服務**
   ```bash
   # 確保 MySQL 正在運行
   ```

2. **啟動後端服務**（終端機 1）
   ```bash
   cd backend
   uv sync                    # 安裝依賴（首次）
   uv run python init_db.py   # 初始化資料庫（首次）
   uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

3. **啟動前端服務**（終端機 2）
   ```bash
   cd frontend
   pnpm install              # 安裝依賴（首次）
   pnpm run dev
   ```

4. **開啟瀏覽器**
   - 訪問：http://localhost:3000
   - 後端 API 文件：http://localhost:8000/docs

### 開發建議

- **後端開發**：修改後端代碼後，uvicorn 會自動重載（`--reload` 模式）
- **前端開發**：Vite 支援熱模組替換（HMR），修改後自動更新
- **API 測試**：使用 Swagger UI (http://localhost:8000/docs) 測試 API
- **資料庫查看**：使用 MySQL 客戶端工具查看資料

---

## 環境變數總覽 / Environment Variables

### 後端環境變數 (`.env`)

| 變數名稱 | 說明 | 預設值 | 必需 |
|---------|------|--------|------|
| `MYSQL_HOST` | MySQL 主機 | `localhost` | 是 |
| `MYSQL_PORT` | MySQL 端口 | `3306` | 是 |
| `MYSQL_USER` | MySQL 用戶名 | `root` | 是 |
| `MYSQL_PASSWORD` | MySQL 密碼 | (空) | 是 |
| `MYSQL_DATABASE` | 資料庫名稱 | `shooting-game` | 是 |
| `API_TOKEN` | API 認證 Token | `shooting-game-api-token-2024` | 否 |
| `CORS_ORIGINS` | 允許的 CORS 來源 | `http://localhost:5173,http://localhost:3000` | 否 |

### 前端環境變數 (`.env.local`)

| 變數名稱 | 說明 | 預設值 | 必需 |
|---------|------|--------|------|
| `GEMINI_API_KEY` | Gemini API 金鑰 | - | 是 |
| `VITE_API_BASE_URL` | 後端 API 基礎 URL | `http://localhost:8000/api` | 否 |
| `VITE_API_TOKEN` | API 認證 Token | `shooting-game-api-token-2024` | 否 |

**注意**：前端環境變數必須以 `VITE_` 開頭才能在程式碼中使用。

---

## 常見問題 / FAQ

### Q: 後端啟動失敗，顯示資料庫連接錯誤

**A**: 檢查以下項目：
1. MySQL 服務是否正在運行
2. `.env` 檔案中的資料庫設定是否正確
3. 資料庫是否已建立（執行 `CREATE DATABASE`）
4. 用戶名和密碼是否正確

### Q: 前端無法連接到後端 API

**A**: 檢查以下項目：
1. 後端服務是否正在運行（http://localhost:8000）
2. 前端 `.env.local` 中的 `VITE_API_BASE_URL` 是否正確
3. 後端 `.env` 中的 `CORS_ORIGINS` 是否包含前端 URL
4. 瀏覽器控制台是否有 CORS 錯誤

### Q: API 返回 401 Unauthorized

**A**: 檢查以下項目：
1. 前端使用的 token 是否與後端 `.env` 中的 `API_TOKEN` 一致
2. HTTP Header 是否正確：`Authorization: Bearer {token}`
3. Token 是否正確傳遞（檢查瀏覽器 Network 標籤）

### Q: 如何更改 API Token？

**A**: 
1. 修改後端 `.env` 檔案中的 `API_TOKEN`
2. 修改前端 `.env.local` 檔案中的 `VITE_API_TOKEN`（如果使用）
3. 重啟後端和前端服務

### Q: 資料庫表結構是什麼？

**A**: 目前只有一個表 `leaderboard`：
- `id`: 主鍵（自動遞增）
- `name`: 玩家名稱（VARCHAR(50)）
- `score`: 分數（INT）
- `max_combo`: 最大連擊數（INT）
- `timestamp`: 時間戳（BIGINT）
- `created_at`: 建立時間（DATETIME）

---

## 注意事項 / Important Notes

### 後端 / Backend

- ✅ 資料表會在應用程式啟動時自動建立
- ✅ 使用 `uv` 替代 `pip` 管理 Python 套件
- ✅ 所有需要認證的 API 都必須提供有效的 token
- ⚠️ 生產環境請務必更改 `API_TOKEN` 為安全的隨機字串

### 前端 / Frontend

- ✅ 需要設定 `GEMINI_API_KEY` 環境變數（用於 AI 教練評論）
- ✅ 預設運行在 port 3000
- ✅ 使用 `pnpm` 管理 Node.js 套件
- ✅ 如果後端 API 失敗，會自動 fallback 到 localStorage

### 安全性 / Security

- ⚠️ **開發環境**：使用預設 token 即可
- ⚠️ **生產環境**：務必更改 `API_TOKEN` 為強隨機字串
- ⚠️ **CORS 設定**：生產環境請限制 `CORS_ORIGINS` 為實際的前端域名
- ⚠️ **資料庫密碼**：不要將 `.env` 檔案提交到版本控制系統

---

## 授權 / License

本專案僅供學習和開發使用。

This project is for learning and development purposes only.

---

## 更新記錄 / Changelog

詳細的變更記錄請參閱 [CHANGED.md](./CHANGED.md)
