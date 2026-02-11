import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { Token } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("Token", function () {
  async function deployTokenFixture() {
    const [owner, user1, user2] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("Token");
    const initialSupply = ethers.parseEther("1000000"); // 1M tokens
    const token = await Token.deploy("Test Token", "TEST", initialSupply);

    return { token, owner, user1, user2, initialSupply };
  }

  describe("Deployment", function () {
    it("Should set the right name and symbol", async function () {
      const { token } = await loadFixture(deployTokenFixture);
      expect(await token.name()).to.equal("Test Token");
      expect(await token.symbol()).to.equal("TEST");
    });

    it("Should mint initial supply to owner", async function () {
      const { token, owner, initialSupply } = await loadFixture(deployTokenFixture);
      expect(await token.balanceOf(owner.address)).to.equal(initialSupply);
    });

    it("Should set the right owner", async function () {
      const { token, owner } = await loadFixture(deployTokenFixture);
      expect(await token.owner()).to.equal(owner.address);
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint", async function () {
      const { token, user1 } = await loadFixture(deployTokenFixture);
      const mintAmount = ethers.parseEther("1000");

      await token.mint(user1.address, mintAmount);
      expect(await token.balanceOf(user1.address)).to.equal(mintAmount);
    });

    it("Should revert if non-owner tries to mint", async function () {
      const { token, user1, user2 } = await loadFixture(deployTokenFixture);
      const mintAmount = ethers.parseEther("1000");

      await expect(
        token.connect(user1).mint(user2.address, mintAmount)
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });

    it("Should revert if minting exceeds max supply", async function () {
      const { token, user1 } = await loadFixture(deployTokenFixture);
      const maxSupply = await token.MAX_SUPPLY();

      await expect(
        token.mint(user1.address, maxSupply)
      ).to.be.revertedWithCustomError(token, "MaxSupplyExceeded");
    });
  });

  describe("Transfers", function () {
    it("Should transfer tokens between accounts", async function () {
      const { token, owner, user1 } = await loadFixture(deployTokenFixture);
      const transferAmount = ethers.parseEther("100");

      await token.transfer(user1.address, transferAmount);
      expect(await token.balanceOf(user1.address)).to.equal(transferAmount);
    });

    it("Should emit Transfer event", async function () {
      const { token, owner, user1 } = await loadFixture(deployTokenFixture);
      const transferAmount = ethers.parseEther("100");

      await expect(token.transfer(user1.address, transferAmount))
        .to.emit(token, "Transfer")
        .withArgs(owner.address, user1.address, transferAmount);
    });
  });

  describe("Pausing", function () {
    it("Should pause and unpause", async function () {
      const { token, owner, user1 } = await loadFixture(deployTokenFixture);

      await token.pause();
      expect(await token.paused()).to.be.true;

      await expect(
        token.transfer(user1.address, ethers.parseEther("100"))
      ).to.be.revertedWithCustomError(token, "EnforcedPause");

      await token.unpause();
      expect(await token.paused()).to.be.false;

      await token.transfer(user1.address, ethers.parseEther("100"));
      expect(await token.balanceOf(user1.address)).to.equal(ethers.parseEther("100"));
    });
  });

  describe("Blacklisting", function () {
    it("Should blacklist and unblacklist accounts", async function () {
      const { token, owner, user1, user2 } = await loadFixture(deployTokenFixture);

      // Transfer some tokens to user1
      await token.transfer(user1.address, ethers.parseEther("1000"));

      // Blacklist user1
      await token.blacklist(user1.address);
      expect(await token.blacklisted(user1.address)).to.be.true;

      // User1 cannot transfer
      await expect(
        token.connect(user1).transfer(user2.address, ethers.parseEther("100"))
      ).to.be.revertedWithCustomError(token, "AccountBlacklisted");

      // Cannot transfer to blacklisted
      await expect(
        token.transfer(user1.address, ethers.parseEther("100"))
      ).to.be.revertedWithCustomError(token, "AccountBlacklisted");

      // Unblacklist
      await token.unblacklist(user1.address);
      expect(await token.blacklisted(user1.address)).to.be.false;

      // Now transfers work
      await token.connect(user1).transfer(user2.address, ethers.parseEther("100"));
      expect(await token.balanceOf(user2.address)).to.equal(ethers.parseEther("100"));
    });
  });

  describe("Burning", function () {
    it("Should allow users to burn their tokens", async function () {
      const { token, owner, initialSupply } = await loadFixture(deployTokenFixture);
      const burnAmount = ethers.parseEther("1000");

      await token.burn(burnAmount);
      expect(await token.balanceOf(owner.address)).to.equal(initialSupply - burnAmount);
      expect(await token.totalSupply()).to.equal(initialSupply - burnAmount);
    });
  });

  describe("Permit", function () {
    it("Should allow gasless approvals via permit", async function () {
      const { token, owner, user1 } = await loadFixture(deployTokenFixture);
      const value = ethers.parseEther("1000");
      const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour

      const nonce = await token.nonces(owner.address);
      const name = await token.name();

      const domain = {
        name,
        version: "1",
        chainId: (await ethers.provider.getNetwork()).chainId,
        verifyingContract: await token.getAddress(),
      };

      const types = {
        Permit: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
          { name: "value", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      };

      const message = {
        owner: owner.address,
        spender: user1.address,
        value,
        nonce,
        deadline,
      };

      const signature = await owner.signTypedData(domain, types, message);
      const { v, r, s } = ethers.Signature.from(signature);

      await token.permit(owner.address, user1.address, value, deadline, v, r, s);
      expect(await token.allowance(owner.address, user1.address)).to.equal(value);
    });
  });
});
