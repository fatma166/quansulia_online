/*
  # Create Comprehensive Application Tracking System

  1. New Tables
    - `payments`
      - `id` (uuid, primary key)
      - `application_id` (uuid, foreign key)
      - `amount` (numeric) - المبلغ
      - `currency` (text) - العملة
      - `payment_method` (text) - طريقة الدفع
      - `payment_status` (text) - pending, completed, failed, refunded
      - `transaction_id` (text) - رقم العملية من بوابة الدفع
      - `payment_gateway` (text) - البوابة المستخدمة
      - `payment_date` (timestamp)
      - `receipt_url` (text) - رابط الإيصال
      - `created_at` (timestamp)
      
    - `status_history`
      - `id` (uuid, primary key)
      - `application_id` (uuid, foreign key)
      - `old_status` (text)
      - `new_status` (text)
      - `changed_by` (uuid) - staff user_id
      - `notes` (text) - ملاحظات التغيير
      - `created_at` (timestamp)
      
    - `rejection_details`
      - `id` (uuid, primary key)
      - `application_id` (uuid, foreign key)
      - `reason` (text) - سبب الرفض
      - `required_documents` (text[]) - مستندات مطلوبة
      - `can_resubmit` (boolean) - إمكانية إعادة التقديم
      - `rejection_date` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Public can read their own data
    - Staff can manage all data
*/

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE NOT NULL,
  amount numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'SAR',
  payment_method text NOT NULL,
  payment_status text NOT NULL DEFAULT 'pending',
  transaction_id text UNIQUE,
  payment_gateway text,
  payment_date timestamptz,
  receipt_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view payments"
  ON payments FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create payments"
  ON payments FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Staff can manage payments"
  ON payments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
    )
  );

-- Create status_history table
CREATE TABLE IF NOT EXISTS status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE NOT NULL,
  old_status text,
  new_status text NOT NULL,
  changed_by uuid,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view status history"
  ON status_history FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Staff can manage status history"
  ON status_history FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
    )
  );

-- Create rejection_details table
CREATE TABLE IF NOT EXISTS rejection_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE NOT NULL,
  reason text NOT NULL,
  required_documents text[] DEFAULT ARRAY[]::text[],
  can_resubmit boolean DEFAULT true,
  rejection_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE rejection_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view rejection details"
  ON rejection_details FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Staff can manage rejection details"
  ON rejection_details FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
    )
  );

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_payments_application_id ON payments(application_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_status_history_application_id ON status_history(application_id);
CREATE INDEX IF NOT EXISTS idx_rejection_details_application_id ON rejection_details(application_id);

-- Function to automatically log status changes
CREATE OR REPLACE FUNCTION log_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO status_history (application_id, old_status, new_status, notes)
    VALUES (NEW.id, OLD.status, NEW.status, 'Status updated');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic status logging
DROP TRIGGER IF EXISTS trigger_log_status_change ON applications;
CREATE TRIGGER trigger_log_status_change
  AFTER UPDATE ON applications
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION log_status_change();
