# 認証フロー

## ユーザ登録 → ユーザ仮登録 → 本登録のフロー

### フロントエンド URL

- `/register` 新規会員登録 情報入力
- `/register/confirm` 新規会員登録 情報確認
- `/register/complete` 新規会員登録 登録完了
- `/auth/confirmation?token=<TOKEN>` 認証メールに記載の URL

### バックエンド URL

- POST `/api/v1/register` ユーザ登録
- POST `/api/v1/auth/confirmation/verify` 本認証

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant Frontend as フロントエンド
    participant API as APIサーバー（Rails/Devise）
    participant Mail as メール

    %% Step 0: ユーザ登録フォームにアクセス
    User->>Frontend: `/register` 画面でユーザ登録フォーム入力、「確認画面に進む」ボタン

    %% Step 1: ユーザー登録フォーム確認・送信
    Frontend->>User: `/register/confirm` 確認画面を表示
    User->>Frontend: 「登録する」ボタンが押された

    Frontend->>API: POST /api/v1/register<br>{ "email": "user@example.com", "first_name": "****", ... }
    API->>API: ユーザー作成処理

    alt エラー[準異常系]
        API-->>Frontend: (例){ "message": "Email is already Exist" }
        Frontend->>User: 同じ画面でエラーメッセージを表示
    else 仮登録完了[正常系]
        %% Step 2: 認証メール送信（トークンに有効期限を付与）
        API->>API: confirmation_token生成・有効期限設定・DB保存
        API->>Mail: 認証メール送信（リンク: /auth/confirmation?token=<TOKEN>）
        API-->>Frontend: { "message": "Registration successful", "status": "success" }

        %% Step 3: 仮登録完了画面にリダイレクト
        Frontend->>User: `/register/complete` 仮登録完了画面にリダイレクト<br>「登録が完了しました。確認メールを送信しました」など表示<br>「買い物へ戻る」ボタンで トップページに遷移

        %% Step 4: ユーザーに結果表示
        Mail->>User: 認証メール受信（リンククリック待ち）

        %% Step 5: ユーザーが認証メールのリンクをクリック
        User->>Frontend: 認証リンククリック（/auth/confirmation?token=<TOKEN>）
        Frontend->>Frontend: URLからconfirmation_token取得

        %% Step 6: トークン確認API呼び出し
        Frontend->>API: POST /api/v1/auth/confirmation/verify<br>{ "confirmation_token": "<TOKEN>" }
        API->>API: トークン検証（有効期限もチェック）

        alt トークン有効・期限内
            API->>API: confirmed_at更新・トークン削除
            API-->>Frontend: successのメッセージ、及び認証トークンを返す<br>{ "message": "Email confirmed successfully", "status": "success","access_token": "token", "refresh_token": "token" }
            Frontend->>User: トップページにリダイレクト（ログイン済みとして）<br>「メールアドレスの確認が完了しました」表示
        else トークン無効・期限切れ
            API-->>Frontend: { "message": "Token invalid or expired", "status": "error" }
            Frontend->>Frontend: ログイン画面にリダイレクト
            Frontend->>User: エラーメッセージ表示
        end
    end
```

## ログイン

### フロントエンド URL

- `/auth` `/auth/login` ログイン画面
- `/auth/confirmation?token=<TOKEN>` 認証メールに記載の URL

### バックエンド URL

- POST `/api/v1/login` ログイン
- POST `/api/v1/auth/confirmation` 認証 URL 再送信
- POST `/api/v1/auth/confirmation/verify` 本認証

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant Frontend as フロントエンド
    participant API as APIサーバー（Rails/Devise）
    participant Mail as メール

    %% Step 0: ユーザがログイン
    User->>Frontend: `/auth` `/auth/login` メールとパスワードでログイン
    Frontend->>API: POST /api/v1/login<br>{ "email": "user@example.com", password: "password" }

    alt ログイン成功[正常系]
        API-->>Frontend: 200 OK ログイン成功
        Frontend->>User: トップページにリダイレクト
    else ログイン失敗・仮登録ユーザである場合
        alt ログイン失敗
            API-->>Frontend: { "message": "Token invalid or expired", "status": "error" }
            Frontend->>User: エラーメッセージを出す
        else 本登録でない（仮登録でログインしようとした）
            API-->>Frontend: { "message": "Authentication not verified", status: "error" }
            Frontend->>User: ダイアログを起動し「認証メールをご確認ください」を出す
            Frontend->>User: ダイアログに「確認メールを再送」ボタンを用意

            %% Step 1: ユーザーが「確認メールを再送」クリック
            User->>Frontend: 「確認メールを再送」ボタンをクリック
            Frontend->>Frontend: メールアドレス取得（フォーム/ログイン情報）

            %% Step 2: APIリクエスト送信（再送）
            Frontend->>API: POST /api/v1/auth/confirmation<br>{ "email": "user@example.com" }
            API->>API: ユーザー検索(email)
            alt 未確認ユーザー
                API->>API: confirmation_token生成・DB保存
                API->>Mail: 確認メール送信（リンク: /auth/confirmation?token=<TOKEN>）
                API-->>Frontend: { "message": "Confirmation email sent successfully", "status": "success" }
            else 既に確認済み
                API-->>Frontend: { "message": "Email already confirmed", "status": "error" }
            end

            %% Step 3: ユーザーがメールリンクをクリック
            Mail->>User: メール送信（確認リンク）
            User->>Frontend: リンククリック（/auth/confirmation?token=<TOKEN>）
            Frontend->>Frontend: URLからconfirmation_token取得

            %% Step 4: トークン確認API呼び出し
            Frontend->>API: POST /api/v1/auth/confirmation/verify<br>{ "confirmation_token": "<TOKEN>" }
            API->>API: トークン検証
            alt トークン有効
                API->>API: confirmed_at更新・トークン削除
                API-->>Frontend: successのメッセージ、及び認証トークンを返す<br>{ "message": "Email confirmed successfully", "status": "success","access_token": "token", "refresh_token": "token" }
                Frontend->>User: トップページにリダイレクト（ログイン済みとして）<br>「メールアドレスの確認が完了しました」表示
            else トークン無効・期限切れ
                API-->>Frontend: { "message": "Token invalid or expired", "status": "error" }
                Frontend->>Frontend: ログイン画面にリダイレクト
                Frontend->>User: エラーメッセージ表示・再送ボタン提示
            end
        end
    end


```

## パスワードを忘れた場合のフロー

### フロントエンド URL

- `/auth` `/auth/login` ログイン画面
- `/auth/forgot-password` パスワードリセット用メールアドレス入力フォーム
- `/auth/reset-password?token=<TOKEN>` パスワードリセット画面（パスワードリセットメールで受信）

### バックエンド URL

- POST `/api/v1/login` ログイン
- POST `/api/v1/auth/forgot-password` パスワード初期化リクエスト
- POST `/api/v1/auth/reset-password` リセットパスワード

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant Frontend as フロントエンド
    participant API as APIサーバー（Rails/Devise）
    participant Mail as メール

    %% Step 0: ログイン画面で「パスワードを忘れた」クリック
    User->>Frontend: `/auth` `/auth/login` 画面で「パスワードを忘れた」クリック

    %% Step 1: パスワードリセット用メールアドレス入力フォーム表示
    Frontend->>User: `/auth/forgot-password` パスワードリセット用メールアドレス入力フォーム表示
    User->>Frontend: メールアドレス入力・送信

    %% Step 2: APIへリクエスト送信
    Frontend->>API: POST /api/v1/auth/forgot-password<br>{ "email": "user@example.com" }
    API->>API: メールアドレス検索

    alt メールアドレスが登録済み
        API->>API: パスワードリセット用トークン生成・有効期限設定・DB保存
        API->>Mail: パスワードリセットメール送信（リンク: /auth/reset-password?token=<TOKEN>）
        API-->>Frontend: { "message": "Password reset email sent", "status": "success" }
        Frontend->>User: 「パスワードリセットメールを送信しました」など表示

        %% Step 3: ユーザーがメール内のリセットURLクリック
        Mail->>User: パスワードリセットメール受信
        User->>Frontend: リンククリック（/auth/reset-password?token=<TOKEN>）
        Frontend->>Frontend: URLからreset_token取得

        %% Step 4: 新しいパスワード入力フォーム表示
        Frontend->>User: 新しいパスワード入力フォーム表示
        User->>Frontend: 新しいパスワード入力・送信

        %% Step 5: APIへパスワード更新リクエスト
        Frontend->>API: POST /api/v1/auth/reset-password<br>{ "reset_token": "<TOKEN>", "new_password": "****" }
        API->>API: トークン検証・パスワード更新

        alt 更新成功
            API-->>Frontend: { "message": "Password reset successful", "status": "success" }
            Frontend->>User: パスワードリセット完了通知(`/auth/login` 画面に遷移)
        else 更新失敗
            API-->>Frontend: { "message": "Token invalid or expired", "status": "error" }
            Frontend->>User: エラーメッセージ表示
        end
    else メールアドレス未登録
        API-->>Frontend: { "message": "Email not found", "status": "error" }
        Frontend->>User: エラーメッセージ表示（メールアドレス未登録）
    end
```
