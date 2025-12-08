# Shooting Game Backend

FastAPI backend for the shooting game with Firebase integration.

## 專案架構

採用 MVC (Model-View-Controller) 架構：

- **Models**: 資料模型定義（Pydantic）
- **Views**: API 端點（FastAPI routes）
- **Controllers**: 業務邏輯層
- **Services**: Firebase 服務整合層
- **Utils**: 工具函數

## 功能

- ✅ 排行榜 API（MySQL）
- ✅ Firebase Authentication 整合
- ✅ CORS 支援

## 環境設定

### 1. 安裝依賴

使用 `uv` 管理依賴：

```bash
# 安裝 uv（如果尚未安裝）
curl -LsSf https://astral.sh/uv/install.sh | sh

# 安裝專案依賴
cd backend
uv sync
```

### 2. MySQL 資料庫設定

1. 確保 MySQL 服務正在運行
2. 建立資料庫：
   ```sql
   CREATE DATABASE `shooting-game` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. 初始化資料表（執行後端時會自動建立，或手動執行）：
   ```bash
   uv run python init_db.py
   ```

### 3. Firebase 設定（僅用於 Authentication）

1. 在 [Firebase Console](https://console.firebase.google.com/) 建立專案
2. 啟用 **Authentication** 服務
3. 下載服務帳號金鑰：
   - 前往「專案設定」>「服務帳號」
   - 點擊「產生新的私密金鑰」
   - 將下載的 JSON 檔案重新命名為 `firebase-credentials.json` 並放在 `backend/` 目錄

### 4. 環境變數

複製 `.env.example` 為 `.env` 並填入設定：

```bash
cp .env.example .env
```

編輯 `.env` 檔案：

```env
# MySQL Database Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=shooting-game

# Firebase Configuration (for Authentication only)
FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json
FIREBASE_PROJECT_ID=your-project-id

# CORS Configuration
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

## 執行

### 開發模式

```bash
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 生產模式

```bash
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
```

API 文件可在以下位置查看：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API 端點

### 排行榜

- `GET /api/leaderboard?limit=10` - 取得排行榜
- `POST /api/leaderboard` - 新增分數記錄

### 認證

- `POST /api/auth/verify` - 驗證 Firebase ID token
- `GET /api/auth/user/{uid}` - 取得使用者資訊

## 專案結構

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI 應用程式入口
│   ├── config.py               # 配置管理
│   ├── models/                 # 資料模型
│   │   ├── leaderboard.py
│   │   └── user.py
│   ├── views/                  # API 端點
│   │   ├── leaderboard.py
│   │   └── auth.py
│   ├── controllers/            # 業務邏輯層
│   │   ├── leaderboard_controller.py
│   │   └── auth_controller.py
│   ├── services/               # 服務層
│   │   ├── auth_service.py       # Firebase Authentication
│   │   └── database_service.py  # MySQL Database
│   ├── database.py              # 資料庫連接配置
│   └── models/
│       └── db_models.py         # SQLAlchemy 資料模型
├── pyproject.toml
├── .env.example
└── README.md
```

## 注意事項

- ⚠️ **絕對不要**將 `firebase-credentials.json` 提交到版本控制系統
- 確保 MySQL 資料庫已建立並可連接
- 預設 MySQL 配置：username: `root`, password: (空), database: `shooting-game`
- 資料表會在應用程式啟動時自動建立

## 開發工具

- **FastAPI**: Web 框架
- **uvicorn**: ASGI 伺服器
- **SQLAlchemy**: ORM 框架
- **PyMySQL**: MySQL 驅動程式
- **firebase-admin**: Firebase Admin SDK (僅用於 Authentication)
- **uv**: Python 套件管理器

