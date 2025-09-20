;; Company Authentication and Management Contract
;; Manages company registration, admin accounts, and employee management

;; Constants
(define-constant ERR_UNAUTHORIZED (err u401))
(define-constant ERR_ALREADY_EXISTS (err u402))
(define-constant ERR_NOT_FOUND (err u404))
(define-constant ERR_INVALID_INPUT (err u400))

;; Data Variables
(define-data-var next-company-id uint u1)

;; Data Maps
(define-map companies
  { id: uint }
  {
    name: (string-ascii 100),
    admin: principal,
    description: (string-ascii 500),
    created-at: uint,
    active: bool,
    employee-count: uint,
    total-budget: uint
  }
)

(define-map company-admins
  { company-id: uint, admin: principal }
  { role: (string-ascii 20), added-at: uint }
)

(define-map company-employees
  { company-id: uint, employee: principal }
  {
    name: (string-ascii 100),
    department: (string-ascii 50),
    position: (string-ascii 50),
    wallet-address: principal,
    salary: uint,
    active: bool,
    added-at: uint
  }
)

(define-map company-by-admin
  { admin: principal }
  { company-id: uint }
)

(define-map employee-company
  { employee: principal }
  { company-id: uint }
)

;; Public Functions

;; Register a new company
(define-public (register-company 
  (name (string-ascii 100))
  (description (string-ascii 500))
  (initial-budget uint)
  )
  (let (
    (company-id (var-get next-company-id))
    (admin tx-sender)
  )
    ;; Check if admin already has a company
    (asserts! (is-none (map-get? company-by-admin { admin: admin })) ERR_ALREADY_EXISTS)
    
    ;; Create company record
    (map-set companies
      { id: company-id }
      {
        name: name,
        admin: admin,
        description: description,
        created-at: burn-block-height,
        active: true,
        employee-count: u0,
        total-budget: initial-budget
      }
    )
    
    ;; Set admin mapping
    (map-set company-by-admin
      { admin: admin }
      { company-id: company-id }
    )
    
    ;; Set admin role
    (map-set company-admins
      { company-id: company-id, admin: admin }
      { role: "owner", added-at: burn-block-height }
    )
    
    ;; Update company ID counter
    (var-set next-company-id (+ company-id u1))
    
    (print {
      action: "company-registered",
      company-id: company-id,
      name: name,
      admin: admin
    })
    
    (ok company-id)
  )
)

;; Add employee to company
(define-public (add-employee
  (employee-wallet principal)
  (employee-name (string-ascii 100))
  (department (string-ascii 50))
  (position (string-ascii 50))
  (salary uint)
  )
  (let (
    (admin tx-sender)
    (company-data (unwrap! (map-get? company-by-admin { admin: admin }) ERR_UNAUTHORIZED))
    (company-id (get company-id company-data))
  )
    ;; Check if employee already exists
    (asserts! (is-none (map-get? employee-company { employee: employee-wallet })) ERR_ALREADY_EXISTS)
    
    ;; Add employee
    (map-set company-employees
      { company-id: company-id, employee: employee-wallet }
      {
        name: employee-name,
        department: department,
        position: position,
        wallet-address: employee-wallet,
        salary: salary,
        active: true,
        added-at: burn-block-height
      }
    )
    
    ;; Set employee-company mapping
    (map-set employee-company
      { employee: employee-wallet }
      { company-id: company-id }
    )
    
    ;; Update employee count
    (let (
      (company (unwrap! (map-get? companies { id: company-id }) ERR_NOT_FOUND))
      (new-count (+ (get employee-count company) u1))
    )
      (map-set companies
        { id: company-id }
        (merge company { employee-count: new-count })
      )
    )
    
    (print {
      action: "employee-added",
      company-id: company-id,
      employee: employee-wallet,
      name: employee-name
    })
    
    (ok true)
  )
)

;; Update employee salary
(define-public (update-employee-salary
  (employee-wallet principal)
  (new-salary uint)
  )
  (let (
    (admin tx-sender)
    (company-data (unwrap! (map-get? company-by-admin { admin: admin }) ERR_UNAUTHORIZED))
    (company-id (get company-id company-data))
  )
    ;; Check if employee exists in this company
    (let (
      (employee-data (unwrap! (map-get? company-employees { company-id: company-id, employee: employee-wallet }) ERR_NOT_FOUND))
    )
      ;; Update salary
      (map-set company-employees
        { company-id: company-id, employee: employee-wallet }
        (merge employee-data { salary: new-salary })
      )
      
      (print {
        action: "salary-updated",
        company-id: company-id,
        employee: employee-wallet,
        new-salary: new-salary
      })
      
      (ok true)
    )
  )
)

;; Remove employee from company
(define-public (remove-employee (employee-wallet principal))
  (let (
    (admin tx-sender)
    (company-data (unwrap! (map-get? company-by-admin { admin: admin }) ERR_UNAUTHORIZED))
    (company-id (get company-id company-data))
  )
    ;; Check if employee exists
    (let (
      (employee-data (unwrap! (map-get? company-employees { company-id: company-id, employee: employee-wallet }) ERR_NOT_FOUND))
    )
      ;; Deactivate employee
      (map-set company-employees
        { company-id: company-id, employee: employee-wallet }
        (merge employee-data { active: false })
      )
      
      ;; Remove employee-company mapping
      (map-delete employee-company { employee: employee-wallet })
      
      ;; Update employee count
      (let (
        (company (unwrap! (map-get? companies { id: company-id }) ERR_NOT_FOUND))
        (new-count (- (get employee-count company) u1))
      )
        (map-set companies
          { id: company-id }
          (merge company { employee-count: new-count })
        )
      )
      
      (print {
        action: "employee-removed",
        company-id: company-id,
        employee: employee-wallet
      })
      
      (ok true)
    )
  )
)

;; Read-only functions

;; Get company by admin
(define-read-only (get-company-by-admin (admin principal))
  (match (map-get? company-by-admin { admin: admin })
    company-data (let (
      (company-id (get company-id company-data))
    )
      (map-get? companies { id: company-id })
    )
    none
  )
)

;; Get company employees
(define-read-only (get-company-employees (company-id uint))
  (ok company-id) ;; This would need a more complex implementation to return all employees
)

;; Get employee info
(define-read-only (get-employee-info (employee-wallet principal))
  (match (map-get? employee-company { employee: employee-wallet })
    employee-data (let (
      (company-id (get company-id employee-data))
    )
      (map-get? company-employees { company-id: company-id, employee: employee-wallet })
    )
    none
  )
)

;; Check if user is company admin
(define-read-only (is-company-admin (user principal))
  (is-some (map-get? company-by-admin { admin: user }))
)

;; Get company info by ID
(define-read-only (get-company (company-id uint))
  (map-get? companies { id: company-id })
)
