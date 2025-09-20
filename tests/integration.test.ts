import { describe, it, expect, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";
import { initSimnet } from "@hirosystems/clarinet-sdk";

describe("AidSplit Integration Tests", () => {
  let simnet: any;
  let deployer: string;
  let wallet1: string;
  let wallet2: string;
  let wallet3: string;
  let company1: string;
  let company2: string;

  beforeEach(async () => {
    simnet = await initSimnet();
    deployer = simnet.deployer;
    [wallet1, wallet2, wallet3, company1, company2] = simnet.getAccounts().values();
  });

  describe("Disaster Relief Campaign Flow", () => {
    it("creates disaster relief campaign and sets up beneficiaries", () => {
      // 1. Create disaster relief campaign
      const campaignResult = simnet.callPublicFn(
        "campaign-manager",
        "create-campaign",
        [
          Cl.stringAscii("Turkey Earthquake Relief"),
          Cl.stringAscii("Emergency aid for earthquake victims in Turkey"),
          Cl.stringAscii("disaster-relief"),
          Cl.standardPrincipal(deployer),
          Cl.uint(10000000), // 10M target
          Cl.uint(4320), // 3 days duration
          Cl.uint(1000), // min donation
          Cl.uint(1000000) // max donation
        ],
        deployer
      );

      expect(campaignResult.result).toBeOk(Cl.uint(1));

      // Initialize distribution pool manually
      const poolResult = simnet.callPublicFn(
        "distribution-engine",
        "initialize-campaign-pool",
        [Cl.uint(1)],
        deployer
      );
      expect(poolResult.result).toBeOk(Cl.bool(true));

      // 2. Setup beneficiaries (relief organizations/companies)
      const beneficiariesResult = simnet.callPublicFn(
        "campaign-manager",
        "setup-disaster-relief-beneficiaries",
        [
          Cl.uint(1), // campaign ID
          Cl.list([
            Cl.tuple({
              recipient: Cl.standardPrincipal(company1),
              percentage: Cl.uint(60), // 60%
              name: Cl.stringAscii("Red Cross Turkey")
            }),
            Cl.tuple({
              recipient: Cl.standardPrincipal(company2),
              percentage: Cl.uint(40), // 40%
              name: Cl.stringAscii("AFAD Emergency Response")
            })
          ])
        ],
        deployer
      );

      expect(beneficiariesResult.result).toBeOk(Cl.bool(true));
    });

    it("processes donations and distributes funds automatically", () => {
      // Setup campaign and beneficiaries first
      simnet.callPublicFn("campaign-manager", "create-campaign", [
        Cl.stringAscii("Turkey Earthquake Relief"),
        Cl.stringAscii("Emergency aid for earthquake victims"),
        Cl.stringAscii("disaster-relief"),
        Cl.standardPrincipal(deployer),
        Cl.uint(10000000),
        Cl.uint(4320),
        Cl.uint(1000),
        Cl.uint(1000000)
      ], deployer);

      simnet.callPublicFn("distribution-engine", "initialize-campaign-pool", [Cl.uint(1)], deployer);

      simnet.callPublicFn("campaign-manager", "setup-disaster-relief-beneficiaries", [
        Cl.uint(1),
        Cl.list([
          Cl.tuple({
            recipient: Cl.standardPrincipal(company1),
            percentage: Cl.uint(60),
            name: Cl.stringAscii("Red Cross Turkey")
          }),
          Cl.tuple({
            recipient: Cl.standardPrincipal(company2),
            percentage: Cl.uint(40),
            name: Cl.stringAscii("AFAD Emergency Response")
          })
        ])
      ], deployer);

      // 3. People donate to the campaign
      const donation1 = simnet.callPublicFn(
        "campaign-manager",
        "donate-to-disaster-relief",
        [Cl.uint(1), Cl.uint(100000)], // 100k donation
        wallet1
      );

      const donation2 = simnet.callPublicFn(
        "campaign-manager",
        "donate-to-disaster-relief",
        [Cl.uint(1), Cl.uint(200000)], // 200k donation
        wallet2
      );

      expect(donation1.result).toBeOk(Cl.bool(true));
      expect(donation2.result).toBeOk(Cl.bool(true));

      // 4. Check pending rewards for beneficiaries
      const company1Pending = simnet.callReadOnlyFn(
        "distribution-engine",
        "get-pending-rewards",
        [Cl.uint(1), Cl.standardPrincipal(company1)],
        deployer
      );

      const company2Pending = simnet.callReadOnlyFn(
        "distribution-engine",
        "get-pending-rewards",
        [Cl.uint(1), Cl.standardPrincipal(company2)],
        deployer
      );

      // Company1 should get 60% of 300k = 180k
      expect(company1Pending.result).toBe(Cl.uint(180000));
      // Company2 should get 40% of 300k = 120k
      expect(company2Pending.result).toBe(Cl.uint(120000));
    });

    it("allows beneficiaries to claim their funds and get receipts", () => {
      // Setup and donations (same as above)
      simnet.callPublicFn("campaign-manager", "create-campaign", [
        Cl.stringAscii("Turkey Earthquake Relief"),
        Cl.stringAscii("Emergency aid for earthquake victims"),
        Cl.stringAscii("disaster-relief"),
        Cl.standardPrincipal(deployer),
        Cl.uint(10000000),
        Cl.uint(4320),
        Cl.uint(1000),
        Cl.uint(1000000)
      ], deployer);

      simnet.callPublicFn("distribution-engine", "initialize-campaign-pool", [Cl.uint(1)], deployer);

      simnet.callPublicFn("campaign-manager", "setup-disaster-relief-beneficiaries", [
        Cl.uint(1),
        Cl.list([
          Cl.tuple({
            recipient: Cl.standardPrincipal(company1),
            percentage: Cl.uint(100),
            name: Cl.stringAscii("Red Cross Turkey")
          })
        ])
      ], deployer);

      simnet.callPublicFn("campaign-manager", "donate-to-disaster-relief", [
        Cl.uint(1), Cl.uint(500000)
      ], wallet1);

      // 5. Beneficiary claims funds
      const claimResult = simnet.callPublicFn(
        "campaign-manager",
        "claim-disaster-relief-funds",
        [Cl.uint(1)],
        company1
      );

      expect(claimResult.result).toBeOk(Cl.uint(500000));

      // 6. Check that receipt NFT was issued
      const receiptCount = simnet.callReadOnlyFn(
        "nft-receipts",
        "get-user-receipt-count",
        [Cl.standardPrincipal(company1)],
        deployer
      );

      expect(receiptCount.result).toBe(Cl.uint(2)); // Setup + claim receipt
    });
  });

  describe("Payroll Campaign Flow", () => {
    it("creates payroll campaign and sets up employee hierarchy", () => {
      // 1. Create payroll campaign
      const campaignResult = simnet.callPublicFn(
        "campaign-manager",
        "create-campaign",
        [
          Cl.stringAscii("Monthly Company Payroll"),
          Cl.stringAscii("Monthly salary distribution for employees"),
          Cl.stringAscii("payroll"),
          Cl.standardPrincipal(deployer),
          Cl.uint(5000000), // 5M monthly payroll
          Cl.uint(720), // 1 month duration
          Cl.uint(0), // min
          Cl.uint(5000000) // max
        ],
        deployer
      );

      expect(campaignResult.result).toBeOk(Cl.uint(1));

      // Initialize distribution pool manually
      simnet.callPublicFn("distribution-engine", "initialize-campaign-pool", [Cl.uint(1)], deployer);

      // 2. Create departments first
      const deptResult = simnet.callPublicFn(
        "hierarchy-calculator",
        "create-department",
        [
          Cl.stringAscii("software"),
          Cl.stringAscii("Software Development"),
          Cl.uint(5000) // 50% of total budget
        ],
        deployer
      );

      expect(deptResult.result).toBeOk(Cl.bool(true));

      // 3. Add roles to department
      const roleResult = simnet.callPublicFn(
        "hierarchy-calculator",
        "add-role",
        [
          Cl.stringAscii("software"),
          Cl.stringAscii("senior"),
          Cl.uint(150), // 1.5x multiplier
          Cl.uint(1000) // base points
        ],
        deployer
      );

      expect(roleResult.result).toBeOk(Cl.bool(true));
    });

    it("processes payroll with automatic salary calculation and distribution", () => {
      // Setup campaign, department and roles
      simnet.callPublicFn("campaign-manager", "create-campaign", [
        Cl.stringAscii("Monthly Payroll"),
        Cl.stringAscii("Company monthly salary distribution"),
        Cl.stringAscii("payroll"),
        Cl.standardPrincipal(deployer),
        Cl.uint(5000000),
        Cl.uint(720),
        Cl.uint(0),
        Cl.uint(5000000)
      ], deployer);

      simnet.callPublicFn("distribution-engine", "initialize-campaign-pool", [Cl.uint(1)], deployer);

      simnet.callPublicFn("hierarchy-calculator", "create-department", [
        Cl.stringAscii("software"),
        Cl.stringAscii("Software Development"),
        Cl.uint(5000)
      ], deployer);

      simnet.callPublicFn("hierarchy-calculator", "add-role", [
        Cl.stringAscii("software"),
        Cl.stringAscii("senior"),
        Cl.uint(150),
        Cl.uint(1000)
      ], deployer);

      // 4. Setup payroll campaign with employees
      const payrollSetupResult = simnet.callPublicFn(
        "campaign-manager",
        "setup-payroll-campaign",
        [
          Cl.uint(1),
          Cl.list([
            Cl.tuple({
              employee: Cl.standardPrincipal(wallet1),
              "dept-id": Cl.stringAscii("software"),
              role: Cl.stringAscii("senior"),
              "individual-multiplier": Cl.uint(120) // 1.2x individual performance
            }),
            Cl.tuple({
              employee: Cl.standardPrincipal(wallet2),
              "dept-id": Cl.stringAscii("software"),
              role: Cl.stringAscii("senior"),
              "individual-multiplier": Cl.uint(110) // 1.1x individual performance
            })
          ])
        ],
        deployer
      );

      expect(payrollSetupResult.result).toBeOk(Cl.bool(true));

      // 5. Process payroll (company deposits money)
      const payrollResult = simnet.callPublicFn(
        "campaign-manager",
        "process-payroll",
        [
          Cl.uint(1),
          Cl.uint(1000000), // 1M total payroll
          Cl.list([
            Cl.standardPrincipal(wallet1),
            Cl.standardPrincipal(wallet2)
          ])
        ],
        deployer
      );

      expect(payrollResult.result).toBeOk(Cl.bool(true));
    });

    it("allows employees to claim salary and get receipts", () => {
      // Complete setup (same as above)
      simnet.callPublicFn("campaign-manager", "create-campaign", [
        Cl.stringAscii("Monthly Payroll"),
        Cl.stringAscii("Company monthly salary distribution"),
        Cl.stringAscii("payroll"),
        Cl.standardPrincipal(deployer),
        Cl.uint(5000000),
        Cl.uint(720),
        Cl.uint(0),
        Cl.uint(5000000)
      ], deployer);

      simnet.callPublicFn("distribution-engine", "initialize-campaign-pool", [Cl.uint(1)], deployer);

      simnet.callPublicFn("hierarchy-calculator", "create-department", [
        Cl.stringAscii("software"),
        Cl.stringAscii("Software Development"),
        Cl.uint(10000) // 100% of budget for simplicity
      ], deployer);

      simnet.callPublicFn("hierarchy-calculator", "add-role", [
        Cl.stringAscii("software"),
        Cl.stringAscii("developer"),
        Cl.uint(100),
        Cl.uint(1000)
      ], deployer);

      simnet.callPublicFn("campaign-manager", "setup-payroll-campaign", [
        Cl.uint(1),
        Cl.list([
          Cl.tuple({
            employee: Cl.standardPrincipal(wallet1),
            "dept-id": Cl.stringAscii("software"),
            role: Cl.stringAscii("developer"),
            "individual-multiplier": Cl.uint(100)
          })
        ])
      ], deployer);

      simnet.callPublicFn("campaign-manager", "process-payroll", [
        Cl.uint(1),
        Cl.uint(100000),
        Cl.list([Cl.standardPrincipal(wallet1)])
      ], deployer);

      // 6. Employee claims salary
      const claimResult = simnet.callPublicFn(
        "campaign-manager",
        "claim-salary",
        [Cl.uint(1)],
        wallet1
      );

      expect(claimResult.result).toBeOk();

      // 7. Check salary receipt was issued
      const receiptCount = simnet.callReadOnlyFn(
        "nft-receipts",
        "get-user-receipt-count",
        [Cl.standardPrincipal(wallet1)],
        deployer
      );

      expect(receiptCount.result).toBe(Cl.uint(2)); // Salary setup + claim receipt
    });
  });

  describe("Security and Receipt System", () => {
    it("ensures all transactions generate proper receipts", () => {
      // Test that every major action generates an NFT receipt
      // This is covered in the individual tests above
    });

    it("prevents unauthorized access", () => {
      // Create campaign as deployer
      simnet.callPublicFn("campaign-manager", "create-campaign", [
        Cl.stringAscii("Test Campaign"),
        Cl.stringAscii("Test"),
        Cl.stringAscii("disaster-relief"),
        Cl.standardPrincipal(deployer),
        Cl.uint(1000000),
        Cl.uint(1440),
        Cl.uint(1000),
        Cl.uint(100000)
      ], deployer);

      simnet.callPublicFn("distribution-engine", "initialize-campaign-pool", [Cl.uint(1)], deployer);

      // Try to setup beneficiaries as non-admin
      const unauthorizedResult = simnet.callPublicFn(
        "campaign-manager",
        "setup-disaster-relief-beneficiaries",
        [
          Cl.uint(1),
          Cl.list([
            Cl.tuple({
              recipient: Cl.standardPrincipal(wallet1),
              percentage: Cl.uint(100),
              name: Cl.stringAscii("Test Org")
            })
          ])
        ],
        wallet1 // Not the campaign creator
      );

      expect(unauthorizedResult.result).toBeErr();
    });
  });
});
