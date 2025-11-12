import "dotenv/config";
import axios from "axios";
import { createPublicClient, createWalletClient, http } from "viem";
import { sepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { promises as fs } from "fs";
import path from "path";
import { createHash } from "crypto";
const RPC_URL = process.env.RPC_URL || "https://rpc.sepolia.org";
// 兼容未加 0x 前缀的私钥输入
const RAW_PRIVATE_KEY = process.env.PRIVATE_KEY || undefined;
const PRIVATE_KEY = (RAW_PRIVATE_KEY
    ? (RAW_PRIVATE_KEY.startsWith("0x") ? RAW_PRIVATE_KEY : `0x${RAW_PRIVATE_KEY}`)
    : undefined);
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
async function loadAbi() {
    // 从前端项目共享 ABI 文件读取，避免重复维护
    const abiPath = path.join(process.cwd(), "..", "traceability-dapp", "src", "abi", "Traceability.json");
    const text = await fs.readFile(abiPath, "utf-8");
    const parsed = JSON.parse(text);
    return (parsed.abi ? parsed.abi : parsed);
}
async function fetchOffChainStatus(batchId) {
    // 示例：从占位接口拉取数据并计算哈希
    const { data } = await axios.get("https://httpbin.org/json");
    const serialized = JSON.stringify({ batchId, payload: data });
    const hashHex = createHash("sha256").update(serialized).digest("hex");
    return `0x${hashHex}`;
}
async function main() {
    if (!CONTRACT_ADDRESS)
        throw new Error("Missing CONTRACT_ADDRESS");
    if (!PRIVATE_KEY)
        throw new Error("Missing PRIVATE_KEY");
    const publicClient = createPublicClient({ chain: sepolia, transport: http(RPC_URL) });
    const account = privateKeyToAccount(PRIVATE_KEY);
    const walletClient = createWalletClient({ chain: sepolia, transport: http(RPC_URL), account });
    const TRACEABILITY_ABI = await loadAbi();
    const batchId = 1; // 示例批次 ID（uint256）
    const newStatus = 1; // 示例状态（uint8），可根据业务调整
    const statusHash = await fetchOffChainStatus(batchId);
    console.log("准备写链:", { batchId, statusHash });
    // 调用 updateStatus(batchId, statusHash)
    const txHash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: TRACEABILITY_ABI,
        functionName: "updateStatus",
        args: [batchId, newStatus, statusHash],
    });
    console.log("提交交易:", txHash);
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    console.log("确认区块:", receipt.blockNumber);
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
