;; NFT Generator Contract
;; Generates NFT receipt metadata and integrates with external services

;; Constants
(define-constant ERR_UNAUTHORIZED (err u401))
(define-constant ERR_INVALID_INPUT (err u400))
(define-constant ERR_GENERATION_FAILED (err u500))

;; Data Variables
(define-data-var next-receipt-id uint u1)
(define-data-var contract-owner principal tx-sender)

;; NFT Receipt Metadata
(define-map nft-metadata
  { receipt-id: uint }
  {
    recipient: principal,
    amount: uint,
    receipt-type: (string-ascii 20),
    campaign-id: uint,
    description: (string-ascii 500),
    image-url: (string-ascii 200),
    generated-at: uint,
    ai-generated: bool
  }
)

;; Receipt generation requests
(define-map generation-requests
  { request-id: uint }
  {
    recipient: principal,
    amount: uint,
    receipt-type: (string-ascii 20),
    campaign-name: (string-ascii 100),
    status: (string-ascii 20), ;; "pending", "completed", "failed"
    created-at: uint,
    completed-at: (optional uint)
  }
)

;; Public Functions

;; Request NFT generation
(define-public (request-nft-generation
  (recipient principal)
  (amount uint)
  (receipt-type (string-ascii 20))
  (campaign-name (string-ascii 100))
  (description (string-ascii 500))
  )
  (let (
    (request-id (var-get next-receipt-id))
  )
    ;; Validate inputs
    (asserts! (> amount u0) ERR_INVALID_INPUT)
    (asserts! (> (len receipt-type) u0) ERR_INVALID_INPUT)
    
    ;; Create generation request
    (map-set generation-requests
      { request-id: request-id }
      {
        recipient: recipient,
        amount: amount,
        receipt-type: receipt-type,
        campaign-name: campaign-name,
        status: "pending",
        created-at: burn-block-height,
        completed-at: none
      }
    )
    
    ;; Create initial metadata (will be updated when generation completes)
    (map-set nft-metadata
      { receipt-id: request-id }
      {
        recipient: recipient,
        amount: amount,
        receipt-type: receipt-type,
        campaign-id: u0, ;; Will be updated
        description: description,
        image-url: "", ;; Will be updated with AI-generated image
        generated-at: burn-block-height,
        ai-generated: true
      }
    )
    
    (var-set next-receipt-id (+ request-id u1))
    
    (print {
      action: "nft-generation-requested",
      request-id: request-id,
      recipient: recipient,
      amount: amount,
      type: receipt-type
    })
    
    (ok request-id)
  )
)

;; Complete NFT generation (called by authorized service)
(define-public (complete-nft-generation
  (request-id uint)
  (image-url (string-ascii 200))
  (campaign-id uint)
  )
  (let (
    (request (unwrap! (map-get? generation-requests { request-id: request-id }) ERR_INVALID_INPUT))
  )
    ;; Only contract owner or authorized service can complete
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    
    ;; Update request status
    (map-set generation-requests
      { request-id: request-id }
      (merge request {
        status: "completed",
        completed-at: (some burn-block-height)
      })
    )
    
    ;; Update metadata with generated image
    (let (
      (metadata (unwrap! (map-get? nft-metadata { receipt-id: request-id }) ERR_INVALID_INPUT))
    )
      (map-set nft-metadata
        { receipt-id: request-id }
        (merge metadata {
          image-url: image-url,
          campaign-id: campaign-id
        })
      )
    )
    
    (print {
      action: "nft-generation-completed",
      request-id: request-id,
      image-url: image-url
    })
    
    (ok true)
  )
)

;; Generate receipt description based on type and data
(define-private (generate-receipt-description
  (receipt-type (string-ascii 20))
  (amount uint)
  (campaign-name (string-ascii 100))
  )
  (if (is-eq receipt-type "donation")
    (concat "Donation Receipt: " (concat (uint-to-ascii amount) (concat " STX donated to " campaign-name)))
    (if (is-eq receipt-type "salary")
      (concat "Salary Receipt: " (concat (uint-to-ascii amount) " STX salary payment"))
      "Digital Receipt"
    )
  )
)

;; Read-only functions

;; Get NFT metadata
(define-read-only (get-nft-metadata (receipt-id uint))
  (map-get? nft-metadata { receipt-id: receipt-id })
)

;; Get generation request status
(define-read-only (get-generation-request (request-id uint))
  (map-get? generation-requests { request-id: request-id })
)

;; Get receipt by recipient
(define-read-only (get-user-receipts (user principal))
  ;; This would need iteration support - return placeholder
  (ok u1)
)

;; Helper function to convert uint to string (simplified)
(define-read-only (uint-to-ascii (value uint))
  (if (<= value u999)
    (if (<= value u99)
      (if (<= value u9)
        (if (is-eq value u0) "0"
        (if (is-eq value u1) "1"
        (if (is-eq value u2) "2"
        (if (is-eq value u3) "3"
        (if (is-eq value u4) "4"
        (if (is-eq value u5) "5"
        (if (is-eq value u6) "6"
        (if (is-eq value u7) "7"
        (if (is-eq value u8) "8"
        "9")))))))))
        "10-99")
      "100-999")
    "1000+")
)
