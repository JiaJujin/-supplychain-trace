# Blockchain Supply Chain Traceability System

A Create React App based system for demonstrating supply chain batch tracking. It includes batch creation via modal, product and Items display, history leaderboard, and guarded workflow actions. No backend is required; data is kept in memory for demo purposes.

## Quick Start

- One-click: double-click `run-frontend.bat` at the repository root. It starts the dev server and opens `http://localhost:3000/`.
- Manual:
  - `cd my_project`
  - `npm start`

## System Features

- Dashboard batch cards:
  - Show batch id, status badge (e.g., `Init`), progress bar and percentage
  - Quick stats: `Items: N` and `Steps: N`
- Create batch via modal:
  - Product: free text input
  - Items: separated by comma/Chinese comma/semicolon/space/newline, e.g. `MILK-0001, MILK-0002`
  - Items sync: the batch card `Items: N` reflects the number parsed; Products tab lists product name plus Items
- Batch details tabs:
  - Products: product name and Items list
  - History: expandable entries per batch (leaderboard integration)
- Actions modal and flow guardrails:
  - Prevent invalid step transitions and duplicates
  - Error feedback with codes and messages (sequence error, not registered, role mismatch, duplicate execution)
- Minimal UI components under `src/components/ui`:
  - `button.jsx`, `card.jsx`, `tabs.jsx`, `dialog.jsx`, `input.jsx`, `progress.jsx`, `separator.jsx`, `badge.jsx`, `toaster.jsx`
- Styling uses Tailwind-like utility classes for consistent look and feel

## Build and Share

- Production build:
  - `cd my_project`
  - `npm run build`
  - Output in `my_project/build`
- Static serving (for sharing locally):
  - `npx --yes serve -s build -l 5000`
  - Open `http://localhost:5000/`
- Archive: `my_project/build.zip` is already generated; unzip and run the static server command above
- Temporary public link (optional):
  - Expose local server with a tunnel: `npx --yes localtunnel --port 5000`

## GitHub Pages

- Generate `docs` with one command at repo root: `deploy-docs.bat`
- Push to remote:
  - `git add docs`
  - `git commit -m "Publish docs for GitHub Pages"`
  - `git push origin main`
- Enable GitHub Pages in Settings → Pages:
  - Source: `Deploy from a branch`
  - Branch: `main`, Folder: `/docs`
  - Final URL: `https://<username>.github.io/<repo>/`

## Smart Contracts

The Solidity contracts in `smartcontract/` model roles, step transitions, time-locked operations, and compliance incentives via staking and penalties.

- `Accesscontrol.sol`: role-based permissions for supply chain actors
- `Accesscontrol with timelock.sol`: adds a timelock to sensitive operations
- `modifiers.sol`: reusable guards to validate roles and step transitions
- `Flow.sol`: defines supply chain process steps and allowed transitions
- `CompliancePool.sol`: pooled staking with reward/penalty logic for compliant behavior
- `SupplyChainWithCompliancePool.sol`: integrates the flow with the compliance pool to enforce incentives across the lifecycle

## Structure

- `my_project/src/trace_quest_react.jsx`: main UI and state management
- `my_project/src/components/ui/*`: minimal UI components
- `run-frontend.bat`: one-click dev server launcher
- `deploy-docs.bat`: build and copy artifacts to `docs` for GitHub Pages
