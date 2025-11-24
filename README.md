# Web3 GoFundMe

Web3-GoFundMe is a project that implements a crowdfunding smart contract (CrowdFund) and a modern React frontend that reads and interacts with the contract via Wagmi/Viem.

---

## Table of Contents

- About the project
- Demo / Preview
- Built With
- Getting Started
  - Prerequisites
  - Install
  - Environment
  - Run
- Smart Contracts
  - Tests & Forge
  - Deploy
- Frontend
  - Run dev server
  - Notes
- Contributing
- Roadmap
- License

---

## About the project

This repository contains two main parts:

- `Contract/` — Solidity contracts and Foundry tests. The primary contract is `CrowdFund.sol` (a simple crowdfunding contract) and a `TestToken.sol` ERC20 used in tests and local interactions.
- `Frontend/` — A Next.js (App Router) frontend using Wagmi, Viem, and Reown AppKit for wallet/connect UI.

The goal is to provide a compact full-stack example that shows how to build, test and read on-chain data and present it in a modern React UI.

---

## Built With

- Solidity 0.8.x (Foundry)
- Foundry (forge)
- Next.js (App Router)
- React + TypeScript
- wagmi / viem for contract reads/writes
- tailwindcss + shadcn/ui for UI primitives

---

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing.

### Prerequisites

- Node.js (>= 18)
- pnpm (recommended) or npm/yarn
- Foundry (forge) installed and on PATH — see https://book.getfoundry.sh/ for install
- An Ethereum RPC endpoint (e.g. Alchemy/Infura) for deployment or testnet operations

### Install

Clone the repo and install dependencies for the frontend:

```bash
git clone <this-repo-url>
cd web3-GoFundMe/Frontend
pnpm install
```

Install Foundry and build contracts (from the `Contract/` folder):

```bash
cd ../Contract
forge build
```

### Environment

Copy and fill a `.env` file for local dev / deployment. Example variables used by scripts:

- `BASESEPOLIA_RPC_URL` — RPC URL for Sepolia (or your preferred network)
- `PRIVATE_KEY` — deployer private key (for broadcast scripts; keep secret)
- `ETHERSCAN_API_KEY` — optional, for `forge verify` commands

Create `.env` in the `Contract/` folder or export the variables in your shell before running deploy scripts.

### Run

Frontend (development):

```bash
cd Frontend
pnpm run dev
```

Contracts (tests):

```bash
cd Contract
forge test
```

Build contracts:

```bash
forge build
```

Deploy (example, replace env vars):

```bash
cd Contract

# Load env to terminal
source .env

# broadcast a deploy script (example)
forge script script/CrowdFund.s.sol:CrowdFundScript \
  --rpc-url $BASESEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast
```

Notes: the repo contains a `script/contract.s.sol` and `script` helpers; review the script before running and ensure your env vars are correct.

---

## Smart Contracts

Contracts live in `Contract/src/`:

- `CrowdFund.sol` — main crowdfunding contract. Key methods: `launch`, `cancel`, `pledge`, `unpledge`, `claim`, `refund`, and read helpers.
- `TestToken.sol` — a basic ERC20 used for local testing.

Tests are in `Contract/test/` and use Foundry's `forge` and `forge-std`.

Run tests:

```bash
cd Contract
forge test -v
```

---

## Frontend

The frontend is in `Frontend/` and uses Next.js App Router.

Start dev server:

```bash
cd Frontend
pnpm run dev
```

Tips & notes

- If you see a module resolution error for `porto` or similar when running Next, install missing packages or add them to `next.config.mjs` externals. Example quick fix:

```bash
pnpm add porto -D
rm -rf .next
pnpm run dev
```

- The app contains a small `ContractDataContext` provider that normalizes on-chain values (wei -> human-friendly numbers) and shares them across pages. You can read from it in pages/components.

---

## Troubleshooting & Common Issues

- BigInt / BigNumber errors in React UI: normalize on-chain data (convert wei BigInt/BigNumber to strings or numbers) before doing arithmetic or passing to UI helpers like `.toLocaleString()`.
- Next.js params warning: in client components access route params via `useParams()`.
- Webpack cache errors: delete `.next` and restart dev server.

If you find issues you can't solve, open an issue with logs and reproduction steps.

---

## Contributing

Contributions are welcome. Suggested workflow:

1. Fork the repo
2. Create a feature branch
3. Make your changes, include tests if relevant
4. Submit a PR with description and testing notes

Please follow existing code style (TypeScript/Prettier formatting) and ensure `forge test` passes for contract changes.

---

## Roadmap

- [x] Basic CrowdFund contract (launch, pledge, claim, refund)
- [x] Foundry tests
- [x] Next.js frontend with project listing and detail pages
- [x] Wallet connect flows and write interactions (pledge via frontend)
- [x] UI polishing and responsive improvements

---

## License

This project is licensed under the MIT License — see the `LICENSE` file for details.
