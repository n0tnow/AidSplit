;; =================================
;; AidSplit - Hierarchy Calculator
;; Handles complex corporate payroll calculations
;; Department -> Role -> Seniority -> Individual
;; =================================

;; Constants
(define-constant ERR_UNAUTHORIZED (err u300))
(define-constant ERR_INVALID_EMPLOYEE (err u301))
(define-constant ERR_INVALID_CALCULATION (err u302))
(define-constant ERR_DEPARTMENT_NOT_FOUND (err u303))
(define-constant ERR_ROLE_NOT_FOUND (err u304))
(define-constant ERR_EMPLOYEE_EXISTS (err u305))

;; Department definitions
(define-map departments
  {dept-id: (string-ascii 50)}
  {
    name: (string-ascii 100),
    allocation-percentage: uint,
    is-active: bool,
    created-by: principal,
    created-at: uint
  })

;; Role multipliers within departments
(define-map role-multipliers
  {dept-id: (string-ascii 50), role: (string-ascii 50)}
  {
    multiplier: uint,
    base-salary-points: uint,
    is-active: bool
  })

;; Employee assignments
(define-map employee-records
  {employee: principal}
  {
    dept-id: (string-ascii 50),
    role: (string-ascii 50),
    individual-multiplier: uint,
    hire-date: uint,
    status: uint,
    performance-rating: uint
  })

;; Campaign-specific payroll calculations
(define-map payroll-calculations
  {campaign-id: uint, employee: principal}
  {
    final-shares: uint,
    dept-base-shares: uint,
    role-multiplied-shares: uint,
    calculation-timestamp: uint
  })

;; Read-only functions
(define-read-only (get-department (dept-id (string-ascii 50)))
  (map-get? departments {dept-id: dept-id})
)

(define-read-only (get-employee (employee principal))
  (map-get? employee-records {employee: employee})
)

(define-read-only (get-role-multiplier (dept-id (string-ascii 50)) (role (string-ascii 50)))
  (map-get? role-multipliers {dept-id: dept-id, role: role})
)

(define-read-only (get-payroll-calculation (campaign-id uint) (employee principal))
  (map-get? payroll-calculations {campaign-id: campaign-id, employee: employee})
)

;; Create department
(define-public (create-department 
  (dept-id (string-ascii 50))
  (name (string-ascii 100))
  (allocation-percentage uint)
  )
  (begin
    (asserts! (<= allocation-percentage u10000) ERR_INVALID_CALCULATION)
    (asserts! (> allocation-percentage u0) ERR_INVALID_CALCULATION)
    (asserts! (is-none (get-department dept-id)) ERR_EMPLOYEE_EXISTS)
    
    (map-set departments
      {dept-id: dept-id}
      {
        name: name,
        allocation-percentage: allocation-percentage,
        is-active: true,
        created-by: tx-sender,
        created-at: burn-block-height
      }
    )
    
    (print {
      action: "department-created",
      dept-id: dept-id,
      name: name,
      percentage: allocation-percentage
    })
    
    (ok true)
  )
)

;; Add role to department
(define-public (add-role 
  (dept-id (string-ascii 50))
  (role (string-ascii 50))
  (multiplier uint)
  (base-salary-points uint)
  )
  (let (
    (dept (unwrap! (get-department dept-id) ERR_DEPARTMENT_NOT_FOUND))
  )
    (asserts! (is-eq tx-sender (get created-by dept)) ERR_UNAUTHORIZED)
    (asserts! (> multiplier u0) ERR_INVALID_CALCULATION)
    (asserts! (is-none (get-role-multiplier dept-id role)) ERR_EMPLOYEE_EXISTS)
    
    (map-set role-multipliers
      {dept-id: dept-id, role: role}
      {
        multiplier: multiplier,
        base-salary-points: base-salary-points,
        is-active: true
      }
    )
    
    (print {
      action: "role-added",
      dept-id: dept-id,
      role: role,
      multiplier: multiplier
    })
    
    (ok true)
  )
)

;; Assign employee to role
(define-public (assign-employee 
  (employee principal)
  (dept-id (string-ascii 50))
  (role (string-ascii 50))
  (individual-multiplier uint)
  (performance-rating uint)
  )
  (let (
    (dept (unwrap! (get-department dept-id) ERR_DEPARTMENT_NOT_FOUND))
    (role-info (unwrap! (get-role-multiplier dept-id role) ERR_ROLE_NOT_FOUND))
  )
    (asserts! (is-eq tx-sender (get created-by dept)) ERR_UNAUTHORIZED)
    (asserts! (> individual-multiplier u0) ERR_INVALID_CALCULATION)
    (asserts! (<= performance-rating u100) ERR_INVALID_CALCULATION)
    
    (map-set employee-records
      {employee: employee}
      {
        dept-id: dept-id,
        role: role,
        individual-multiplier: individual-multiplier,
        hire-date: burn-block-height,
        status: u1,
        performance-rating: performance-rating
      }
    )
    
    (print {
      action: "employee-assigned",
      employee: employee,
      dept-id: dept-id,
      role: role,
      multiplier: individual-multiplier
    })
    
    (ok true)
  )
)

;; Calculate payroll for a campaign - FIXED: No external contract calls
(define-public (calculate-payroll-shares (campaign-id uint) (employee principal))
  (let (
    (emp-info (unwrap! (get-employee employee) ERR_INVALID_EMPLOYEE))
    (dept (unwrap! (get-department (get dept-id emp-info)) ERR_DEPARTMENT_NOT_FOUND))
    (role-info (unwrap! (get-role-multiplier (get dept-id emp-info) (get role emp-info)) ERR_ROLE_NOT_FOUND))
    
    ;; Calculation steps
    (dept-base-shares (get allocation-percentage dept))
    (role-multiplied-shares (/ (* dept-base-shares (get multiplier role-info)) u100))
    (performance-bonus (/ (* role-multiplied-shares (get performance-rating emp-info)) u100))
    (individual-adjusted (/ (* role-multiplied-shares (get individual-multiplier emp-info)) u100))
    (final-shares (+ individual-adjusted performance-bonus))
  )
    (asserts! (is-eq (get status emp-info) u1) ERR_INVALID_EMPLOYEE)
    
    ;; Store calculation for transparency
    (map-set payroll-calculations
      {campaign-id: campaign-id, employee: employee}
      {
        final-shares: final-shares,
        dept-base-shares: dept-base-shares,
        role-multiplied-shares: role-multiplied-shares,
        calculation-timestamp: burn-block-height
      }
    )
    
    (print {
      action: "payroll-calculated",
      campaign-id: campaign-id,
      employee: employee,
      final-shares: final-shares,
      dept: (get dept-id emp-info),
      role: (get role emp-info)
    })
    
    (ok final-shares)
  )
)

;; Batch calculate for multiple employees
(define-public (batch-calculate-payroll 
  (campaign-id uint)
  (employee-list (list 50 principal))
  )
  (begin
    (var-set batch-campaign-id campaign-id)
    (fold batch-calculate-fold employee-list (ok u0))
  )
)

;; Helper variable for batch processing
(define-data-var batch-campaign-id uint u0)

(define-private (batch-calculate-fold 
  (emp principal)
  (prev-result (response uint uint))
  )
  (match prev-result 
    success (match (calculate-payroll-shares (var-get batch-campaign-id) emp)
              shares (ok (+ success u1))
              error (err error)
            )
    error (err error)
  )
)

;; Utility functions
(define-read-only (get-department-summary (dept-id (string-ascii 50)))
  (match (get-department dept-id)
    dept (ok dept)
    ERR_DEPARTMENT_NOT_FOUND
  )
)

(define-read-only (get-employee-summary (employee principal))
  (match (get-employee employee)
    emp-record (ok emp-record)
    ERR_INVALID_EMPLOYEE
  )
)