// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title CompliancePool
 * @notice 押金管理合约，用于奖励合规产品，惩罚违规者
 */
contract CompliancePool {
    struct Product {
        address owner;
        uint256 depositAmount;
        bool isRegistered;
        bool isCompleted;
        bool isPenalized;
    }

    mapping(bytes32 => Product) public products;
    uint256 public totalPool;
    uint256 public rewardRate = 10; // 10%

    event Registered(bytes32 indexed productId, address indexed user, uint256 deposit);
    event Completed(bytes32 indexed productId, address indexed user, uint256 payout);
    event Penalized(bytes32 indexed productId, address indexed user);

    function registerProduct(bytes32 productId) external payable {
        require(msg.value > 0, "Deposit required.");
        require(!products[productId].isRegistered, "Already registered.");

        products[productId] = Product({
            owner: msg.sender,
            depositAmount: msg.value,
            isRegistered: true,
            isCompleted: false,
            isPenalized: false
        });

        totalPool += msg.value;
        emit Registered(productId, msg.sender, msg.value);
    }

    function completeCompliance(bytes32 productId) external {
        Product storage p = products[productId];
        require(p.isRegistered, "Not registered.");
        require(!p.isCompleted, "Already completed.");
        require(!p.isPenalized, "Product penalized.");
        require(msg.sender == p.owner, "Only product owner.");

        p.isCompleted = true;
        uint256 reward = (p.depositAmount * rewardRate) / 100;
        uint256 payout = p.depositAmount + reward;

        require(address(this).balance >= payout, "Insufficient balance.");
        totalPool -= p.depositAmount;

        payable(p.owner).transfer(payout);
        emit Completed(productId, p.owner, payout);
    }

    function penalize(bytes32 productId) external {
        Product storage p = products[productId];
        require(p.isRegistered, "Not registered.");
        require(!p.isCompleted, "Already completed.");
        require(!p.isPenalized, "Already penalized.");

        // ⚠️ 可以加 onlyRole(ARBITER_ROLE)
        p.isPenalized = true;
        totalPool -= p.depositAmount;

        emit Penalized(productId, p.owner);
    }

    function getProductStatus(bytes32 productId) external view returns (string memory) {
        Product storage p = products[productId];
        if (!p.isRegistered) return "Unregistered";
        if (p.isPenalized) return "Penalized";
        if (p.isCompleted) return "Compliant";
        return "In Progress";
    }
}
