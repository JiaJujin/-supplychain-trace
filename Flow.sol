// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SimpleSupplyChain
 * @dev 简化版供应链流程合约，只允许按顺序调用每个阶段函数。
 */
contract SimpleSupplyChain {

    /// @dev 流程阶段
    enum Stage {
        Uninitialized,
        Produced,
        Collected,
        Declared,
        RetailReady
    }

    /// @dev 当前阶段
    Stage public currentStage;

    /**
     * @dev 初始化阶段为 Uninitialized
     */
    constructor() {
        currentStage = Stage.Uninitialized;
    }

    /// @dev 执行“生产”阶段
    function produce() external {
        require(currentStage == Stage.Uninitialized, "Must start from Uninitialized.");
        currentStage = Stage.Produced;
    }

    /// @dev 执行“收集”阶段
    function collect() external {
        require(currentStage == Stage.Produced, "Must produce before collecting.");
        currentStage = Stage.Collected;
    }

    /// @dev 执行“报关”阶段
    function declareCustoms() external {
        require(currentStage == Stage.Collected, "Must collect before declaring.");
        currentStage = Stage.Declared;
    }

    /// @dev 执行“零售”阶段
    function retail() external {
        require(currentStage == Stage.Declared, "Must declare before retail.");
        currentStage = Stage.RetailReady;
    }
}