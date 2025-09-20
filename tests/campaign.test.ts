import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("Campaign Manager Tests", () => {
  beforeEach(() => {
    // Reset simnet state before each test
  });

  it("creates a relief campaign successfully", () => {
    const result = simnet.callPublicFn(
      "campaign-manager",
      "create-campaign", 
      [
        Cl.stringAscii("Turkey Relief"),
        Cl.stringAscii("Emergency aid campaign for earthquake victims"),
        Cl.stringAscii("disaster-relief"), // campaign type
        Cl.standardPrincipal(deployer), // token
        Cl.uint(1000000), // target
        Cl.uint(1440), // duration
        Cl.uint(1000), // min donation
        Cl.uint(100000) // max donation
      ],
      deployer
    );
    
    expect(result.result).toBeOk(Cl.uint(1));
    
    // Verify campaign was created
    const campaign = simnet.callReadOnlyFn(
      "campaign-manager",
      "get-campaign",
      [Cl.uint(1)],
      deployer
    );
    
    expect(campaign.result).toBeType(Cl.some());
  });

  it("creates payroll campaign successfully", () => {
    const result = simnet.callPublicFn(
      "campaign-manager",
      "create-campaign",
      [
        Cl.stringAscii("Monthly Payroll"),
        Cl.stringAscii("Company monthly salary distribution"),
        Cl.stringAscii("payroll"), // campaign type
        Cl.standardPrincipal(deployer), // token
        Cl.uint(5000000), // target
        Cl.uint(720), // duration
        Cl.uint(0), // min
        Cl.uint(10000000) // max
      ],
      deployer
    );
    
    expect(result.result).toBeOk(Cl.uint(1));
  });

  it("adds beneficiaries successfully", () => {
    // Create campaign first
    simnet.callPublicFn(
      "campaign-manager",
      "create-campaign",
      [
        Cl.stringAscii("Test Campaign"),
        Cl.stringAscii("Test description for campaign"),
        Cl.stringAscii("disaster-relief"),
        Cl.standardPrincipal(deployer),
        Cl.uint(1000000),
        Cl.uint(1440),
        Cl.uint(100),
        Cl.uint(50000)
      ],
      deployer
    );
    
    // Add beneficiaries
    const result1 = simnet.callPublicFn(
      "campaign-manager",
      "add-beneficiary",
      [
        Cl.uint(1), 
        Cl.standardPrincipal(wallet1), 
        Cl.uint(4000), // 40%
        Cl.stringAscii("Red Cross")
      ],
      deployer
    );
    
    const result2 = simnet.callPublicFn(
      "campaign-manager",
      "add-beneficiary",
      [
        Cl.uint(1), 
        Cl.standardPrincipal(wallet2), 
        Cl.uint(6000), // 60%
        Cl.stringAscii("Medical Aid")
      ],
      deployer
    );
    
    expect(result1.result).toBeOk(Cl.bool(true));
    expect(result2.result).toBeOk(Cl.bool(true));
  });

  it("prevents unauthorized beneficiary addition", () => {
    simnet.callPublicFn(
      "campaign-manager",
      "create-campaign",
      [
        Cl.stringAscii("Test Campaign 2"),
        Cl.stringAscii("Another test description"),
        Cl.stringAscii("disaster-relief"),
        Cl.standardPrincipal(deployer),
        Cl.uint(1000000),
        Cl.uint(1440),
        Cl.uint(100),
        Cl.uint(50000)
      ],
      deployer
    );
    
    // Non-admin tries to add beneficiary
    const result = simnet.callPublicFn(
      "campaign-manager",
      "add-beneficiary",
      [
        Cl.uint(1), 
        Cl.standardPrincipal(wallet1), 
        Cl.uint(5000),
        Cl.stringAscii("Unauthorized Org")
      ],
      wallet1 // Not the admin
    );
    
    expect(result.result).toBeErr(Cl.uint(100)); // ERR_UNAUTHORIZED
  });

  it("gets campaign progress correctly", () => {
    // Create campaign
    simnet.callPublicFn(
      "campaign-manager",
      "create-campaign",
      [
        Cl.stringAscii("Progress Test"),
        Cl.stringAscii("Testing progress calculation"),
        Cl.stringAscii("disaster-relief"),
        Cl.standardPrincipal(deployer),
        Cl.uint(1000000), // target 1M
        Cl.uint(1440),
        Cl.uint(100),
        Cl.uint(50000)
      ],
      deployer
    );
    
    // Update raised amount
    simnet.callPublicFn(
      "campaign-manager",
      "update-raised-amount",
      [Cl.uint(1), Cl.uint(250000)], // 25% of target
      deployer
    );
    
    const progress = simnet.callReadOnlyFn(
      "campaign-manager",
      "get-campaign-progress",
      [Cl.uint(1)],
      deployer
    );
    
    expect(progress.result).toBeType(Cl.ok());
  });
});