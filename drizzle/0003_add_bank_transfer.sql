-- Add bank transfer payment method and verification fields
ALTER TABLE `reservations` 
  MODIFY COLUMN `payment_status` enum('unpaid','deposit_paid','fully_paid','pending_verification') NOT NULL DEFAULT 'unpaid',
  MODIFY COLUMN `payment_method` enum('stripe','naver_pay','kakao_pay','toss','bank_transfer') DEFAULT 'stripe',
  ADD COLUMN `bank_transfer_proof` text,
  ADD COLUMN `bank_transfer_amount` decimal(10,2),
  ADD COLUMN `bank_transfer_date` timestamp;
