import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const employee1 = accounts.get("wallet_1")!;
const employee2 = accounts.get("wallet_2")!;

describe("Hierarchy Calculator Tests", () => {
  beforeEach(() => {
    // Reset state
  });

  it("creates department successfully", () => {
    const result = simnet.callPublicFn(
      "hierarchy-calculator",
      "create-department",
      [
        Cl.stringAscii("software"),
        Cl.stringAscii("Software Development Department"),
        Cl.uint(5000) // 50%
      ],
      deployer
    );
    
    expect(result.result).toBeOk(Cl.bool(true));
    
    // Verify department exists
    const dept = simnet.callReadOnlyFn(
      "hierarchy-calculator",
      "get-department",
      [Cl.stringAscii("software")],
      deployer
    );
    
    expect(dept.result).toBeTypeOf(Cl.some());
  });

  it("adds role to department successfully", () => {
    // Create department first
    simnet.callPublicFn(
      "hierarchy-calculator",
      "create-department",
      [
        Cl.stringAscii("software"),
        Cl.stringAscii("Software Development Department"),
        Cl.uint(5000)
      ],
      deployer
    );
    
    // Add role
    const result = simnet.callPublicFn(
      "hierarchy-calculator",
      "add-role",
      [
        Cl.stringAscii("software"),
        Cl.stringAscii("senior"),
        Cl.uint(300), // 3x multiplier
        Cl.uint(50000)
      ],
      deployer
    );
    
    expect(result.result).toBeOk(Cl.bool(true));
  });

  it("assigns employee to role successfully", () => {
    // Setup department and role
    simnet.callPublicFn("hierarchy-calculator", "create-department", 
      [Cl.stringAscii("software"), Cl.stringAscii("Software"), Cl.uint(5000)], deployer);
    simnet.callPublicFn("hierarchy-calculator", "add-role",
      [Cl.stringAscii("software"), Cl.stringAscii("senior"), Cl.uint(300), Cl.uint(50000)], deployer);
    
    // Assign employee
    const result = simnet.callPublicFn(
      "hierarchy-calculator", 
      "assign-employee",
      [
        Cl.standardPrincipal(employee1),
        Cl.stringAscii("software"),
        Cl.stringAscii("senior"),
        Cl.uint(120), // 1.2x individual multiplier
        Cl.uint(85) // 85% performance rating
      ],
      deployer
    );
    
    expect(result.result).toBeOk(Cl.bool(true));
    
    // Verify employee was assigned
    const emp = simnet.callReadOnlyFn(
      "hierarchy-calculator",
      "get-employee",
      [Cl.standardPrincipal(employee1)],
      deployer
    );
    
    expect(emp.result).toBeTypeOf(Cl.some());
  });

  it("calculates payroll shares correctly", () => {
    // Full setup
    simnet.callPublicFn("hierarchy-calculator", "create-department", 
      [Cl.stringAscii("software"), Cl.stringAscii("Software"), Cl.uint(5000)], deployer);
    simnet.callPublicFn("hierarchy-calculator", "add-role",
      [Cl.stringAscii("software"), Cl.stringAscii("senior"), Cl.uint(200), Cl.uint(50000)], deployer);
    simnet.callPublicFn("hierarchy-calculator", "assign-employee",
      [Cl.standardPrincipal(employee1), Cl.stringAscii("software"), Cl.stringAscii("senior"),
       Cl.uint(100), Cl.uint(80)], deployer);
    
    // Calculate payroll
    const result = simnet.callPublicFn(
      "hierarchy-calculator",
      "calculate-payroll-shares",
      [Cl.uint(1), Cl.standardPrincipal(employee1)],
      deployer
    );
    
    expect(result.result).toBeTypeOf(Cl.ok());
  });

  it("batch calculates payroll for multiple employees", () => {
    // Setup two employees
    simnet.callPublicFn("hierarchy-calculator", "create-department", 
      [Cl.stringAscii("software"), Cl.stringAscii("Software"), Cl.uint(5000)], deployer);
    simnet.callPublicFn("hierarchy-calculator", "add-role",
      [Cl.stringAscii("software"), Cl.stringAscii("junior"), Cl.uint(100), Cl.uint(30000)], deployer);
    simnet.callPublicFn("hierarchy-calculator", "assign-employee",
      [Cl.standardPrincipal(employee1), Cl.stringAscii("software"), Cl.stringAscii("junior"),
       Cl.uint(100), Cl.uint(75)], deployer);
    simnet.callPublicFn("hierarchy-calculator", "assign-employee",
      [Cl.standardPrincipal(employee2), Cl.stringAscii("software"), Cl.stringAscii("junior"),
       Cl.uint(110), Cl.uint(85)], deployer);
    
    // Batch calculate
    const result = simnet.callPublicFn(
      "hierarchy-calculator",
      "batch-calculate-payroll",
      [
        Cl.uint(1),
        Cl.list([
          Cl.standardPrincipal(employee1),
          Cl.standardPrincipal(employee2)
        ])
      ],
      deployer
    );
    
    expect(result.result).toBeTypeOf(Cl.ok()); // Success
  });
});
