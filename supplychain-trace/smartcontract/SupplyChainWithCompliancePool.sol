// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

interface ICompliancePool {
    function completeCompliance(bytes32 productId) external;
}

contract SupplyChainWithPool is AccessControl {
    enum Stage {
        Uninitialized,
        Produced,
        Collected,
        Declared,
        RetailReady
    }

    struct Product {
        Stage currentStage;
        address owner;
        bool isActive;
    }

    mapping(bytes32 => Product) public products;
    mapping(bytes32 => mapping(Stage => uint256)) public stageTimestamps;

    ICompliancePool public compliancePool;

    bytes32 public constant PRODUCER_ROLE = keccak256("PRODUCER_ROLE");
    bytes32 public constant COLLECTOR_ROLE = keccak256("COLLECTOR_ROLE");
    bytes32 public constant CUSTOMS_ROLE   = keccak256("CUSTOMS_ROLE");
    bytes32 public constant RETAIL_ROLE    = keccak256("RETAIL_ROLE");

    constructor(address _compliancePool) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        compliancePool = ICompliancePool(_compliancePool);
    }

    modifier atStep(bytes32 productId, Stage expected) {
        Product storage p = products[productId];
        require(p.isActive, "Product not active.");
        require(p.currentStage == expected, "Invalid stage.");
        _;
        p.currentStage = Stage(uint(p.currentStage) + 1);
        stageTimestamps[productId][p.currentStage] = block.timestamp;
    }

    function registerProduct(bytes32 productId, address owner) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(!products[productId].isActive, "Already registered.");
        products[productId] = Product({
            currentStage: Stage.Uninitialized,
            owner: owner,
            isActive: true
        });
        stageTimestamps[productId][Stage.Uninitialized] = block.timestamp;
    }

    function produce(bytes32 productId) external onlyRole(PRODUCER_ROLE) atStep(productId, Stage.Uninitialized) {}

    function collect(bytes32 productId) external onlyRole(COLLECTOR_ROLE) atStep(productId, Stage.Produced) {}

    function declareCustoms(bytes32 productId) external onlyRole(CUSTOMS_ROLE) atStep(productId, Stage.Collected) {}

    function retail(bytes32 productId) external onlyRole(RETAIL_ROLE) atStep(productId, Stage.Declared) {
        // 零售结束 → 通知合规池释放押金
        Product storage p = products[productId];
        compliancePool.completeCompliance(productId);
    }

    function getStage(bytes32 productId) external view returns (Stage) {
        return products[productId].currentStage;
    }
}
