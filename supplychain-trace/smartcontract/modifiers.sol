// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SimpleSupplyChainWithModifiers
 * @dev 在保持原始合约结构基础上加入流程控制修饰符（modifiers）和状态记录。
 */
contract SimpleSupplyChainWithModifiers {

    /// @dev 流程阶段定义
    enum Stage {
        Uninitialized,
        Produced,
        Collected,
        Declared,
        RetailReady
    }

    /// @dev 当前所处阶段
    Stage public currentStage;

    /// @dev 记录每个阶段进入的时间戳
    mapping(Stage => uint256) public stageTimestamps;

    /**
     * @dev 合约部署时初始化流程为 Uninitialized 阶段
     */
    constructor() {
        currentStage = Stage.Uninitialized;
        stageTimestamps[currentStage] = block.timestamp;
    }

    // =============== modifier ===============

    /**
     * @dev 检查当前阶段是否匹配，执行后自动推进并记录时间
     * @param expected 当前函数应处于的阶段
     */
    modifier atStage(Stage expected) {
        require(currentStage == expected, "Invalid stage for this operation.");
        _;
        // 自动推进到下一个阶段
        currentStage = Stage(uint(currentStage) + 1);
        stageTimestamps[currentStage] = block.timestamp;
    }

    // =============== Function ===============

    /// @notice 执行“生产”阶段
    function produce() external atStage(Stage.Uninitialized) {
        // 可添加生产逻辑
    }

    /// @notice 执行“收集”阶段
    function collect() external atStage(Stage.Produced) {
        // 可添加收集逻辑
    }

    /// @notice 执行“报关”阶段
    function declareCustoms() external atStage(Stage.Collected) {
        // 可添加报关逻辑
    }

    /// @notice 执行“零售”阶段
    function retail() external atStage(Stage.Declared) {
        // 可添加零售逻辑
    }

    // =============== 只读辅助函数 ===============

    /// @notice 获取某阶段的时间戳（0 表示尚未到达）
    function getStageTimestamp(Stage stage) external view returns (uint256) {
        return stageTimestamps[stage];
    }
}
