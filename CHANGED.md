# 變更記錄 (Change Log)

## 2025-12-09 16:20:00

### 修復遊戲結束時分數為 0 和重複寫入的問題

修復遊戲結束時 SCORE 和 COMBO 顯示為 0，以及會一次寫入兩筆資料的問題。

#### 更新的檔案

- `frontend/App.tsx`:
  - 添加 `gameOverHandledRef` 來防止 `handleGameOver` 被重複調用
  - 在 `handleGameOver` 中先捕獲當前的 `score` 和 `maxCombo` 值，避免狀態更新導致值丟失
  - 在 `startGame` 中重置 `gameOverHandledRef`，確保新遊戲可以正常結束
  - 在 timer effect 中重置 `gameOverHandledRef`，並在調用 `handleGameOver` 前先清理 timer
  - 在 `saveScoreToLeaderboard` 中添加檢查，如果分數和 combo 都是 0，則跳過保存
  - 添加詳細的 console.log 來追蹤分數保存流程

#### 問題修復

- **分數為 0 的問題**：現在在改變遊戲狀態前先捕獲分數值，確保正確保存
- **重複寫入的問題**：使用 `gameOverHandledRef` 確保 `handleGameOver` 只被調用一次
- **空分數保存**：如果分數和 combo 都是 0，不會保存到排行榜

#### 改進內容

- **狀態管理**：改進狀態更新時序，確保分數值在狀態改變前被正確捕獲
- **防重複調用**：使用 ref 來追蹤是否已經處理過遊戲結束，防止重複保存
- **更好的調試**：添加詳細的日誌，方便追蹤問題

## 2025-12-09 16:15:00

### 在遊戲結束畫面添加返回主選單按鈕

在遊戲結束畫面添加"Back to Menu"按鈕，讓玩家可以方便地返回主選單。

#### 更新的檔案

- `frontend/App.tsx`:
  - 在遊戲結束畫面（GAME_OVER）的按鈕區域添加"Back to Menu"按鈕
  - 將按鈕區域改為 flex-col 布局，支持多個按鈕垂直排列
  - "Back to Menu"按鈕使用 `setGameState(GameState.MENU)` 返回主選單
  - 保持"Play Again"按鈕的功能不變

#### 改進內容

- **更好的導航**：玩家現在可以選擇直接返回主選單，而不需要先開始新遊戲
- **用戶體驗**：提供更多選項，讓玩家可以更方便地導航應用

## 2025-12-09 16:10:00

### 修復前端 API 認證 401 錯誤

修復前端調用 API 時出現的 401 (Unauthorized) 錯誤，原因是前端使用硬編碼的 token，可能與後端配置不一致。

#### 更新的檔案

- `frontend/services/apiService.ts`:
  - 移除硬編碼的 `API_TOKEN` 常量
  - 實現動態從後端 `/api/auth/token` 端點獲取 token 的機制
  - 添加 token 緩存機制，避免重複請求
  - 實現 `getApiTokenInternal()` 函數，自動獲取並緩存 token
  - 將 `getAuthHeaders()` 改為異步函數，確保使用正確的 token
  - 更新 `getLeaderboard()` 和 `addScoreToLeaderboard()` 以使用異步的 `getAuthHeaders()`
  - 添加錯誤處理和 fallback 機制，如果無法從 API 獲取 token，則使用默認值

#### 改進內容

- **動態 Token 獲取**：前端現在會自動從後端 API 獲取正確的 token，確保與後端配置一致
- **Token 緩存**：實現了 token 緩存機制，避免每次 API 調用都重新獲取 token
- **錯誤處理**：如果無法從 API 獲取 token，會使用默認值作為 fallback，確保應用仍能運行
- **更好的調試**：添加了詳細的日誌，方便追蹤 token 獲取過程

#### 問題解決

- 修復了前端調用 `/api/leaderboard` GET 和 POST 端點時出現的 401 錯誤
- 確保前端使用的 token 與後端 `.env` 文件中配置的 `API_TOKEN` 一致

## 2025-12-09 16:06:44

### 修復前端排行榜無法顯示 API 資料的問題

修復前端 HIGH SCORES 畫面無法顯示從 API 取得的排行榜資料。

#### 更新的檔案

- `frontend/App.tsx`:
  - 將 `loadLeaderboard` 函數提取出來，使其可以在多個地方調用
  - 添加新的 `useEffect`，當切換到 `LEADERBOARD` 狀態時自動重新載入排行榜資料
  - 在 `renderLeaderboardList` 中添加調試日誌，方便追蹤資料載入狀態
  - 改進 key 的生成方式，使用 `timestamp` 和 `index` 組合確保唯一性

- `frontend/services/apiService.ts`:
  - 在 `getLeaderboard` 函數中添加詳細的調試日誌
  - 改進 `timestamp` 的處理邏輯，確保正確轉換為數字類型
  - 添加更完整的錯誤處理和資料驗證

#### 改進內容

- **自動重新載入**：當用戶點擊 "Leaderboard" 按鈕時，會自動從 API 重新載入最新的排行榜資料
- **更好的資料處理**：確保 API 返回的資料格式正確轉換為前端需要的格式
- **調試支援**：添加了詳細的 console.log，方便追蹤資料載入流程
- **錯誤處理**：改進了錯誤處理邏輯，確保在 API 失敗時有適當的 fallback

## 2025-12-09 16:01:11

### 調整前端籃球位置以改善拖拽體驗

調整籃球初始位置，讓用戶更容易拖拽籃球來控制力量。

#### 更新的檔案

- `frontend/components/ArcadeCanvas.tsx`:
  - 將籃球初始 Y 位置從 `canvasHeight - 100` 調整為 `canvasHeight - 150`
  - 籃球往上移動 50 像素，提供更好的拖拽空間

#### 改進內容

- **更好的拖拽體驗**：籃球位置往上移，有更多空間可以向下拖拽來增加力量
- **視覺改善**：籃球不再太靠近底部，視覺上更平衡

## 2025-12-09 15:35:29

### 改進 Swagger UI 中 token 欄位的顯示和說明

改進 Swagger UI 中 token 欄位的顯示，明確說明 token 應從 GET /api/auth/token 獲取，並添加範例值。

#### 更新的檔案

- `backend/app/main.py`:
  - 在 `custom_openapi()` 中從 `API_TOKEN` 讀取實際 token 值
  - 在 security scheme 的 description 中添加範例 token 值
  - 為所有有 token 參數的端點添加 `example` 和更詳細的 `description`
  - 說明文字明確指向 `GET /api/auth/token` 端點

- `backend/app/views/leaderboard.py`:
  - 在 `Security()` 參數中添加 `description`，說明如何獲取 token
  - 更新 docstring，明確說明 token 從 `GET /api/auth/token` 獲取

- `backend/app/utils/auth_dependency.py`:
  - 更新 `APIKeyHeader` 的 description，明確指向 `GET /api/auth/token`

#### 改進內容

1. **Swagger UI 顯示**：
   - Token 欄位現在會顯示範例值（從 `.env` 中的 `API_TOKEN` 讀取）
   - 描述文字明確說明從 `GET /api/auth/token` 獲取 token
   - 參數描述中包含當前 token 值作為參考

2. **使用流程**：
   - 用戶可以先調用 `GET /api/auth/token` 獲取 token
   - 然後在 Swagger UI 的 Authorize 按鈕中輸入該 token
   - 或者在每個 API 請求的 Parameters 區塊中直接輸入 token

3. **範例值**：
   - OpenAPI schema 中會自動包含當前配置的 token 值作為範例
   - 方便用戶直接複製使用

#### 技術細節

- 在 `custom_openapi()` 中動態讀取 `API_TOKEN` 並添加到 schema
- 為每個 token 參數添加 `example` 屬性
- 更新所有相關的描述文字，統一指向 `GET /api/auth/token` 端點

## 2025-12-09 15:30:08

### 修復 Swagger UI 中 token 欄位不顯示的問題

修復 Swagger UI 中 token 認證欄位不顯示的問題，現在可以在 Swagger UI 中直接輸入 token 進行測試。

#### 更新的檔案

- `backend/app/main.py`:
  - 添加 `custom_openapi()` 函數來配置 OpenAPI schema
  - 添加 security scheme 配置，定義 "token" 作為 API Key header
  - 讓 Swagger UI 可以顯示 token 輸入欄位

- `backend/app/utils/auth_dependency.py`:
  - 更新 `APIKeyHeader` 添加描述，說明如何獲取 token
  - 修改 `verify_token()` 返回 `str` 而不是 `bool`，以便與 `Security()` 正確配合

- `backend/app/views/leaderboard.py`:
  - 改用 `Security(verify_token)` 替代 `Depends(verify_token)`
  - 這樣 Swagger UI 會自動顯示 token 輸入欄位
  - 簡化參數，移除重複的 token 參數

#### 改進內容

1. **Swagger UI 顯示**：
   - 現在所有需要認證的端點都會顯示 "token" 欄位
   - 用戶可以直接在 Swagger UI 中輸入 token 進行測試
   - Token 欄位有清楚的說明文字

2. **Security Scheme 配置**：
   - 在 OpenAPI schema 中定義了 "token" security scheme
   - 類型為 `apiKey`，位置在 `header`
   - 包含說明文字，引導用戶到 `/api/auth/token` 獲取 token

3. **使用方式**：
   - 在 Swagger UI 中，點擊右上角的鎖圖標
   - 輸入 token 值（從 `.env` 中的 `API_TOKEN` 或 `/api/auth/token` 端點獲取）
   - 所有需要認證的 API 會自動使用此 token

#### 技術細節

- 使用 `Security()` 而不是 `Depends()` 可以讓 FastAPI 自動在 OpenAPI schema 中標記為需要認證
- `custom_openapi()` 函數允許我們自定義 OpenAPI schema，添加 security scheme
- `APIKeyHeader` 的 `description` 參數會在 Swagger UI 中顯示為提示文字

## 2025-12-09 15:27:12

### 修改認證方式為使用 token header（從 .env 讀取）

將認證方式從 Bearer Token 改為使用 "token" header，token 從 .env 檔案讀取。

#### 更新的檔案

- `backend/app/utils/auth_dependency.py`:
  - 改用 `APIKeyHeader` 替代 `HTTPBearer`
  - Header 名稱改為 "token"（而不是 "Authorization"）
  - 簡化認證邏輯，直接從 "token" header 讀取

- `frontend/services/apiService.ts`:
  - 修改 `getAuthHeaders()` 函數
  - 改用 `'token': API_TOKEN` 替代 `'Authorization': 'Bearer ${API_TOKEN}'`
  - 所有 API 請求現在使用 "token" header

- `backend/app/views/auth.py`:
  - 更新 `/api/auth/token` 端點的訊息，說明使用 "token" header

#### 變更說明

1. **認證方式**：
   - 之前：`Authorization: Bearer {token}`
   - 現在：`token: {token}`

2. **Token 來源**：
   - Token 從 `.env` 檔案中的 `API_TOKEN` 讀取
   - 後端：`backend/.env` 中的 `API_TOKEN`
   - 前端：使用預設值或從環境變數讀取

3. **Swagger UI**：
   - 現在會顯示 "token" 欄位（而不是 "authorization"）
   - 可以直接在 Swagger UI 中輸入 token 進行測試

#### 使用方式

**後端設定**（`.env`）：
```env
API_TOKEN=your-token-here
```

**前端使用**：
```typescript
headers: {
  'token': 'your-token-here',
  'Content-Type': 'application/json'
}
```

**Swagger UI**：
- 在 "token" 欄位中輸入 token 值
- 所有需要認證的 API 會自動使用此 token

## 2025-12-09 15:15:00

### 修復 POST /api/leaderboard 的 Token 驗證問題

修復並改進 API token 驗證機制，確保 POST 請求正確傳遞和驗證 token。

#### 更新的檔案

- `frontend/services/apiService.ts`:
  - 在 `addScoreToLeaderboard()` 中添加調試日誌
  - 改進錯誤處理，顯示更詳細的錯誤訊息
  - 確認 token 是否正確包含在請求 headers 中

- `backend/app/utils/auth_dependency.py`:
  - 改進 `verify_token()` 依賴函數
  - 添加 fallback 機制，支援從 `HTTPBearer` 或直接從 `Authorization` header 讀取 token
  - 添加更清楚的錯誤訊息（當 token 缺失時）
  - 添加日誌記錄，方便調試 token 驗證問題
  - 設置 `HTTPBearer(auto_error=False)` 以允許手動處理錯誤

#### 改進內容

1. **Token 讀取機制**：
   - 優先從 `HTTPBearer` 讀取 token
   - 如果沒有，則從 `Authorization` header 手動解析
   - 支援 `Bearer {token}` 格式

2. **錯誤處理**：
   - 當 token 缺失時，返回清楚的錯誤訊息
   - 當 token 無效時，記錄警告日誌
   - 前端顯示更詳細的錯誤訊息

3. **調試支援**：
   - 前端添加 console.log 顯示請求 headers（開發環境）
   - 後端添加日誌記錄 token 驗證過程

#### 技術細節

- 使用 `HTTPBearer(auto_error=False)` 允許手動處理認證錯誤
- 添加 `authorization: Optional[str] = Header(None)` 作為 fallback
- 改進錯誤訊息，幫助開發者快速定位問題

## 2025-12-09 15:06:55

### 更新 README.md 使其更清楚完整

重寫 README.md，使其更清楚、更完整地說明專案設定和使用方式。

#### 更新內容

1. **更清楚的結構**：
   - 重新組織章節順序
   - 添加詳細的步驟說明
   - 使用表格整理環境變數

2. **完整的 API 文件**：
   - 詳細說明每個 API 端點
   - 提供請求/回應範例
   - 說明認證方式和使用方法

3. **環境變數總覽**：
   - 後端環境變數表格
   - 前端環境變數表格
   - 說明每個變數的用途和預設值

4. **資料流程說明**：
   - 前端到後端的資料流程
   - 排行榜載入流程

5. **常見問題 (FAQ)**：
   - 資料庫連接問題
   - API 連接問題
   - 認證問題
   - Token 設定問題

6. **開發流程**：
   - 完整的啟動流程
   - 開發建議
   - 測試方法

7. **安全性注意事項**：
   - 開發環境 vs 生產環境
   - Token 安全建議
   - CORS 設定建議

#### 改進重點

- ✅ 更清楚的安裝步驟
- ✅ 完整的 API 文件
- ✅ 環境變數總覽表格
- ✅ 常見問題解答
- ✅ 資料流程圖解
- ✅ 安全性建議

## 2025-12-09 14:44:37

### 簡化認證系統為固定 Token 並整合前端 API

將認證系統從 JWT + users 表簡化為固定 token 驗證，並讓前端可以調用後端 API 寫入排行榜。

#### 後端變更

**移除的檔案**：
- `app/services/user_service.py` - 用戶資料庫服務
- `app/controllers/auth_controller.py` - 認證控制器
- `app/models/user.py` - 用戶 Pydantic 模型

**更新的檔案**：
- `app/config.py`: 
  - 移除 JWT 和用戶相關配置
  - 新增 `API_TOKEN` 配置（預設：`shooting-game-api-token-2024`）
- `app/services/auth_service.py`: 
  - 簡化為固定 token 驗證
  - 移除 JWT、密碼雜湊等複雜邏輯
  - 只保留 `verify_token()` 方法
- `app/utils/auth_dependency.py`: 
  - 簡化為 `verify_token()` 依賴
  - 移除用戶資訊返回
- `app/views/auth.py`: 
  - 移除登入端點
  - 新增 `/api/auth/token` 端點（獲取 API token）
  - 新增 `/api/auth/verify` 端點（驗證 token，不需要認證）
- `app/views/leaderboard.py`: 
  - 更新認證依賴為 `verify_token`
- `app/models/db_models.py`: 
  - 移除 `UserDB` 模型
- `app/database.py`: 
  - 移除用戶創建邏輯
- `init_db.py`: 
  - 移除用戶初始化邏輯
- `pyproject.toml`: 
  - 移除 `python-jose[cryptography]` 和 `passlib[bcrypt]` 依賴

#### 前端變更

**新增的檔案**：
- `services/apiService.ts` - 後端 API 服務
  - `getLeaderboard()` - 獲取排行榜
  - `addScoreToLeaderboard()` - 新增分數
  - `getApiToken()` - 獲取 API token

**更新的檔案**：
- `App.tsx`: 
  - 整合後端 API 服務
  - 更新 `useEffect` 從後端載入排行榜
  - 更新 `saveScoreToLeaderboard()` 使用後端 API
  - 保留 localStorage 作為 fallback
- `vite.config.ts`: 
  - 移除不必要的環境變數定義

#### 認證機制

- **固定 Token**: `shooting-game-api-token-2024`（可透過環境變數 `API_TOKEN` 設定）
- **Token 使用方式**: 在 HTTP Header 中使用 `Authorization: Bearer {token}`
- **API 端點**:
  - `GET /api/auth/token` - 獲取 API token（不需要認證）
  - `GET /api/auth/verify?token=xxx` - 驗證 token（不需要認證）
  - `GET /api/leaderboard` - 獲取排行榜（需要認證）
  - `POST /api/leaderboard` - 新增分數（需要認證）

#### 前端 API 整合

- 前端預設使用 `http://localhost:8000/api` 作為後端 API 基礎 URL
- 前端預設使用 `shooting-game-api-token-2024` 作為認證 token
- 所有 API 請求都會自動帶上 `Authorization: Bearer {token}` header
- 如果後端 API 失敗，會自動 fallback 到 localStorage

#### 注意事項

- 所有需要認證的 API 都必須在 Header 中帶上有效的 token
- Token 驗證失敗會返回 401 Unauthorized
- 前端會自動處理 API 錯誤並 fallback 到 localStorage

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

