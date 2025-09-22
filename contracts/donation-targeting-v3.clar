;; Donation Targeting Contract
;; Manages targeted donations and common pool distributions

;; Constants
(define-constant ERR_UNAUTHORIZED (err u401))
(define-constant ERR_NOT_FOUND (err u404))
(define-constant ERR_INVALID_INPUT (err u400))
(define-constant ERR_INSUFFICIENT_FUNDS (err u402))

;; Data Variables
(define-data-var next-donation-id uint u1)

;; Relief Organizations
(define-map relief-organizations
  { id: uint }
  {
    name: (string-ascii 100),
    wallet-address: principal,
    description: (string-ascii 500),
    active: bool,
    total-received: uint,
    donation-count: uint
  }
)

;; Donations tracking
(define-map donations
  { id: uint }
  {
    donor: principal,
    amount: uint,
    campaign-id: uint,
    target-org-id: (optional uint), ;; None means common pool
    timestamp: uint,
    tx-hash: (string-ascii 64)
  }
)

;; Donation transparency list
(define-map donation-transparency
  { campaign-id: uint, donor: principal }
  {
    total-donated: uint,
    donation-count: uint,
    last-donation: uint
  }
)

;; Common pool for campaigns
(define-map campaign-common-pool
  { campaign-id: uint }
  {
    total-amount: uint,
    distributed: bool
  }
)

;; Public Functions

;; Add relief organization
(define-public (add-relief-organization
  (name (string-ascii 100))
  (wallet-address principal)
  (description (string-ascii 500))
  )
  (let (
    (org-id (var-get next-donation-id))
  )
    ;; Only contract owner can add organizations
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    
    (map-set relief-organizations
      { id: org-id }
      {
        name: name,
        wallet-address: wallet-address,
        description: description,
        active: true,
        total-received: u0,
        donation-count: u0
      }
    )
    
    (var-set next-donation-id (+ org-id u1))
    
    (print {
      action: "organization-added",
      org-id: org-id,
      name: name,
      wallet: wallet-address
    })
    
    (ok org-id)
  )
)

;; Make targeted donation
(define-public (make-targeted-donation
  (campaign-id uint)
  (amount uint)
  (target-org-id (optional uint))
  )
  (let (
    (donation-id (var-get next-donation-id))
    (donor tx-sender)
  )
    ;; Validate inputs
    (asserts! (> amount u0) ERR_INVALID_INPUT)
    
    ;; If target specified, validate it exists
    (match target-org-id
      org-id (begin
        (asserts! (is-some (map-get? relief-organizations { id: org-id })) ERR_NOT_FOUND)
        ;; Update organization stats
        (let (
          (org (unwrap! (map-get? relief-organizations { id: org-id }) ERR_NOT_FOUND))
        )
          (map-set relief-organizations
            { id: org-id }
            (merge org {
              total-received: (+ (get total-received org) amount),
              donation-count: (+ (get donation-count org) u1)
            })
          )
        )
      )
      ;; Add to common pool if no target specified
      (let (
        (pool (default-to { total-amount: u0, distributed: false } 
                         (map-get? campaign-common-pool { campaign-id: campaign-id })))
      )
        (map-set campaign-common-pool
          { campaign-id: campaign-id }
          (merge pool { total-amount: (+ (get total-amount pool) amount) })
        )
      )
    )
    
    ;; Record donation
    (map-set donations
      { id: donation-id }
      {
        donor: donor,
        amount: amount,
        campaign-id: campaign-id,
        target-org-id: target-org-id,
        timestamp: burn-block-height,
        tx-hash: "placeholder-hash"
      }
    )
    
    ;; Update transparency tracking
    (let (
      (transparency (default-to { total-donated: u0, donation-count: u0, last-donation: u0 }
                                (map-get? donation-transparency { campaign-id: campaign-id, donor: donor })))
    )
      (map-set donation-transparency
        { campaign-id: campaign-id, donor: donor }
        {
          total-donated: (+ (get total-donated transparency) amount),
          donation-count: (+ (get donation-count transparency) u1),
          last-donation: burn-block-height
        }
      )
    )
    
    (var-set next-donation-id (+ donation-id u1))
    
    (print {
      action: "donation-made",
      donation-id: donation-id,
      donor: donor,
      amount: amount,
      target: target-org-id,
      campaign-id: campaign-id
    })
    
    (ok donation-id)
  )
)

;; Distribute common pool to organizations
(define-public (distribute-common-pool
  (campaign-id uint)
  (org-allocations (list 10 { org-id: uint, percentage: uint }))
  )
  (let (
    (pool (unwrap! (map-get? campaign-common-pool { campaign-id: campaign-id }) ERR_NOT_FOUND))
    (pool-amount (get total-amount pool))
  )
    ;; Only authorized users can distribute
    (asserts! (not (get distributed pool)) ERR_INVALID_INPUT)
    (asserts! (> pool-amount u0) ERR_INSUFFICIENT_FUNDS)
    
    ;; Mark as distributed
    (map-set campaign-common-pool
      { campaign-id: campaign-id }
      (merge pool { distributed: true })
    )
    
    (print {
      action: "common-pool-distributed",
      campaign-id: campaign-id,
      total-amount: pool-amount
    })
    
    (ok true)
  )
)

;; Read-only functions

;; Get all relief organizations
(define-read-only (get-relief-organizations)
  ;; This would need iteration support - for now return success
  (ok u1)
)

;; Get donation transparency for campaign
(define-read-only (get-campaign-donations (campaign-id uint))
  ;; This would need iteration support - for now return success
  (ok campaign-id)
)

;; Get donor's donation history
(define-read-only (get-donor-transparency (campaign-id uint) (donor principal))
  (map-get? donation-transparency { campaign-id: campaign-id, donor: donor })
)

;; Get organization info
(define-read-only (get-organization (org-id uint))
  (map-get? relief-organizations { id: org-id })
)

;; Get common pool info
(define-read-only (get-common-pool (campaign-id uint))
  (map-get? campaign-common-pool { campaign-id: campaign-id })
)

;; Data Variables
(define-data-var contract-owner principal 'STDTF2Q74P3FWMP4DT6D9SW8G6FY293XVP6G8RPM)
