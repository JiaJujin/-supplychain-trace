# Blockchain Supply Chain Traceability System — Rubric Aligned

This repository contains a React-based frontend demo, Solidity smart contracts, and a small `viem`-powered Oracle prototype. The documentation below aligns with the requested rubric and includes reproducible steps and a security scan summary.

## Problem Statement

- Clear problem, users, and goals
  - Problem: Cross-stage supply chain visibility and trust are limited; provenance auditing is costly.
  - Users: Producers, Collectors, Customs, Retailers, Regulators/Consumers.
  - Goals: Record stage transitions on-chain with timestamps, provide auditable history, and expose clear UI flows.
- Why blockchain/DeFi and expected value
  - Immutable, verifiable process records increase trust and reduce disputes.
  - DeFi-like incentives via a deposit pool reward compliant behavior and penalize violations, improving governance.
- Key constraints/assumptions
  - Frontend demo is stateless and in-memory; testnet deployments assumed.
  - Linear stage progression; Oracle integrates off-chain data hashes.

## Solution Design

- Overall architecture and roles
  - Frontend (`my_project`): batch creation, stage transitions, history UI.
  - Contracts (`smartcontract`): role-based access control (RBAC), linear stage FSM, optional deposit pool and timelock.
  - Oracle (`oracle`): fetch off-chain data, compute hash, write to chain (extensible).
  - Roles: `PRODUCER`, `COLLECTOR`, `CUSTOMS`, `RETAIL` restricted by RBAC.
- Token/asset or mechanism choice with rationale
  - Mechanism: `CompliancePool` manages deposits and payouts; simple, auditable incentives.
  - Rationale: Economic alignment encourages compliant operations without introducing complex tokens.
- Key process flows
  - Stage flow: `produce → collect → declareCustoms → retail`, with timestamps and checks.
  - Compliance flow: register deposit → complete compliance → payout or penalize.

## Smart Contracts Overview

- `Accesscontrol.sol`
  - Role-based supply chain stages with `AccessControl`.
  - Functions: `produce`, `collect`, `declareCustoms`, `retail` with linear progression and per-stage timestamps.
- `SupplyChainWithCompliancePool.sol`
  - Per-product registration, per-product stage tracking and timestamps.
  - Integrates with a compliance pool interface; RBAC-enforced stage execution.
- `CompliancePool.sol`
  - Deposit registration, compliance completion payout, and penalty path.
  - Emits `Registered`, `Completed`, `Penalized`; configurable `rewardRate`.
- `Flow.sol`
  - Minimal linear FSM without roles or timestamps; sequential `produce → collect → declareCustoms → retail`.
- `modifiers.sol`
  - Stage enforcement via `modifier` with automatic advance and timestamp recording.
- `Accesscontrol with timelock.sol`
  - Governance-oriented example showing `TimelockController` usage for delayed privileged actions and role grants.

##  Implementation

- Core features work; Novelty
  - RBAC-restricted linear FSM with auto-advance and timestamping.
  - Compliance pool integrates economic incentives into operational flow.
- Clean, readable code; events/access control
  - Built on OpenZeppelin `AccessControl`; pool emits `Registered/Completed/Penalized`.
- Basic gas-awareness/best practices
  - `enum` + `mapping` state, minimal external calls, sequential operations, small surface area.

## Testing & Security

- Solidity Vulnerability Scan
  - Scan Summary: Lines Analyzed: 20; Scan Score: 95.70; Issue Distribution: `{ critical: 0, gas: 3, high: 0, informational: 11, low: 3, medium: 0 }`.
  - Tools (recommended): Slither (`slither .` in `smartcontract/`), Mythril (`myth analyze`).
- Threats identified and mitigations
  - Unauthorized actions: RBAC restricts each stage executor.
  - Out-of-order progression: modifiers enforce current stage checks and timestamp updates.
  - Reentrancy/unsafe calls: pool uses simple `transfer` for payouts; avoid complex external interactions.
  - Key management: Oracle reads `PRIVATE_KEY` from environment, no secrets in repo.

## Deployment & DevOps

- Testnet deployment + verified contracts
  - Use Remix or Hardhat to compile/deploy `Accesscontrol.sol` or `SupplyChainWithCompliancePool.sol` to Sepolia.
  - Verify on Etherscan with source and constructor args.
- Scripts/tooling; reproducible steps
  - Frontend: root `run-frontend.bat` or `cd my_project && npm start`, open `http://localhost:3000`.
  - Static build/publish: `deploy-docs.bat` builds and copies to `docs/` for GitHub Pages.
  - Oracle: `cd oracle && npm i && npm run dev`; configure `.env` (`RPC_URL`, `PRIVATE_KEY`, `CONTRACT_ADDRESS`).
  - End-to-end steps:
    1. Deploy target contract and note address.
    2. Configure address in frontend/Oracle if applicable.
    3. Create batch in UI; advance stages in order.
    4. Oracle writes off-chain hash (optional) and confirm on block explorer.
    5. Compare UI history and on-chain timestamps.
- Ops readiness (pause/upgrade or rationale)
  - Timelock governance: example snippet shows delayed execution for sensitive ops.
  - Upgrade rationale: demo avoids proxies; production should combine timelock and governance for changes.


## Directory & Quick Start

- Frontend: `my_project` → `npm start`; visit `http://localhost:3000`.
- Contracts: `smartcontract` → compile/deploy via Remix/Hardhat.
- Oracle: `oracle` → configure `.env`, `npm run dev`.
- Build & share: `deploy-docs.bat` then enable GitHub Pages (`main/docs`).
