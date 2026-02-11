import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy Token
  console.log("\n--- Deploying Token ---");
  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy(
    "{{PROJECT_NAME}} Token", // name
    "{{TOKEN_SYMBOL}}",       // symbol
    ethers.parseEther("100000000") // initial supply: 100M tokens
  );
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("Token deployed to:", tokenAddress);

  // Deploy NFT
  console.log("\n--- Deploying NFT ---");
  const NFT = await ethers.getContractFactory("NFT");
  const nft = await NFT.deploy(
    "{{PROJECT_NAME}} NFT",   // name
    "{{NFT_SYMBOL}}",         // symbol
    "ipfs://hidden/",         // hidden metadata URI
    500                       // royalty: 5%
  );
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  console.log("NFT deployed to:", nftAddress);

  // Verify contracts on Etherscan (if not localhost)
  const network = await ethers.provider.getNetwork();
  if (network.chainId !== 31337n) {
    console.log("\n--- Waiting for block confirmations ---");
    await token.deploymentTransaction()?.wait(5);
    await nft.deploymentTransaction()?.wait(5);

    console.log("\n--- Verifying contracts ---");
    try {
      await run("verify:verify", {
        address: tokenAddress,
        constructorArguments: [
          "{{PROJECT_NAME}} Token",
          "{{TOKEN_SYMBOL}}",
          ethers.parseEther("100000000"),
        ],
      });

      await run("verify:verify", {
        address: nftAddress,
        constructorArguments: [
          "{{PROJECT_NAME}} NFT",
          "{{NFT_SYMBOL}}",
          "ipfs://hidden/",
          500,
        ],
      });
    } catch (error) {
      console.error("Verification failed:", error);
    }
  }

  console.log("\n--- Deployment Summary ---");
  console.log("Token:", tokenAddress);
  console.log("NFT:", nftAddress);
  console.log("\nDone!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
