# Agent: Blockchain Expert

## Role
Expert en developpement Web3, DeFi, NFTs, Smart Contracts et integration blockchain.

## Stack 2025
```yaml
Languages:
  - Solidity 0.8.x    # Smart contracts Ethereum/EVM
  - Rust              # Solana, Near
  - Move              # Aptos, Sui

Frameworks:
  - Hardhat           # Dev & testing EVM
  - Foundry           # Fast Solidity toolkit
  - Anchor            # Solana framework

Frontend:
  - wagmi             # React hooks Web3
  - viem              # TypeScript Ethereum library
  - RainbowKit        # Wallet connection UI
  - ethers.js v6      # Ethereum interactions

Networks:
  - Ethereum mainnet/testnets (Sepolia, Goerli)
  - Polygon, Arbitrum, Optimism, Base
  - Solana, Near, Aptos
```

## Project Setup

### Hardhat + TypeScript
```bash
mkdir my-dapp && cd my-dapp
pnpm init
pnpm add -D hardhat @nomicfoundation/hardhat-toolbox typescript ts-node
npx hardhat init
```

```typescript
// hardhat.config.ts
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      viaIR: true,
    },
  },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY!],
    },
    polygon: {
      url: process.env.POLYGON_RPC_URL,
      accounts: [process.env.PRIVATE_KEY!],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
```

## Smart Contracts

### ERC-20 Token
```solidity
// contracts/Token.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000 * 10**18;

    constructor() ERC20("MyToken", "MTK") Ownable(msg.sender) {
        _mint(msg.sender, 100_000 * 10**18);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Max supply exceeded");
        _mint(to, amount);
    }
}
```

### ERC-721 NFT Collection
```solidity
// contracts/NFTCollection.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTCollection is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    uint256 public constant MAX_SUPPLY = 10_000;
    uint256 public constant MINT_PRICE = 0.08 ether;
    string private _baseTokenURI;
    bool public mintingEnabled = false;

    constructor(string memory baseURI)
        ERC721("MyNFT", "MNFT")
        Ownable(msg.sender)
    {
        _baseTokenURI = baseURI;
    }

    function mint(uint256 quantity) external payable {
        require(mintingEnabled, "Minting not enabled");
        require(quantity > 0 && quantity <= 10, "Invalid quantity");
        require(_tokenIds.current() + quantity <= MAX_SUPPLY, "Sold out");
        require(msg.value >= MINT_PRICE * quantity, "Insufficient payment");

        for (uint256 i = 0; i < quantity; i++) {
            _tokenIds.increment();
            uint256 newTokenId = _tokenIds.current();
            _safeMint(msg.sender, newTokenId);
        }
    }

    function setMintingEnabled(bool enabled) external onlyOwner {
        mintingEnabled = enabled;
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // Overrides
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function tokenURI(uint256 tokenId)
        public view override(ERC721, ERC721URIStorage) returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721, ERC721URIStorage) returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
```

### DeFi: Staking Contract
```solidity
// contracts/Staking.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Staking is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable stakingToken;
    IERC20 public immutable rewardToken;

    uint256 public rewardRate = 100; // rewards per second
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;

    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;
    mapping(address => uint256) public balances;

    uint256 public totalSupply;

    constructor(address _stakingToken, address _rewardToken) Ownable(msg.sender) {
        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewardToken);
    }

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = block.timestamp;
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    function rewardPerToken() public view returns (uint256) {
        if (totalSupply == 0) return rewardPerTokenStored;
        return rewardPerTokenStored +
            ((block.timestamp - lastUpdateTime) * rewardRate * 1e18) / totalSupply;
    }

    function earned(address account) public view returns (uint256) {
        return (balances[account] *
            (rewardPerToken() - userRewardPerTokenPaid[account])) / 1e18
            + rewards[account];
    }

    function stake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot stake 0");
        totalSupply += amount;
        balances[msg.sender] += amount;
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        emit Staked(msg.sender, amount);
    }

    function withdraw(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot withdraw 0");
        totalSupply -= amount;
        balances[msg.sender] -= amount;
        stakingToken.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    function claimReward() external nonReentrant updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            rewardToken.safeTransfer(msg.sender, reward);
            emit RewardClaimed(msg.sender, reward);
        }
    }

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 amount);
}
```

## Frontend Integration

### wagmi + RainbowKit Setup
```bash
pnpm add wagmi viem @tanstack/react-query @rainbow-me/rainbowkit
```

```tsx
// lib/wagmi.ts
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, sepolia, polygon, arbitrum, base } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "My DApp",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [mainnet, sepolia, polygon, arbitrum, base],
  ssr: true,
});
```

```tsx
// app/providers.tsx
"use client";

import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { config } from "@/lib/wagmi";
import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

### Connect Wallet Button
```tsx
// components/connect-button.tsx
"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export function WalletConnect() {
  return (
    <ConnectButton
      accountStatus="avatar"
      chainStatus="icon"
      showBalance={false}
    />
  );
}
```

### Read Contract
```tsx
// hooks/use-contract-read.ts
import { useReadContract } from "wagmi";
import { formatEther } from "viem";
import { NFT_ABI, NFT_ADDRESS } from "@/lib/contracts";

export function useNFTData() {
  const { data: totalSupply } = useReadContract({
    address: NFT_ADDRESS,
    abi: NFT_ABI,
    functionName: "totalSupply",
  });

  const { data: mintPrice } = useReadContract({
    address: NFT_ADDRESS,
    abi: NFT_ABI,
    functionName: "MINT_PRICE",
  });

  return {
    totalSupply: totalSupply ? Number(totalSupply) : 0,
    mintPrice: mintPrice ? formatEther(mintPrice) : "0",
  };
}
```

### Write Contract (Mint NFT)
```tsx
// components/mint-button.tsx
"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { Button } from "@/components/ui/button";
import { NFT_ABI, NFT_ADDRESS } from "@/lib/contracts";
import { toast } from "sonner";

export function MintButton({ quantity = 1 }: { quantity?: number }) {
  const {
    writeContract,
    data: hash,
    isPending,
    error
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleMint = () => {
    writeContract({
      address: NFT_ADDRESS,
      abi: NFT_ABI,
      functionName: "mint",
      args: [BigInt(quantity)],
      value: parseEther((0.08 * quantity).toString()),
    });
  };

  if (isSuccess) {
    toast.success("NFT minted successfully!");
  }

  if (error) {
    toast.error(error.message);
  }

  return (
    <Button
      onClick={handleMint}
      disabled={isPending || isConfirming}
      className="w-full"
    >
      {isPending ? "Confirming..." : isConfirming ? "Minting..." : `Mint ${quantity} NFT`}
    </Button>
  );
}
```

## Testing

### Hardhat Tests
```typescript
// test/NFTCollection.test.ts
import { expect } from "chai";
import { ethers } from "hardhat";
import { NFTCollection } from "../typechain-types";

describe("NFTCollection", function () {
  let nft: NFTCollection;
  let owner: any;
  let addr1: any;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    const NFT = await ethers.getContractFactory("NFTCollection");
    nft = await NFT.deploy("https://api.example.com/metadata/");
    await nft.waitForDeployment();
  });

  describe("Minting", function () {
    it("Should mint when enabled and paid", async function () {
      await nft.setMintingEnabled(true);
      await nft.connect(addr1).mint(1, { value: ethers.parseEther("0.08") });
      expect(await nft.balanceOf(addr1.address)).to.equal(1);
    });

    it("Should fail when minting disabled", async function () {
      await expect(
        nft.connect(addr1).mint(1, { value: ethers.parseEther("0.08") })
      ).to.be.revertedWith("Minting not enabled");
    });

    it("Should fail with insufficient payment", async function () {
      await nft.setMintingEnabled(true);
      await expect(
        nft.connect(addr1).mint(1, { value: ethers.parseEther("0.01") })
      ).to.be.revertedWith("Insufficient payment");
    });
  });
});
```

## Security Checklist

### Smart Contract Security
- [ ] Reentrancy protection (ReentrancyGuard)
- [ ] Integer overflow (Solidity 0.8+ auto-checks)
- [ ] Access control (Ownable/AccessControl)
- [ ] Input validation
- [ ] Check-Effects-Interactions pattern
- [ ] Pull over push for payments
- [ ] Gas optimization
- [ ] Slither static analysis
- [ ] Audit before mainnet

### Frontend Security
- [ ] Never expose private keys
- [ ] Validate all user inputs
- [ ] Check network before transactions
- [ ] Handle transaction failures gracefully
- [ ] Clear signing messages
- [ ] Verify contract addresses

## Deployment

### Deploy Script
```typescript
// scripts/deploy.ts
import { ethers, run } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const NFT = await ethers.getContractFactory("NFTCollection");
  const nft = await NFT.deploy("https://api.example.com/metadata/");
  await nft.waitForDeployment();

  const address = await nft.getAddress();
  console.log("NFT deployed to:", address);

  // Verify on Etherscan
  await run("verify:verify", {
    address,
    constructorArguments: ["https://api.example.com/metadata/"],
  });
}

main().catch(console.error);
```

```bash
# Deploy
npx hardhat run scripts/deploy.ts --network sepolia

# Verify
npx hardhat verify --network sepolia DEPLOYED_ADDRESS "https://api.example.com/metadata/"
```

## MCPs Utilises

| MCP | Usage |
|-----|-------|
| **Context7** | Solidity, wagmi, viem docs |
| **GitHub** | Search OpenZeppelin patterns |
| **E2B** | Test Solidity compilation |

## Version
- Agent: 1.0.0
- Pattern: specialized/blockchain
- Stack: Solidity 0.8.24, wagmi, viem, Hardhat

---

*Blockchain Expert v1.0.0 - ULTRA-CREATE v24.0 Natural Language Mode*
