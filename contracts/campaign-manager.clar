;; =================================
;; AidSplit - Campaign Manager
;; Manages disaster relief and payroll campaigns
;; =================================

;; Constants
(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_INVALID_AMOUNT (err u102))
(define-constant ERR_CAMPAIGN_INACTIVE (err u103))
(define-constant ERR_INVALID_TIME (err u104))

;; Campaign types
(define-constant CAMPAIGN_TYPE_DISASTER_RELIEF "disaster-relief")
(define-constant CAMPAIGN_TYPE_PAYROLL "payroll")

;; Data Variables
(define-data-var next-campaign-id uint u1)
(define-data-var contract-owner principal tx-sender)

;; Campaign definitions
(define-map campaigns
  {id: uint}
  {
    name: (string-ascii 100),
    description: (string-ascii 500),
    campaign-type: (string-ascii 20),
    creator: principal,
    token: principal,
    target-amount: uint,
    current-amount: uint,
    start: uint,
    end: uint,
    active: bool,
    min-donation: uint,
    max-donation: uint,
    fee-bps: uint,
    fee-recipient: principal,
    require-kyc: bool,
    created-at: uint
  })

;; Campaign admins
(define-map campaign-admins
  {campaign-id: uint, admin: principal}
  {is-admin: bool, assigned-at: uint})

;; KYC whitelist
(define-map kyc-allow
  {id: uint, who: principal}
  {v: bool})

;; Helper function to check if user is campaign admin
(define-read-only (is-campaign-admin (campaign-id uint) (user principal))
  (or
    (is-eq user (var-get contract-owner))
    (match (map-get? campaigns {id: campaign-id})
      camp (is-eq user (get creator camp))
      false)
    (default-to false (get is-admin (map-get? campaign-admins {campaign-id: campaign-id, admin: user})))
  )
)

;; Create campaign
(define-public (create-campaign
  (name (string-ascii 100))
  (description (string-ascii 500))
  (campaign-type (string-ascii 20))
  (token principal)
  (target-amount uint)
  (duration uint)
  (min-donation uint)
  (max-donation uint)
  )
  (let (
    (campaign-id (var-get next-campaign-id))
    (start-block burn-block-height)
    (end-block (+ start-block duration))
  )
    (asserts! (> target-amount u0) ERR_INVALID_AMOUNT)
    (asserts! (> duration u0) ERR_INVALID_TIME)
    (asserts! (<= min-donation max-donation) ERR_INVALID_AMOUNT)
    
    (map-set campaigns
      {id: campaign-id}
      {
        name: name,
        description: description,
        campaign-type: campaign-type,
        creator: tx-sender,
        token: token,
        target-amount: target-amount,
        current-amount: u0,
        start: start-block,
        end: end-block,
        active: true,
        min-donation: min-donation,
        max-donation: max-donation,
        fee-bps: u250,
        fee-recipient: (var-get contract-owner),
        require-kyc: false,
        created-at: burn-block-height
      }
    )
    
    ;; Distribution pool will be initialized manually when needed
    
    ;; Update campaign ID counter
    (var-set next-campaign-id (+ campaign-id u1))
    
    (print {
      action: "campaign-created",
      campaign-id: campaign-id,
      name: name,
      type: campaign-type,
      creator: tx-sender
    })
    
    (ok campaign-id)
  )
)

;; Set fee function
(define-public (set-fee (id uint) (fee-bps uint) (fee-recipient principal))
(begin
(asserts! (is-campaign-admin id tx-sender) ERR_UNAUTHORIZED)
(asserts! (<= fee-bps u10000) ERR_INVALID_AMOUNT)
(let ((c (map-get? campaigns {id: id})))
(match c
camp (begin (map-set campaigns {id: id} (merge camp {fee-bps: fee-bps, fee-recipient: fee-recipient})) (ok true))
ERR_NOT_FOUND)))
)

;; Set KYC requirement
(define-public (set-require-kyc (id uint) (flag bool))
(begin
(asserts! (is-campaign-admin id tx-sender) ERR_UNAUTHORIZED)
(let ((c (map-get? campaigns {id: id})))
(match c
camp (begin (map-set campaigns {id: id} (merge camp {require-kyc: flag})) (ok true))
ERR_NOT_FOUND)))
)

;; Set KYC status
(define-public (set-kyc-status (id uint) (who principal) (flag bool))
(begin
(asserts! (is-campaign-admin id tx-sender) ERR_UNAUTHORIZED)
(if flag
(map-set kyc-allow {id: id, who: who} {v: true})
(map-delete kyc-allow {id: id, who: who}))
(ok true)))

;; Check KYC approval
(define-read-only (is-kyc-approved (id uint) (who principal))
(is-some (map-get? kyc-allow {id: id, who: who}))
)

;; Get campaign
(define-read-only (get-campaign (id uint))
(match (map-get? campaigns {id: id})
c (ok c)
ERR_NOT_FOUND))

;; Get campaign settings
(define-read-only (get-campaign-settings (id uint))
(match (map-get? campaigns {id: id})
c (ok { token: (get token c),
active: (get active c),
start: (get start c),
end: (get end c),
min-donation: (get min-donation c),
max-donation: (get max-donation c),
fee-bps: (get fee-bps c),
fee-recipient: (get fee-recipient c),
require-kyc: (get require-kyc c) })
ERR_NOT_FOUND))

;; Donate to disaster relief campaign with optional targeting
(define-public (donate-to-disaster-relief
  (campaign-id uint)
  (amount uint)
  (target-org-id (optional uint))
  )
  (let (
    (campaign (unwrap! (get-campaign campaign-id) ERR_NOT_FOUND))
  )
    (asserts! (is-eq (get campaign-type campaign) CAMPAIGN_TYPE_DISASTER_RELIEF) ERR_INVALID_AMOUNT)
    (asserts! (get active campaign) ERR_CAMPAIGN_INACTIVE)
    (asserts! (>= burn-block-height (get start campaign)) ERR_INVALID_TIME)
    (asserts! (<= burn-block-height (get end campaign)) ERR_INVALID_TIME)
    (asserts! (>= amount (get min-donation campaign)) ERR_INVALID_AMOUNT)
    (asserts! (<= amount (get max-donation campaign)) ERR_INVALID_AMOUNT)
    
    ;; Check KYC if required
    (if (get require-kyc campaign)
      (asserts! (is-kyc-approved campaign-id tx-sender) ERR_UNAUTHORIZED)
      true
    )
    
    ;; Update campaign amount
    (map-set campaigns
      {id: campaign-id}
      (merge campaign {current-amount: (+ (get current-amount campaign) amount)})
    )
    
    ;; Record targeted donation
    (try! (contract-call? .donation-targeting make-targeted-donation campaign-id amount target-org-id))
    
    ;; Deposit to distribution pool
    (try! (contract-call? .distribution-engine deposit-to-campaign campaign-id amount tx-sender))
    
    ;; Issue receipt NFT to donor
    (try! (contract-call? .nft-receipts mint-receipt 
            tx-sender 
            campaign-id 
            "donation" 
            amount 
            (get name campaign) 
            true))
    
    (print {
      action: "donation",
      campaign-id: campaign-id,
      donor: tx-sender,
      amount: amount,
      target-org: target-org-id
    })
    
    (ok true)
  )
)

;; Setup disaster relief beneficiaries (companies/organizations)
(define-public (setup-disaster-relief-beneficiaries
  (campaign-id uint)
  (beneficiaries (list 20 {recipient: principal, percentage: uint, name: (string-ascii 50)}))
  )
  (let (
    (campaign (unwrap! (get-campaign campaign-id) ERR_NOT_FOUND))
  )
    (asserts! (is-campaign-admin campaign-id tx-sender) ERR_UNAUTHORIZED)
    (asserts! (is-eq (get campaign-type campaign) CAMPAIGN_TYPE_DISASTER_RELIEF) ERR_INVALID_AMOUNT)
    
    ;; Convert percentages to shares (percentage * 10000 for precision)
    (let (
      (recipients-shares (map convert-percentage-to-shares beneficiaries))
    )
      ;; Set allocations in distribution engine
      (try! (contract-call? .distribution-engine batch-set-allocations campaign-id recipients-shares))
      
      ;; Issue setup receipts to beneficiaries
      (try! (fold issue-beneficiary-receipt beneficiaries (ok u0)))
    )
    
    (print {
      action: "disaster-relief-setup",
      campaign-id: campaign-id,
      beneficiary-count: (len beneficiaries)
    })
    
    (ok true)
  )
)

(define-private (convert-percentage-to-shares 
  (beneficiary {recipient: principal, percentage: uint, name: (string-ascii 50)})
  )
  {
    recipient: (get recipient beneficiary),
    shares: (* (get percentage beneficiary) u10000)
  }
)

(define-private (issue-beneficiary-receipt
  (beneficiary {recipient: principal, percentage: uint, name: (string-ascii 50)})
  (prev-result (response uint uint))
  )
  (match prev-result
    success (contract-call? .nft-receipts mint-receipt 
              (get recipient beneficiary)
              u0  ;; Campaign ID will be set when actual distribution happens
              "beneficiary-setup"
              (get percentage beneficiary)
              (get name beneficiary)
              true)
    error (err error)
  )
)

;; Create company payroll campaign (integrated with company-auth)
(define-public (create-company-payroll-campaign
  (campaign-name (string-ascii 100))
  (description (string-ascii 500))
  (total-budget uint)
  (duration uint)
  )
  (let (
    (admin tx-sender)
    (company-data (unwrap! (contract-call? .company-auth get-company-by-admin admin) ERR_UNAUTHORIZED))
  )
    ;; Create campaign
    (let (
      (campaign-id (unwrap! (create-campaign 
                            campaign-name 
                            description 
                            CAMPAIGN_TYPE_PAYROLL
                            admin ;; token (using admin as placeholder)
                            total-budget
                            duration
                            u1 ;; min donation
                            total-budget ;; max donation
                            ) ERR_NOT_FOUND))
    )
      (print {
        action: "company-payroll-campaign-created",
        campaign-id: campaign-id,
        company-admin: admin,
        budget: total-budget
      })
      
      (ok campaign-id)
    )
  )
)

;; Setup payroll campaign
(define-public (setup-payroll-campaign
  (campaign-id uint)
  (employees-data (list 50 {employee: principal, dept-id: (string-ascii 50), role: (string-ascii 50), individual-multiplier: uint}))
  )
  (let (
    (campaign (unwrap! (get-campaign campaign-id) ERR_NOT_FOUND))
  )
    (asserts! (is-campaign-admin campaign-id tx-sender) ERR_UNAUTHORIZED)
    (asserts! (is-eq (get campaign-type campaign) CAMPAIGN_TYPE_PAYROLL) ERR_INVALID_AMOUNT)
    
    ;; Setup employees in hierarchy calculator
    (try! (fold setup-employee-fold employees-data (ok u0)))
    
    ;; Calculate and set payroll allocations
    (let (
      (employee-list (map get-employee-principal employees-data))
    )
      ;; Set temp campaign ID for fold functions
      (var-set temp-campaign-id campaign-id)
      
      ;; Calculate payroll shares for all employees
      (try! (contract-call? .hierarchy-calculator batch-calculate-payroll campaign-id employee-list))
      
      ;; Get calculated shares and set them in distribution engine
      (try! (fold set-employee-allocation-fold employee-list (ok u0)))
    )
    
    (print {
      action: "payroll-setup",
      campaign-id: campaign-id,
      employee-count: (len employees-data)
    })
    
    (ok true)
  )
)

;; Employee setup helper functions
(define-private (setup-employee-fold 
  (emp-data {employee: principal, dept-id: (string-ascii 50), role: (string-ascii 50), individual-multiplier: uint})
  (prev-result (response uint uint))
  )
  (match prev-result
    success (match (contract-call? .hierarchy-calculator assign-employee
                     (get employee emp-data)
                     (get dept-id emp-data)
                     (get role emp-data)
                     (get individual-multiplier emp-data)
                     u100)
              employee-ok (ok (+ success u1))
              employee-error (err employee-error))
    error (err error)
  )
)

(define-private (get-employee-principal 
  (emp-data {employee: principal, dept-id: (string-ascii 50), role: (string-ascii 50), individual-multiplier: uint})
  )
  (get employee emp-data)
)

(define-data-var temp-campaign-id uint u0)

(define-private (set-employee-allocation-fold 
  (employee principal)
  (prev-result (response uint uint))
  )
  (match prev-result
    success (let (
              (campaign-id (var-get temp-campaign-id))
              (calculation (contract-call? .hierarchy-calculator get-payroll-calculation campaign-id employee))
            )
            (match calculation
              calc-result (match (contract-call? .distribution-engine set-allocation 
                                   campaign-id 
                                   employee 
                                   (get final-shares calc-result))
                            allocation-ok (ok (+ success u1))
                            allocation-error (err allocation-error))
              (ok (+ success u1))
            ))
    error (err error)
  )
)

;; Process payroll
(define-public (process-payroll
  (campaign-id uint)
  (total-amount uint)
  (employees (list 50 principal))
  )
  (let (
    (campaign (unwrap! (get-campaign campaign-id) ERR_NOT_FOUND))
  )
    (asserts! (is-campaign-admin campaign-id tx-sender) ERR_UNAUTHORIZED)
    (asserts! (is-eq (get campaign-type campaign) CAMPAIGN_TYPE_PAYROLL) ERR_INVALID_AMOUNT)
    (asserts! (> total-amount u0) ERR_INVALID_AMOUNT)
    
    ;; Set temp campaign ID for fold functions
    (var-set temp-campaign-id campaign-id)
    
    ;; Deposit total amount to distribution pool
    (try! (contract-call? .distribution-engine deposit-to-campaign campaign-id total-amount tx-sender))
    
    ;; Issue salary receipts to all employees
    (try! (fold issue-salary-receipt-fold employees (ok u0)))
    
    ;; Update campaign amount
    (map-set campaigns
      {id: campaign-id}
      (merge campaign {current-amount: (+ (get current-amount campaign) total-amount)})
    )
    
    (print {
      action: "payroll-processed",
      campaign-id: campaign-id,
      total-amount: total-amount,
      employee-count: (len employees)
    })
    
    (ok true)
  )
)

(define-private (issue-salary-receipt-fold 
  (employee principal)
  (prev-result (response uint uint))
  )
  (match prev-result
    success (let (
              (campaign-id (var-get temp-campaign-id))
              (calculation (contract-call? .hierarchy-calculator get-payroll-calculation campaign-id employee))
            )
            (match calculation
              calc-result (match (contract-call? .nft-receipts mint-receipt 
                                   employee
                                   campaign-id
                                   "salary"
                                   (get final-shares calc-result)
                                   "Monthly Salary"
                                   true)
                            receipt-ok (ok (+ success u1))
                            receipt-error (err receipt-error))
              (ok (+ success u1))
            ))
    error (err error)
  )
)

;; Add campaign admin
(define-public (add-campaign-admin (campaign-id uint) (admin principal))
  (let (
    (campaign (unwrap! (get-campaign campaign-id) ERR_NOT_FOUND))
  )
    (asserts! (is-eq tx-sender (get creator campaign)) ERR_UNAUTHORIZED)
    
    (map-set campaign-admins
      {campaign-id: campaign-id, admin: admin}
      {is-admin: true, assigned-at: burn-block-height}
    )
    
    (print {
      action: "admin-added",
      campaign-id: campaign-id,
      admin: admin
    })
    
    (ok true)
  )
)

;; Remove campaign admin
(define-public (remove-campaign-admin (campaign-id uint) (admin principal))
  (let (
    (campaign (unwrap! (get-campaign campaign-id) ERR_NOT_FOUND))
  )
    (asserts! (is-eq tx-sender (get creator campaign)) ERR_UNAUTHORIZED)
    
    (map-delete campaign-admins {campaign-id: campaign-id, admin: admin})
    
    (print {
      action: "admin-removed",
      campaign-id: campaign-id,
      admin: admin
    })
    
    (ok true)
  )
)

;; Claim disaster relief funds (for beneficiary organizations)
(define-public (claim-disaster-relief-funds (campaign-id uint))
  (let (
    (campaign (unwrap! (get-campaign campaign-id) ERR_NOT_FOUND))
    (pending-amount (contract-call? .distribution-engine get-pending-rewards campaign-id tx-sender))
  )
    (asserts! (is-eq (get campaign-type campaign) CAMPAIGN_TYPE_DISASTER_RELIEF) ERR_INVALID_AMOUNT)
    (asserts! (> pending-amount u0) ERR_INVALID_AMOUNT)
    
    ;; Claim from distribution engine
    (try! (contract-call? .distribution-engine claim-rewards campaign-id))
    
    ;; Issue claim receipt
    (try! (contract-call? .nft-receipts mint-receipt 
            tx-sender 
            campaign-id 
            "relief-claim" 
            pending-amount 
            (get name campaign) 
            true))
    
    (print {
      action: "disaster-relief-claimed",
      campaign-id: campaign-id,
      recipient: tx-sender,
      amount: pending-amount
    })
    
    (ok pending-amount)
  )
)

;; Claim salary (for employees)
(define-public (claim-salary (campaign-id uint))
  (let (
    (campaign (unwrap! (get-campaign campaign-id) ERR_NOT_FOUND))
    (pending-amount (contract-call? .distribution-engine get-pending-rewards campaign-id tx-sender))
  )
    (asserts! (is-eq (get campaign-type campaign) CAMPAIGN_TYPE_PAYROLL) ERR_INVALID_AMOUNT)
    (asserts! (> pending-amount u0) ERR_INVALID_AMOUNT)
    
    ;; Claim from distribution engine
    (try! (contract-call? .distribution-engine claim-rewards campaign-id))
    
    ;; Issue salary claim receipt
    (try! (contract-call? .nft-receipts mint-receipt 
            tx-sender 
            campaign-id 
            "salary-claim" 
            pending-amount 
            (get name campaign) 
            true))
    
    (print {
      action: "salary-claimed",
      campaign-id: campaign-id,
      employee: tx-sender,
      amount: pending-amount
    })
    
    (ok pending-amount)
  )
)

;; Additional transparency and integration functions

;; Get campaign transparency data
(define-read-only (get-campaign-transparency (campaign-id uint))
  (contract-call? .donation-targeting get-campaign-donations campaign-id)
)

;; Get user donation history
(define-read-only (get-user-donations (campaign-id uint) (user principal))
  (contract-call? .donation-targeting get-donor-transparency campaign-id user)
)

;; Get company employees (for transparency)
(define-read-only (get-company-employees-for-campaign (admin principal))
  (contract-call? .company-auth get-company-employees u1)
)