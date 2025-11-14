// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title RoleBasedSupplyChain
 * @notice 集成基于角色的权限控制（RBAC），限制各阶段只能由特定角色执行
 */
contract RoleBasedSupplyChain is AccessControl {
    /// @dev 定义流程阶段
    enum Stage {
        Uninitialized,
        Produced,
        Collected,
        Declared,
        RetailReady
    }

    /// @dev 当前阶段
    Stage public currentStage;

    /// @dev 阶段时间记录
    mapping(Stage => uint256) public stageTimestamps;

    // ========================
    //       角色常量定义
    // ========================

    bytes32 public constant PRODUCER_ROLE = keccak256("PRODUCER_ROLE");
    bytes32 public constant COLLECTOR_ROLE = keccak256("COLLECTOR_ROLE");
    bytes32 public constant CUSTOMS_ROLE   = keccak256("CUSTOMS_ROLE"); //Change from delarecustom
    bytes32 public constant RETAIL_ROLE    = keccak256("RETAIL_ROLE");

    /**
     * @dev 构造函数：部署者默认拥有 DEFAULT_ADMIN_ROLE
     */
    constructor(address producer, address collector, address customs, address retailer) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PRODUCER_ROLE, producer);
        _grantRole(COLLECTOR_ROLE, collector);
        _grantRole(CUSTOMS_ROLE, customs);  //Change from delarecustom
        _grantRole(RETAIL_ROLE, retailer);

        currentStage = Stage.Uninitialized;
        stageTimestamps[currentStage] = block.timestamp;
    }

    // ========================
    //     Function
    // ========================

    /// @notice 执行生产阶段
    function produce() external atStep(Stage.Uninitialized) onlyRole(PRODUCER_ROLE) {
        // 可加入生产逻辑
    }

    /// @notice 执行收集阶段
    function collect() external atStep(Stage.Produced) onlyRole(COLLECTOR_ROLE) {
        // 可加入收集逻辑
    }

    /// @notice 执行报关阶段
    function declareCustoms() external atStep(Stage.Collected) onlyRole(CUSTOMS_ROLE) {
        // 可加入报关逻辑
    }

    /// @notice 执行零售阶段
    function retail() external atStep(Stage.Declared) onlyRole(RETAIL_ROLE) {
        // 可加入零售逻辑
    }

    // ========================
    //     Modifiers
    // ========================

    /**
     * @dev 自动阶段检查 + 自动推进 + 自动记录时间戳
     * @param expected 要求当前阶段
     */
    modifier atStep(Stage expected) {
        require(currentStage == expected, "Invalid stage.");
        _;
        currentStage = Stage(uint(currentStage) + 1);
        stageTimestamps[currentStage] = block.timestamp;
    }

    // ========================
    //     查询函数（只读）
    // ========================

    /// @notice 获取某阶段的时间戳
    function getStageTimestamp(Stage stage) external view returns (uint256) {
        return stageTimestamps[stage];
    }
}
