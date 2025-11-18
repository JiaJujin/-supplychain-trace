# Oracle 微服务（示例脚手架）

此服务演示：
- 定时拉取企业/物流/检测等 Off-chain 数据（示例用占位 URL）。
- 计算状态哈希，调用合约的 `updateStatus` 或写入文档哈希。

## 使用

1. 在本目录创建 `.env`（可参考 `.env.example`）。
2. 安装依赖：`npm i`（在 `oracle/` 目录下）。
3. 启动：`npm run start`。

## 环境变量

- `RPC_URL`：Sepolia RPC
- `PRIVATE_KEY`：Oracle 签名账户私钥（只用于写链）
- `CONTRACT_ADDRESS`：目标合约地址