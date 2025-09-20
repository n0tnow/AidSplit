import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const recipient = accounts.get("wallet_1")!;
const recipient2 = accounts.get("wallet_2")!;

describe("NFT Receipts Tests", () => {
  beforeEach(() => {
    // Reset state
  });

  it("mints receipt NFT successfully", () => {
    const result = simnet.callPublicFn(
      "nft-receipts",
      "mint-receipt",
      [
        Cl.standardPrincipal(recipient),
        Cl.uint(1), // campaign-id
        Cl.stringAscii("donation"),
        Cl.uint(1000000), // amount
        Cl.stringAscii("Turkey Relief Campaign"),
        Cl.bool(true) // soulbound
      ],
      deployer
    );
    
    expect(result.result).toBeOk(Cl.uint(1)); // token-id 1
    
    // Check ownership
    const owner = simnet.callReadOnlyFn(
      "nft-receipts",
      "get-owner",
      [Cl.uint(1)],
      deployer
    );
    
    expect(owner.result).toBeOk(Cl.some(Cl.standardPrincipal(recipient)));
  });

  it("prevents soulbound NFT transfer", () => {
    // Mint soulbound receipt
    simnet.callPublicFn(
      "nft-receipts",
      "mint-receipt",
      [
        Cl.standardPrincipal(recipient), 
        Cl.uint(1), 
        Cl.stringAscii("donation"), 
        Cl.uint(1000000), 
        Cl.stringAscii("Test Campaign"), 
        Cl.bool(true)
      ],
      deployer
    );
    
    // Try to transfer
    const result = simnet.callPublicFn(
      "nft-receipts",
      "transfer",
      [Cl.uint(1), Cl.standardPrincipal(recipient), Cl.standardPrincipal(recipient2)],
      recipient
    );
    
    expect(result.result).toBeErr(Cl.uint(402)); // ERR_SOULBOUND
  });

  it("allows transferring non-soulbound receipts", () => {
    // Mint non-soulbound receipt
    simnet.callPublicFn(
      "nft-receipts",
      "mint-receipt",
      [
        Cl.standardPrincipal(recipient), 
        Cl.uint(1), 
        Cl.stringAscii("payroll"), 
        Cl.uint(500000), 
        Cl.stringAscii("Monthly Payroll"), 
        Cl.bool(false) // NOT soulbound
      ],
      deployer
    );
    
    // Transfer should work
    const result = simnet.callPublicFn(
      "nft-receipts",
      "transfer",
      [Cl.uint(1), Cl.standardPrincipal(recipient), Cl.standardPrincipal(recipient2)],
      recipient
    );
    
    expect(result.result).toBeOk(Cl.bool(true));
    
    // Verify new owner
    const owner = simnet.callReadOnlyFn(
      "nft-receipts",
      "get-owner",
      [Cl.uint(1)],
      deployer
    );
    
    expect(owner.result).toBeOk(Cl.some(Cl.standardPrincipal(recipient2)));
  });

  it("allows burning receipts by owner", () => {
    // Mint receipt
    simnet.callPublicFn(
      "nft-receipts",
      "mint-receipt",
      [
        Cl.standardPrincipal(recipient), 
        Cl.uint(1), 
        Cl.stringAscii("donation"), 
        Cl.uint(1000000), 
        Cl.stringAscii("Test"), 
        Cl.bool(false)
      ],
      deployer
    );
    
    // Burn it
    const result = simnet.callPublicFn(
      "nft-receipts",
      "burn-receipt",
      [Cl.uint(1)],
      recipient
    );
    
    expect(result.result).toBeOk(Cl.bool(true));
    
    // Verify it's gone
    const owner = simnet.callReadOnlyFn(
      "nft-receipts",
      "get-owner",
      [Cl.uint(1)],
      deployer
    );
    
    expect(owner.result).toBeTypeOf(Cl.ok()); // Returns none
  });

  it("batch mints multiple receipts", () => {
    const result = simnet.callPublicFn(
      "nft-receipts",
      "batch-mint-receipts",
      [
        Cl.list([
          Cl.tuple({
            'to': Cl.standardPrincipal(recipient),
            'campaign-id': Cl.uint(1),
            'receipt-type': Cl.stringAscii("donation"),
            'amount': Cl.uint(100000)
          }),
          Cl.tuple({
            'to': Cl.standardPrincipal(recipient2),
            'campaign-id': Cl.uint(1),
            'receipt-type': Cl.stringAscii("donation"),
            'amount': Cl.uint(200000)
          })
        ]),
        Cl.stringAscii("Batch Relief Campaign"),
        Cl.bool(true)
      ],
      deployer
    );
    
    expect(result.result).toBeTypeOf(Cl.ok());
  });

  it("verifies receipt authenticity", () => {
    // Mint receipt with known values
    simnet.callPublicFn(
      "nft-receipts",
      "mint-receipt",
      [
        Cl.standardPrincipal(recipient), 
        Cl.uint(5), // campaign-id
        Cl.stringAscii("donation"), 
        Cl.uint(750000), // amount
        Cl.stringAscii("Verification Test"), 
        Cl.bool(true)
      ],
      deployer
    );
    
    // Verify with correct values
    const verification = simnet.callReadOnlyFn(
      "nft-receipts",
      "verify-receipt",
      [Cl.uint(1), Cl.uint(5), Cl.uint(750000)],
      deployer
    );
    
    expect(verification.result).toBeOk(Cl.bool(true));
    
    // Verify with incorrect values should fail
    const badVerification = simnet.callReadOnlyFn(
      "nft-receipts",
      "verify-receipt",
      [Cl.uint(1), Cl.uint(5), Cl.uint(999999)], // wrong amount
      deployer
    );
    
    expect(badVerification.result).toBeTypeOf(Cl.ok()); // Returns false
  });
});