const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("Transactions", function () {
  let transactionsContract, owner, receiver;

  // Deploy the Transactions contract before running the tests
  before(async function () {
    [owner, receiver] = await ethers.getSigners();
    const Transactions = await ethers.getContractFactory("Transactions");
    transactionsContract = await Transactions.deploy(); // Deploy the contract
  });

  describe("Add Transaction", function () {
    it("Should add a transaction to the blockchain", async function () {
      const tx = await transactionsContract.addToBlockchain(
        receiver.address, 
        ethers.utils.parseEther("1"), // 1 Ether
        "Test Transaction",
        "keyword"
      );
      await tx.wait();

      const transactions = await transactionsContract.getAllTransactions();
      expect(transactions.length).to.equal(1);
      expect(transactions[0].sender).to.equal(owner.address);
      expect(transactions[0].receiver).to.equal(receiver.address);
      expect(transactions[0].amount).to.equal(ethers.utils.parseEther("1"));
      expect(transactions[0].message).to.equal("Test Transaction");
      expect(transactions[0].keyword).to.equal("keyword");
    });

    it("Should emit a Transfer event", async function () {
      const tx = await transactionsContract.addToBlockchain(
        receiver.address, 
        ethers.utils.parseEther("1"), 
        "Another Transaction", 
        "keyword2"
      );

      await expect(tx)
        .to.emit(transactionsContract, "Transfer")
        .withArgs(owner.address, receiver.address, ethers.utils.parseEther("1"), "Another Transaction", anyValue, "keyword2"); // anyValue is used for the timestamp
    });
  });

  describe("Transaction Count", function () {
    it("Should return the correct transaction count", async function () {
      const count = await transactionsContract.getTransactionCount();
      expect(count).to.equal(2); // As we have added two transactions so far
    });
  });
});
