# 變更記錄 (Change Log)

## 2025-12-09 12:17:19

### 實作 JWT 認證系統並將用戶資料存入資料庫

實作完整的 JWT 認證系統，將用戶認證資訊存儲在資料庫中，而非硬編碼。

#### 新增的檔案
- `app/models/user.py` - 認證相關的 Pydantic 模型（LoginRequest, TokenResponse, UserInfo）
- `app/services/user_service.py` - 用戶資料庫操作服務
- `app/controllers/auth_controller.py` - 認證業務邏輯控制器
- `app/views/auth.py` - 認證 API 端點（/api/auth/login, /api/auth/user）
- `app/utils/auth_dependency.py` - 認證依賴（用於保護 API 端點）

#### 更新的檔案
- `app/models/db_models.py`: 
  - 新增 `UserDB` 模型（users 資料表）
  - 包含欄位：id, email, password_hash, is_active, created_at, updated_at
- `app/services/auth_service.py`: 
  - 移除硬編碼的認證邏輯
  - 保留 JWT token 生成和驗證功能
  - 保留密碼雜湊功能
- `app/controllers/auth_controller.py`: 
  - 修改 `login` 方法從資料庫驗證用戶
  - 使用 `UserService` 進行用戶驗證
- `app/views/auth.py`: 
  - 新增 `/api/auth/login` 端點（不需要認證）
  - 新增 `/api/auth/user` 端點（需要認證，用於驗證 token）
  - 使用資料庫 session
- `app/views/leaderboard.py`: 
  - 所有端點都加上認證保護（使用 `get_current_user` dependency）
- `app/utils/auth_dependency.py`: 
  - 實作 `get_current_user` 依賴，用於保護需要認證的 API
- `app/config.py`: 
  - 新增 JWT 配置（JWT_SECRET_KEY, JWT_ALGORITHM, JWT_ACCESS_TOKEN_EXPIRE_MINUTES）
  - 新增預設用戶配置（DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD）僅用於初始化
- `app/database.py`: 
  - 更新 `init_db()` 函數，自動創建預設管理員用戶
- `app/main.py`: 
  - 註冊 auth router
- `pyproject.toml`: 
  - 新增依賴：python-jose[cryptography], passlib[bcrypt]
- `init_db.py`: 
  - 更新初始化腳本，創建預設管理員用戶

#### 功能說明
1. **用戶認證流程**：
   - 用戶使用 email 和 password 登入（`POST /api/auth/login`）
   - 系統從資料庫驗證用戶資訊
   - 驗證成功後產生 JWT token
   - 返回 token 和用戶資訊

2. **API 保護**：
   - 所有 API 端點（除了 `/api/auth/login` 和 `/api/auth/user`）都需要認證
   - 使用 Bearer token 在 Authorization header 中傳遞
   - Token 驗證失敗會返回 401 Unauthorized

3. **預設用戶**：
   - Email: `renfu.her@gmail.com`
   - Password: `Admin@Qwe135#`
   - 在資料庫初始化時自動創建（如果不存在）

4. **資料庫結構**：
   - 新增 `users` 資料表
   - 密碼使用 bcrypt 雜湊存儲
   - 支援用戶啟用/停用狀態

#### 技術細節
- JWT token 預設有效期：24 小時（1440 分鐘）
- 使用 HS256 演算法簽名
- 密碼使用 bcrypt 雜湊
- Token 包含用戶 email（sub claim）

#### 注意事項
- 預設用戶僅在首次初始化時創建
- 所有 API（除了認證相關）都需要有效的 JWT token
- Token 過期後需要重新登入

## 2025-12-09 12:12:32

### 移除 Firebase 認證功能

根據需求移除後端所有 Firebase 相關功能。

#### 移除的檔案
- `app/services/auth_service.py` - Firebase Authentication 服務
- `app/controllers/auth_controller.py` - 認證控制器
- `app/views/auth.py` - 認證 API 端點
- `app/models/user.py` - 使用者資料模型

#### 更新的檔案
- `app/main.py`: 
  - 移除 auth router 註冊
  - 移除 Firebase 相關描述
- `app/config.py`: 移除 Firebase 配置（FIREBASE_CREDENTIALS_PATH, FIREBASE_PROJECT_ID）
- `app/models/__init__.py`: 移除 User 模型導入
- `pyproject.toml`: 
  - 移除 firebase-admin 依賴
  - 更新專案描述，移除 Firebase 相關說明
- `README.md`: 
  - 移除 Firebase 設定步驟
  - 移除認證 API 端點說明
  - 移除 Firebase 相關技術棧說明
  - 更新專案架構圖，移除 auth 相關檔案
  - 移除 firebase-credentials.json 注意事項

#### 保留的功能
- ✅ 排行榜 API（MySQL）
- ✅ MySQL 資料庫整合

#### 影響
- 後端不再需要 Firebase 服務帳號金鑰
- 不再提供認證相關 API 端點
- 簡化後端架構，專注於排行榜功能

## 2025-12-09 12:10:44

### 新增根目錄 README.md

建立完整的專案說明文件，包含前後臺設定指南。

#### 新增的檔案
- `README.md` - 根目錄專案說明文件

#### 內容包含
1. **專案結構說明**
   - 專案目錄結構
   - 技術棧介紹

2. **後端設定指南**
   - uv 安裝說明
   - MySQL 資料庫設定
   - Firebase 設定步驟
   - 環境變數配置
   - 啟動方式（開發/生產模式）

3. **前端設定指南**
   - pnpm 安裝說明
   - 環境變數設定（GEMINI_API_KEY）
   - 開發伺服器啟動
   - 建置與預覽

4. **API 端點說明**
   - 排行榜 API
   - 認證 API

5. **專案架構說明**
   - 後端 MVC 架構
   - 前端元件結構

6. **注意事項**
   - 安全性提醒
   - 圖片上傳功能說明
   - 開發流程

#### 文件特色
- 雙語支援（繁體中文 / English）
- 完整的設定步驟
- 清晰的專案結構說明
- 實用的開發流程指南

## 2025-12-08 16:21:16

### 新增 FastAPI 後端與 Firebase 整合

建立完整的 FastAPI 後端架構，採用 MVC 模式，並整合 Firebase 服務。

#### 專案結構
- 使用 `uv` 作為 Python 套件管理器
- 建立 MVC 架構：
  - `app/models/`: 資料模型（LeaderboardEntry, User）
  - `app/views/`: API 端點（leaderboard, auth, upload）
  - `app/controllers/`: 業務邏輯層
  - `app/services/`: Firebase 服務整合（Firestore, Auth, Storage）
  - `app/utils/`: 工具函數（圖片處理）

#### 功能實作
1. **排行榜 API**
   - `GET /api/leaderboard`: 取得排行榜（Top 10）
   - `POST /api/leaderboard`: 新增分數記錄
   - 使用 Firestore 儲存資料

2. **Firebase Authentication**
   - `POST /api/auth/verify`: 驗證 Firebase ID token
   - `GET /api/auth/user/{uid}`: 取得使用者資訊

3. **圖片上傳功能**
   - `POST /api/upload`: 上傳圖片（需要認證）
     - 自動轉換為 webp 格式
     - 使用 UUID 作為檔名
     - 支援刪除舊圖片（透過 `old_file_path` 參數）
   - `DELETE /api/upload/{file_path}`: 刪除圖片

#### 技術細節
- FastAPI 框架
- Firebase Admin SDK 整合
- Pillow 圖片處理（轉換為 webp）
- CORS 中間件設定
- 環境變數配置管理

#### 配置檔案
- `pyproject.toml`: uv 專案配置，包含所有依賴
- `.env.example`: 環境變數範例
- `.gitignore`: 排除敏感檔案（firebase-credentials.json）
- `README.md`: 完整的設定與使用說明

#### 注意事項
- 需要 Firebase 專案設定（Firestore, Authentication）
- 需要下載 Firebase 服務帳號金鑰

## 2025-12-08 16:30:00

### 移除 Firebase Storage 功能

根據需求移除 Firebase Storage 相關功能：

#### 移除的檔案
- `app/services/storage_service.py` - Firebase Storage 服務
- `app/controllers/upload_controller.py` - 圖片上傳控制器
- `app/views/upload.py` - 圖片上傳 API 端點

#### 更新的檔案
- `app/main.py`: 移除 upload router 註冊
- `app/config.py`: 移除 Storage 相關配置（FIREBASE_STORAGE_BUCKET, UPLOAD_DIR, MAX_UPLOAD_SIZE）
- `app/services/firebase_service.py`: 移除 storage 導入和 storageBucket 配置
- `pyproject.toml`: 移除不需要的依賴（python-multipart, pillow）
- `README.md`: 更新文檔，移除所有 Storage 相關說明
- `.env.example`: 移除 FIREBASE_STORAGE_BUCKET 配置

#### 保留的功能
- ✅ 排行榜 API（Firestore）
- ✅ Firebase Authentication 整合

## 2025-12-08 17:55:00

### 將排行榜從 Firestore 改為 MySQL

將排行榜資料儲存從 Firebase Firestore 改為 MySQL 資料庫。

#### 新增的檔案
- `app/database.py` - SQLAlchemy 資料庫連接配置
- `app/models/db_models.py` - SQLAlchemy 資料模型（LeaderboardEntryDB）
- `app/services/database_service.py` - MySQL 資料庫服務（取代 FirestoreService）
- `init_db.py` - 資料庫初始化腳本

#### 移除的檔案
- `app/services/firestore_service.py` - Firestore 服務（已改用 MySQL）

#### 更新的檔案
- `app/config.py`: 新增 MySQL 配置（MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE）
- `app/controllers/leaderboard_controller.py`: 改用 DatabaseService 取代 FirestoreService
- `app/models/leaderboard.py`: 更新 id 欄位說明
- `app/main.py`: 新增資料庫初始化
- `pyproject.toml`: 新增依賴（sqlalchemy, pymysql, cryptography）
- `README.md`: 更新文檔，說明 MySQL 設定

#### MySQL 配置
- username: `root`
- password: (空)
- database: `shooting-game`
- 資料表會在應用程式啟動時自動建立

## 2025-12-08 17:56:00

### 移除 firebase_service.py

將 Firebase 初始化邏輯整合到 `auth_service.py`，移除獨立的 `firebase_service.py`。

#### 移除的檔案
- `app/services/firebase_service.py` - Firebase 初始化服務

#### 更新的檔案
- `app/services/auth_service.py`: 整合 Firebase 初始化邏輯（`_initialize_firebase()` 函數）
- `app/main.py`: 移除 Firebase 初始化（改為在需要時自動初始化）
- `README.md`: 更新專案結構說明

