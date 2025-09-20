;; =================================
;; AidSplit - Access Control & Security
;; RBAC, pausability, emergency controls
;; =================================

;; Constants
(define-constant ERR_UNAUTHORIZED (err u500))
(define-constant ERR_INVALID_ROLE (err u501))
(define-constant ERR_SYSTEM_PAUSED (err u502))
(define-constant ERR_INVALID_ADDRESS (err u503))

;; Roles
(define-constant ROLE_SUPER_ADMIN u1)
(define-constant ROLE_CAMPAIGN_ADMIN u2) 
(define-constant ROLE_FINANCIAL_ADMIN u4)
(define-constant ROLE_AUDITOR u8)

;; Data Variables
(define-data-var contract-owner principal tx-sender)
(define-data-var system-paused bool false)

;; Role assignments
(define-map user-roles
  {user: principal}
  {
    roles: uint,
    assigned-by: principal,
    assigned-at: uint,
    is-active: bool
  })

;; Function-level pause controls
(define-map function-paused
  {function-name: (string-ascii 50)}
  {is-paused: bool}
)

;; Read-only functions
(define-read-only (has-role (user principal) (role uint))
  (match (map-get? user-roles {user: user})
    user-role (and (> (bit-and (get roles user-role) role) u0)
                   (get is-active user-role))
    false
  )
)

(define-read-only (is-system-paused)
  (var-get system-paused)
)

(define-read-only (is-function-paused (function-name (string-ascii 50)))
  (default-to false (get is-paused (map-get? function-paused {function-name: function-name})))
)

;; FIXED: Modifier functions - 2 arguments only
(define-read-only (require-role (user principal) (role uint))
  (if (has-role user role)
    (ok true)
    ERR_UNAUTHORIZED)
)

(define-read-only (require-not-paused)
  (if (not (var-get system-paused))
    (ok true)
    ERR_SYSTEM_PAUSED)
)

;; Assign role
(define-public (assign-role (user principal) (role uint))
  (let (
    (current-roles (default-to 
                    {roles: u0, assigned-by: tx-sender, assigned-at: u0, is-active: false}
                    (map-get? user-roles {user: user})))
  )
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    
    (map-set user-roles
      {user: user}
      {
        roles: (bit-or (get roles current-roles) role),
        assigned-by: tx-sender,
        assigned-at: burn-block-height,
        is-active: true
      }
    )
    
    (print {
      action: "role-assigned",
      user: user,
      role: role,
      by: tx-sender
    })
    
    (ok true)
  )
)

;; Revoke role
(define-public (revoke-role (user principal) (role uint))
  (let (
    (current-roles (unwrap! (map-get? user-roles {user: user}) ERR_INVALID_ADDRESS))
  )
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    
    (map-set user-roles
      {user: user}
      (merge current-roles {
        roles: (bit-xor (get roles current-roles) role)
      })
    )
    
    (ok true)
  )
)

;; System controls
(define-public (pause-system)
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (var-set system-paused true)
    (print {action: "system-paused", by: tx-sender})
    (ok true)
  )
)

(define-public (unpause-system)
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (var-set system-paused false)
    (print {action: "system-unpaused", by: tx-sender})
    (ok true)
  )
)

;; Function pause controls
(define-public (pause-function (function-name (string-ascii 50)))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    
    (map-set function-paused
      {function-name: function-name}
      {is-paused: true}
    )
    
    (ok true)
  )
)

(define-public (unpause-function (function-name (string-ascii 50)))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (map-delete function-paused {function-name: function-name})
    (ok true)
  )
)