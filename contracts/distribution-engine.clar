;; =================================
;; AidSplit - Distribution Engine  
;; Advanced weighted distribution for unlimited recipients
;; =================================

;; Constants
(define-constant ERR_UNAUTHORIZED (err u200))
(define-constant ERR_INVALID_AMOUNT (err u201))
(define-constant ERR_INVALID_CAMPAIGN (err u203))
(define-constant ERR_NO_SHARES (err u205))
(define-constant PRECISION u1000000)

;; Distribution state per campaign
(define-map campaign-pools
  {campaign-id: uint}
  {
    total-deposited: uint,
    total-distributed: uint,
    accumulated-rewards-per-share: uint,
    total-shares: uint,
    last-distribution: uint,
    is-active: bool
  })

;; Individual allocations  
(define-map allocations
  {campaign-id: uint, recipient: principal}
  {
    shares: uint,
    reward-debt: uint,
    total-claimed: uint,
    last-claim: uint,
    is-active: bool
  })

;; Pending rewards for share updates
(define-map pending-credits
  {campaign-id: uint, recipient: principal}
  {amount: uint}
)

;; Read-only functions
(define-read-only (get-campaign-pool (campaign-id uint))
  (map-get? campaign-pools {campaign-id: campaign-id})
)

(define-read-only (get-allocation (campaign-id uint) (recipient principal))
  (map-get? allocations {campaign-id: campaign-id, recipient: recipient})
)

(define-read-only (get-pending-credits (campaign-id uint) (recipient principal))
  (map-get? pending-credits {campaign-id: campaign-id, recipient: recipient})
)

(define-read-only (get-pending-rewards (campaign-id uint) (recipient principal))
  (let (
    (pool (default-to 
            {total-deposited: u0, total-distributed: u0, accumulated-rewards-per-share: u0, 
             total-shares: u0, last-distribution: u0, is-active: false}
            (get-campaign-pool campaign-id)))
    (allocation (default-to 
                  {shares: u0, reward-debt: u0, total-claimed: u0, last-claim: u0, is-active: false}
                  (get-allocation campaign-id recipient)))
    (credits (default-to {amount: u0} 
                         (get-pending-credits campaign-id recipient)))
    (pending-from-shares (if (and (> (get shares allocation) u0) (get is-active allocation))
                          (- (/ (* (get shares allocation) (get accumulated-rewards-per-share pool)) PRECISION)
                             (get reward-debt allocation))
                          u0))
  )
    (+ (get amount credits) pending-from-shares)
  )
)

;; Initialize campaign pool
(define-public (initialize-campaign-pool (campaign-id uint))
  (begin
    (map-set campaign-pools
      {campaign-id: campaign-id}
      {
        total-deposited: u0,
        total-distributed: u0,
        accumulated-rewards-per-share: u0,
        total-shares: u0,
        last-distribution: burn-block-height,
        is-active: true
      }
    )
    
    (print {
      action: "pool-initialized",
      campaign-id: campaign-id
    })
    
    (ok true)
  )
)

;; Set allocation for a recipient
(define-public (set-allocation 
  (campaign-id uint)
  (recipient principal)
  (shares uint)
  )
  (let (
    (pool (unwrap! (get-campaign-pool campaign-id) ERR_INVALID_CAMPAIGN))
    (current-allocation (default-to 
                          {shares: u0, reward-debt: u0, total-claimed: u0, last-claim: u0, is-active: false}
                          (get-allocation campaign-id recipient)))
    (pending (get-pending-rewards campaign-id recipient))
  )
    ;; Verify pool is active
    (asserts! (get is-active pool) ERR_INVALID_CAMPAIGN)
    
    ;; Save any pending rewards to credits
    (if (> pending u0)
      (map-set pending-credits 
        {campaign-id: campaign-id, recipient: recipient}
        {amount: pending})
      true
    )
    
    ;; Update total shares
    (let ((new-total-shares (+ (- (get total-shares pool) (get shares current-allocation)) shares)))
      (map-set campaign-pools
        {campaign-id: campaign-id}
        (merge pool {total-shares: new-total-shares})
      )
      
      ;; Update or remove allocation
      (if (> shares u0)
        (map-set allocations
          {campaign-id: campaign-id, recipient: recipient}
          {
            shares: shares,
            reward-debt: (/ (* shares (get accumulated-rewards-per-share pool)) PRECISION),
            total-claimed: (get total-claimed current-allocation),
            last-claim: (get last-claim current-allocation),
            is-active: true
          })
        (begin
          (map-set allocations
            {campaign-id: campaign-id, recipient: recipient}
            (merge current-allocation {is-active: false}))
          true
        )
      )
    )
    
    (print {
      action: "allocation-set",
      campaign-id: campaign-id,
      recipient: recipient,
      shares: shares,
      pending: pending
    })
    
    (ok true)
  )
)

;; FIXED: Batch set allocations with proper error handling
(define-public (batch-set-allocations
  (campaign-id uint)
  (recipients-shares (list 100 {recipient: principal, shares: uint}))
  )
  (begin
    (var-set batch-allocation-campaign-id campaign-id)
    (fold batch-set-allocation-fold recipients-shares (ok u0))
  )
)

;; Helper variable for batch processing
(define-data-var batch-allocation-campaign-id uint u0)

(define-private (batch-set-allocation-fold 
  (item {recipient: principal, shares: uint}) 
  (prev-result (response uint uint))
  )
    (match prev-result 
      success (match (set-allocation (var-get batch-allocation-campaign-id) (get recipient item) (get shares item))     
                allocation-ok (ok (+ success u1))
                allocation-error (err allocation-error)
              )
      error (err error)
    )
)

;; Deposit funds to campaign
(define-public (deposit-to-campaign
  (campaign-id uint)
  (amount uint)
  (depositor principal)
  )
  (let (
    (pool (unwrap! (get-campaign-pool campaign-id) ERR_INVALID_CAMPAIGN))
  )
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    (asserts! (> (get total-shares pool) u0) ERR_NO_SHARES)
    (asserts! (get is-active pool) ERR_INVALID_CAMPAIGN)
    
    ;; Update accumulated rewards per share
    (let ((new-arps (+ (get accumulated-rewards-per-share pool)
                       (/ (* amount PRECISION) (get total-shares pool)))))
      (map-set campaign-pools
        {campaign-id: campaign-id}
        (merge pool {
          total-deposited: (+ (get total-deposited pool) amount),
          accumulated-rewards-per-share: new-arps,
          last-distribution: burn-block-height
        })
      )
    )
    
    (print {
      action: "deposit",
      campaign-id: campaign-id,
      amount: amount,
      from: depositor
    })
    
    (ok u1)
  )
)

;; Claim rewards
(define-public (claim-rewards (campaign-id uint))
  (let (
    (pending (get-pending-rewards campaign-id tx-sender))
    (pool (unwrap! (get-campaign-pool campaign-id) ERR_INVALID_CAMPAIGN))
    (allocation (unwrap! (get-allocation campaign-id tx-sender) ERR_INVALID_CAMPAIGN))
  )
    (asserts! (> pending u0) ERR_INVALID_AMOUNT)
    (asserts! (get is-active allocation) ERR_INVALID_CAMPAIGN)
    
    ;; Update allocation
    (map-set allocations
      {campaign-id: campaign-id, recipient: tx-sender}
      (merge allocation {
        reward-debt: (/ (* (get shares allocation) (get accumulated-rewards-per-share pool)) PRECISION),
        total-claimed: (+ (get total-claimed allocation) pending),
        last-claim: burn-block-height
      })
    )
    
    ;; Clear credits
    (map-delete pending-credits {campaign-id: campaign-id, recipient: tx-sender})
    
    ;; Update pool stats
    (map-set campaign-pools
      {campaign-id: campaign-id}
      (merge pool {total-distributed: (+ (get total-distributed pool) pending)})
    )
    
    (print {
      action: "claim",
      campaign-id: campaign-id,
      recipient: tx-sender,
      amount: pending
    })
    
    (ok pending)
  )
)

;; Emergency pause/resume functions
(define-public (pause-pool (campaign-id uint))
  (let (
    (pool (unwrap! (get-campaign-pool campaign-id) ERR_INVALID_CAMPAIGN))
  )
    ;; Simple authorization check - can be enhanced
    (asserts! (is-eq tx-sender contract-caller) (ok true))
    
    (map-set campaign-pools
      {campaign-id: campaign-id}
      (merge pool {is-active: false})
    )
    
    (print {action: "pool-paused", campaign-id: campaign-id})
    (ok true)
  )
)

(define-public (resume-pool (campaign-id uint))
  (let (
    (pool (unwrap! (get-campaign-pool campaign-id) ERR_INVALID_CAMPAIGN))
  )
    ;; Simple authorization check - can be enhanced  
    (asserts! (is-eq tx-sender contract-caller) (ok true))
    
    (map-set campaign-pools
      {campaign-id: campaign-id}
      (merge pool {is-active: true})
    )
    
    (print {action: "pool-resumed", campaign-id: campaign-id})
    (ok true)
  )
)