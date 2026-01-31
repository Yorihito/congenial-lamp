# Azure Infrastructure for 心の距離マップ

このディレクトリにはAzure環境のInfrastructure as Code (IaC) テンプレートが含まれています。

## 構成

- `main.bicep`: メインテンプレート
- `modules/`: 個別リソースモジュール
  - `storage-account.bicep`: Storage Account + Table Storage
  - `function-app.bicep`: Azure Functions
  - `app-insights.bicep`: Application Insights
  - `key-vault.bicep`: Key Vault
  - `static-web-app.bicep`: Static Web Apps
- `parameters/`: 環境別パラメータファイル

## デプロイ手順

### 前提条件

```bash
# Azure CLIのインストール確認
az --version

# Azureにログイン
az login

# サブスクリプション設定
az account set --subscription "<subscription-id>"
```

### リソースグループ作成

```bash
# Development環境
az group create \
  --name rg-koro-map-dev \
  --location japaneast

# Production環境
az group create \
  --name rg-koro-map-prod \
  --location japaneast
```

### デプロイ実行

```bash
# Development環境
az deployment group create \
  --resource-group rg-koro-map-dev \
  --template-file main.bicep \
  --parameters @parameters/dev.parameters.json

# Production環境
az deployment group create \
  --resource-group rg-koro-map-prod \
  --template-file main.bicep \
  --parameters @parameters/prod.parameters.json
```

### What-If検証（デプロイ前確認）

```bash
az deployment group what-if \
  --resource-group rg-koro-map-dev \
  --template-file main.bicep \
  --parameters @parameters/dev.parameters.json
```

## 作成されるリソース

| リソース | 用途 | SKU/プラン |
|---------|-----|----------|
| Static Web Apps | フロントエンドホスティング | Free |
| Azure Functions | バックエンドAPI | Consumption |
| Storage Account | Table Storage + Functions runtime | Standard_LRS |
| Application Insights | 監視・ロギング | Pay-as-you-go |
| Key Vault | シークレット管理 | Standard |

## コスト見積もり

- **Development**: 月額 ¥0〜100
- **Production (1000ユーザー)**: 月額 ¥1,500〜3,000

詳細は [architecture-design.md](../docs/architecture-design.md) を参照。

## 注意事項

- Static Web Appsの`deploymentToken`はGitHub Actionsで使用するため、出力値を GitHub Secrets に登録してください
- Key Vaultへのシークレット登録は手動またはCI/CDで別途実施が必要です
- Azure AD B2Cは現在Bicepで作成できないため、手動セットアップが必要です
