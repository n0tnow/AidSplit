import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const user1 = accounts.get("wallet_1")!;
const user2 = accounts.get("wallet_2")!;

describe("Access Control Tests", () => {
  beforeEach(() => {
    // Reset state
  });

  it("assigns roles correctly", () => {
    const result = simnet.callPublicFn(
      "access-control",
      "assign-role",
      [Cl.standardPrincipal(user1), Cl.uint(2)], // CAMPAIGN_ADMIN role
      deployer
    );
    
    expect(result.result).toBeOk(Cl.bool(true));
    
    // Verify role was assigned
    const hasRole = simnet.callReadOnlyFn(
      "access-control",
      "has-role",
      [Cl.standardPrincipal(user1), Cl.uint(2)],
      deployer
    );
    
    expect(hasRole.result).toBeBool(true);
  });

  it("prevents unauthorized role assignment", () => {
    const result = simnet.callPublicFn(
      "access-control",
      "assign-role",
      [Cl.standardPrincipal(user2), Cl.uint(4)], // FINANCIAL_ADMIN
      user1 // user1 is not super admin
    );
    
    expect(result.result).toBeErr(Cl.uint(500)); // ERR_UNAUTHORIZED
  });

  it("revokes roles correctly", () => {
    // First assign a role
    simnet.callPublicFn(
      "access-control",
      "assign-role",
      [Cl.standardPrincipal(user1), Cl.uint(8)], // AUDITOR role
      deployer
    );
    
    // Then revoke it
    const result = simnet.callPublicFn(
      "access-control",
      "revoke-role",
      [Cl.standardPrincipal(user1), Cl.uint(8)],
      deployer
    );
    
    expect(result.result).toBeOk(Cl.bool(true));
    
    // Verify role was revoked
    const hasRole = simnet.callReadOnlyFn(
      "access-control",
      "has-role",
      [Cl.standardPrincipal(user1), Cl.uint(8)],
      deployer
    );
    
    expect(hasRole.result).toBeBool(false);
  });

  it("pauses and unpauses system", () => {
    // Pause system
    const pauseResult = simnet.callPublicFn(
      "access-control",
      "pause-system",
      [],
      deployer
    );
    
    expect(pauseResult.result).toBeOk(Cl.bool(true));
    
    // Check if paused
    const isPaused = simnet.callReadOnlyFn(
      "access-control",
      "is-system-paused",
      [],
      deployer
    );
    
    expect(isPaused.result).toBeBool(true);
    
    // Unpause system
    const unpauseResult = simnet.callPublicFn(
      "access-control",
      "unpause-system",
      [],
      deployer
    );
    
    expect(unpauseResult.result).toBeOk(Cl.bool(true));
  });
});