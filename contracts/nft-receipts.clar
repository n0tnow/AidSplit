;; =================================
;; AidSplit - NFT Receipts (SIP-009)
;; Soulbound certificates for donations and payroll
;; =================================

;; Constants
(define-constant ERR_UNAUTHORIZED (err u400))
(define-constant ERR_NOT_FOUND (err u401))
(define-constant ERR_SOULBOUND (err u402))
(define-constant ERR_INVALID_TOKEN (err u403))

;; NFT Definition
(define-non-fungible-token aidsplit-receipt uint)

;; Data Variables
(define-data-var next-token-id uint u1)
(define-data-var contract-owner principal tx-sender)
(define-data-var base-uri (string-ascii 256) "https://api.aidsplit.org/receipts/")

;; Receipt metadata
(define-map receipt-metadata
  {token-id: uint}
  {
    campaign-id: uint,
    recipient: principal,
    receipt-type: (string-ascii 20),
    amount: uint,
    issued-at: uint,
    campaign-name: (string-ascii 100),
    is-soulbound: bool,
    issuer: principal
  })

;; User receipt tracking
(define-map user-receipt-counts
  {user: principal}
  {count: uint}
)

;; SIP-009 Implementation
(define-read-only (get-last-token-id)
  (ok (- (var-get next-token-id) u1))
)

(define-read-only (get-token-uri (token-id uint))
  (if (is-some (nft-get-owner? aidsplit-receipt token-id))
    (ok (some (concat (var-get base-uri) (uint-to-ascii token-id))))
    ERR_NOT_FOUND
  )
)

(define-read-only (get-owner (token-id uint))
  (ok (nft-get-owner? aidsplit-receipt token-id))
)

;; Transfer function - respects soulbound property
(define-public (transfer (token-id uint) (sender principal) (recipient principal))
  (let (
    (metadata (unwrap! (get-receipt-metadata token-id) ERR_NOT_FOUND))
    (current-owner (unwrap! (nft-get-owner? aidsplit-receipt token-id) ERR_NOT_FOUND))
  )
    ;; Verify sender is the current owner
    (asserts! (is-eq tx-sender sender) ERR_UNAUTHORIZED)
    (asserts! (is-eq sender current-owner) ERR_UNAUTHORIZED)
    
    ;; Check if soulbound
    (if (get is-soulbound metadata)
      ERR_SOULBOUND
      (nft-transfer? aidsplit-receipt token-id sender recipient)
    )
  )
)

;; Read functions
(define-read-only (get-receipt-metadata (token-id uint))
  (map-get? receipt-metadata {token-id: token-id})
)

(define-read-only (get-user-receipt-count (user principal))
  (default-to u0 (get count (map-get? user-receipt-counts {user: user})))
)

;; Mint receipt function
(define-public (mint-receipt 
  (to principal)
  (campaign-id uint)
  (receipt-type (string-ascii 20))
  (amount uint)
  (campaign-name (string-ascii 100))
  (is-soulbound bool)
  )
  (let (
    (token-id (var-get next-token-id))
  )
    ;; Authorization check - can be called by contract owner
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    
    ;; Validate inputs
    (asserts! (> amount u0) ERR_INVALID_TOKEN)
    
    ;; Mint NFT
    (try! (nft-mint? aidsplit-receipt token-id to))
    
    ;; Set metadata
    (map-set receipt-metadata
      {token-id: token-id}
      {
        campaign-id: campaign-id,
        recipient: to,
        receipt-type: receipt-type,
        amount: amount,
        issued-at: burn-block-height,
        campaign-name: campaign-name,
        is-soulbound: is-soulbound,
        issuer: tx-sender
      }
    )
    
    ;; Update user receipt count
    (let (
      (user-count (get-user-receipt-count to))
    )
      (map-set user-receipt-counts
        {user: to}
        {count: (+ user-count u1)}
      )
    )
    
    ;; Update token ID counter
    (var-set next-token-id (+ token-id u1))
    
    (print {
      action: "receipt-minted",
      token-id: token-id,
      to: to,
      campaign-id: campaign-id,
      type: receipt-type,
      amount: amount,
      is-soulbound: is-soulbound
    })
    
    (ok token-id)
  )
)

;; Batch mint receipts
(define-public (batch-mint-receipts
  (recipients-data (list 25 {
    to: principal,
    campaign-id: uint,
    receipt-type: (string-ascii 20),
    amount: uint
  }))
  (campaign-name (string-ascii 100))
  (is-soulbound bool)
  )
  (fold batch-mint-fold recipients-data (ok u0))
)

(define-private (batch-mint-fold
  (item {
    to: principal,
    campaign-id: uint,
    receipt-type: (string-ascii 20),
    amount: uint
  })
  (prev-result (response uint uint))
  )
  (match prev-result
    success (mint-receipt 
              (get to item)
              (get campaign-id item)
              (get receipt-type item)
              (get amount item)
              "Batch Campaign"
              true)
    error (err error)
  )
)

;; Burn receipt function
(define-public (burn-receipt (token-id uint))
  (let (
    (owner (unwrap! (nft-get-owner? aidsplit-receipt token-id) ERR_NOT_FOUND))
  )
    ;; Only owner can burn
    (asserts! (is-eq tx-sender owner) ERR_UNAUTHORIZED)
    
    ;; Execute burn
    (try! (nft-burn? aidsplit-receipt token-id owner))
    
    ;; Clean up metadata
    (map-delete receipt-metadata {token-id: token-id})
    
    (print {action: "receipt-burned", token-id: token-id})
    (ok true)
  )
)

;; Verification function
(define-read-only (verify-receipt 
  (token-id uint)
  (expected-campaign-id uint)
  (expected-amount uint)
  )
  (match (get-receipt-metadata token-id)
    metadata (ok (and (is-eq (get campaign-id metadata) expected-campaign-id)
                      (is-eq (get amount metadata) expected-amount)))
    ERR_NOT_FOUND
  )
)

;; Admin functions
(define-public (set-base-uri (new-uri (string-ascii 256)))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (var-set base-uri new-uri)
    (ok true)
  )
)

(define-public (update-contract-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (var-set contract-owner new-owner)
    (ok true)
  )
)

;; Simple uint to string conversion
(define-read-only (uint-to-ascii (value uint))
  (if (<= value u9)
    (unwrap-panic (element-at "0123456789" value))
    (if (<= value u99)
      (concat (unwrap-panic (element-at "0123456789" (/ value u10)))
              (unwrap-panic (element-at "0123456789" (mod value u10))))
      (if (<= value u999)
        (concat (concat (unwrap-panic (element-at "0123456789" (/ value u100)))
                        (unwrap-panic (element-at "0123456789" (/ (mod value u100) u10))))
                (unwrap-panic (element-at "0123456789" (mod value u10))))
        "999+"))))