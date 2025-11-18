//TimelockController.sol（已由 OpenZeppelin 提供）
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/governance/TimelockController.sol";
//TimelockController.sol（已由 OpenZeppelin 提供）  
    constructor(
    uint256 minDelay,
    address[] memory proposers,
    address[] memory executors
) TimelockController(minDelay, proposers, executors) {}
//SupplyChainWithPool.sol 升级要点
constructor(address _compliancePool, address timelock) {
    _grantRole(DEFAULT_ADMIN_ROLE, timelock); // Timelock 控制角色赋权
    compliancePool = ICompliancePool(_compliancePool);
}
//示例1：DAO 提案为某地址赋予 PRODUCER_ROLE 权限
// prepare tx:
target = address(supplyChain);
value = 0;
data = supplyChain.grantRole(PRODUCER_ROLE, userAddress);

// schedule via timelock
timelock.schedule(target, value, data, 0x00, 0x00, delay);

// after delay...
timelock.execute(target, value, data, 0x00, 0x00);