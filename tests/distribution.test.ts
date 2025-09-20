import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("Distribution Engine Tests", () => {
  beforeEach(() => {
    // Reset simnet state
  });

  it("initializes campaign pool successfully", () => {
    const result = simnet.callPublicFn(
      "distribution-engine",
      "initialize-campaign-pool",
      [Cl.uint(1)],
      deployer
    );
    
    expect(result.result).toBeOk(Cl.bool(true));
    
    // Verify pool exists
    const pool = simnet.callReadOnlyFn(
      "distribution-engine",
      "get-campaign-pool",
      [Cl.uint(1)],
      deployer
    );
    
    expect(pool.result).toBeTypeOf(Cl.some());
  });

  it("sets allocation for recipient", () => {
    // Initialize first
    simnet.callPublicFn("distribution-engine", "initialize-campaign-pool", [Cl.uint(1)], deployer);
    
    const result = simnet.callPublicFn(
      "distribution-engine",
      "set-allocation",
      [Cl.uint(1), Cl.standardPrincipal(wallet1), Cl.uint(500000)], // 50%
      deployer
    );
    
    expect(result.result).toBeOk(Cl.bool(true));
    
    // Verify allocation was set
    const allocation = simnet.callReadOnlyFn(
      "distribution-engine",
      "get-allocation",
      [Cl.uint(1), Cl.standardPrincipal(wallet1)],
      deployer
    );
    
    expect(allocation.result).toBeTypeOf(Cl.some());
  });

  it("processes deposits and calculates rewards correctly", () => {
    // Setup pool and allocations
    simnet.callPublicFn("distribution-engine", "initialize-campaign-pool", [Cl.uint(1)], deployer);
    simnet.callPublicFn("distribution-engine", "set-allocation", 
      [Cl.uint(1), Cl.standardPrincipal(wallet1), Cl.uint(600000)], deployer); // 60%
    simnet.callPublicFn("distribution-engine", "set-allocation", 
      [Cl.uint(1), Cl.standardPrincipal(wallet2), Cl.uint(400000)], deployer); // 40%
    
    // Make deposit
    const depositResult = simnet.callPublicFn(
      "distribution-engine",
      "deposit-to-campaign",
      [Cl.uint(1), Cl.uint(1000000), Cl.standardPrincipal(deployer)], // 1M tokens
      deployer
    );
    
    expect(depositResult.result).toBeTypeOf(Cl.ok());
    
    // Check pending rewards
    const pending1 = simnet.callReadOnlyFn(
      "distribution-engine",
      "get-pending-rewards",
      [Cl.uint(1), Cl.standardPrincipal(wallet1)],
      deployer
    );
    
    const pending2 = simnet.callReadOnlyFn(
      "distribution-engine",
      "get-pending-rewards",
      [Cl.uint(1), Cl.standardPrincipal(wallet2)],
      deployer
    );
    
    expect(pending1.result).toBeUint(600000); // 60% of 1M
    expect(pending2.result).toBeUint(400000); // 40% of 1M
  });

  it("batch sets allocations efficiently", () => {
    // Initialize pool
    simnet.callPublicFn("distribution-engine", "initialize-campaign-pool", [Cl.uint(1)], deployer);
    
    const result = simnet.callPublicFn(
      "distribution-engine",
      "batch-set-allocations",
      [
        Cl.uint(1),
        Cl.list([
          Cl.tuple({
            'recipient': Cl.standardPrincipal(wallet1),
            'shares': Cl.uint(300000)
          }),
          Cl.tuple({
            'recipient': Cl.standardPrincipal(wallet2),
            'shares': Cl.uint(700000)
          })
        ])
      ],
      deployer
    );
    
    expect(result.result).toBeTypeOf(Cl.ok()); // Success response
  });

  it("allows claiming rewards", () => {
    // Setup and deposit
    simnet.callPublicFn("distribution-engine", "initialize-campaign-pool", [Cl.uint(1)], deployer);
    simnet.callPublicFn("distribution-engine", "set-allocation", 
      [Cl.uint(1), Cl.standardPrincipal(wallet1), Cl.uint(1000000)], deployer); // 100%
    simnet.callPublicFn("distribution-engine", "deposit-to-campaign",
      [Cl.uint(1), Cl.uint(500000), Cl.standardPrincipal(deployer)], deployer);
    
    // Claim rewards
    const claimResult = simnet.callPublicFn(
      "distribution-engine",
      "claim-rewards",
      [Cl.uint(1)],
      wallet1
    );
    
    expect(claimResult.result).toBeOk(Cl.uint(500000));
  });
});