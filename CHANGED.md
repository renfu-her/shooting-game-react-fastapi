# 變更記錄 (Change Log)

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

