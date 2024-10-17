# 部署状态通知 GitHub Action

此 GitHub Action 用于将部署状态通知发送到指定的 URL，通常用于 CI/CD 工作流中，通知用户部署流程的成功或失败。

## 使用方法

在您的工作流 YAML 文件中使用该 Action：

```yaml
name: 部署并发送通知

on:
  push:
    branches:
      - main
      - beta

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: 执行部署脚本
        run: |
          # 在这里运行您的部署脚本
          echo "正在部署项目..."

      - name: 发送部署状态通知
        uses: username/action-weixin-notify@v1
        with:
          notify-url: ${{ secrets.NOTIFY_URL }}
          notify-project: '您的项目名称'
          deploy-success: 'false' # 成功时为 'true'
```

## 输入参数

- `notify-url`: **必需** 通知发送的目标 URL。建议将其作为密钥（secret）传递以保证安全。

- `notify-project`: **必需** 通知消息中显示的项目名称。

- `deploy-success`: **必需** 表示部署是否成功的布尔字符串。使用 `'true'` 或 `'false'`。
