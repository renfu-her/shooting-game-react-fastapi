# Shooting Game Backend

FastAPI backend for the shooting game.

## 專案架構

採用 MVC (Model-View-Controller) 架構：

- **Models**: 資料模型定義（Pydantic）
- **Views**: API 端點（FastAPI routes）
- **Controllers**: 業務邏輯層
- **Services**: 資料庫服務整合層
- **Utils**: 工具函數

## 功能

- ✅ 排行榜 API（MySQL）
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

### 3. 環境變數

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

# CORS Configuration
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

## 執行

### 開發模式

使用 uvicorn（支援熱重載）：

```bash
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 生產模式

#### 使用 Gunicorn（推薦）

Gunicorn 是一個生產級的 WSGI HTTP 伺服器，適合部署到生產環境：

```bash
# 使用配置文件
uv run gunicorn app.main:app -c gunicorn_config.py

# 或直接指定參數
uv run gunicorn app.main:app \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000 \
    --timeout 30 \
    --access-logfile - \
    --error-logfile -
```

#### 使用 Uvicorn（簡單部署）

```bash
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
```

#### Gunicorn 配置說明

配置文件 `gunicorn_config.py` 支援以下環境變數：

- `GUNICORN_BIND`: 綁定地址和端口（預設: `0.0.0.0:8000`）
- `GUNICORN_WORKERS`: Worker 進程數量（預設: CPU 核心數 × 2 + 1）
- `GUNICORN_ACCESS_LOG`: 訪問日誌路徑（預設: stdout，使用 `-` 表示）
- `GUNICORN_ERROR_LOG`: 錯誤日誌路徑（預設: stderr，使用 `-` 表示）
- `GUNICORN_LOG_LEVEL`: 日誌級別（預設: `info`）

範例：

```bash
# 使用自定義配置
export GUNICORN_WORKERS=8
export GUNICORN_BIND=0.0.0.0:8080
export GUNICORN_ACCESS_LOG=/var/log/shooting-game/access.log
export GUNICORN_ERROR_LOG=/var/log/shooting-game/error.log
uv run gunicorn app.main:app -c gunicorn_config.py
```

API 文件可在以下位置查看：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API 端點

### 排行榜

- `GET /api/leaderboard?limit=10` - 取得排行榜
- `POST /api/leaderboard` - 新增分數記錄

## 專案結構

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI 應用程式入口
│   ├── config.py               # 配置管理
│   ├── models/                 # 資料模型
│   │   └── leaderboard.py
│   ├── views/                  # API 端點
│   │   └── leaderboard.py
│   ├── controllers/            # 業務邏輯層
│   │   └── leaderboard_controller.py
│   ├── services/               # 服務層
│   │   └── database_service.py  # MySQL Database
│   ├── database.py              # 資料庫連接配置
│   └── models/
│       └── db_models.py         # SQLAlchemy 資料模型
├── pyproject.toml
├── .env.example
└── README.md
```

## 注意事項

- 確保 MySQL 資料庫已建立並可連接
- 預設 MySQL 配置：username: `root`, password: (空), database: `shooting-game`
- 資料表會在應用程式啟動時自動建立

## 開發工具

- **FastAPI**: Web 框架
- **uvicorn**: ASGI 伺服器（開發用）
- **gunicorn**: WSGI HTTP 伺服器（生產用）
- **SQLAlchemy**: ORM 框架
- **PyMySQL**: MySQL 驅動程式
- **uv**: Python 套件管理器

