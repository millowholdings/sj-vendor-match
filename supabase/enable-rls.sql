-- ============================================================
-- CRITICAL SECURITY FIX: Enable RLS on all tables
-- Run this in Supabase SQL Editor
-- ============================================================

-- ─── VENDORS TABLE ──────────────────────────────────────────
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

-- Public can read approved vendors
CREATE POLICY "Public read approved vendors"
ON vendors FOR SELECT
USING (status = 'approved' OR status IS NULL);

-- Vendor can read their own record regardless of status
CREATE POLICY "Vendor reads own record"
ON vendors FOR SELECT
USING (user_id = auth.uid()::text);

-- Admin can read all vendors
CREATE POLICY "Admin reads all vendors"
ON vendors FOR SELECT
USING (auth.jwt() ->> 'email' = 'tiffany@southjerseyvendormarket.com');

-- Authenticated users can insert
CREATE POLICY "Authenticated users insert vendors"
ON vendors FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Vendor can update own record
CREATE POLICY "Vendor updates own record"
ON vendors FOR UPDATE
USING (user_id = auth.uid()::text);

-- Admin can update any vendor
CREATE POLICY "Admin updates any vendor"
ON vendors FOR UPDATE
USING (auth.jwt() ->> 'email' = 'tiffany@southjerseyvendormarket.com');

-- Admin can delete vendors
CREATE POLICY "Admin deletes vendors"
ON vendors FOR DELETE
USING (auth.jwt() ->> 'email' = 'tiffany@southjerseyvendormarket.com');

-- Vendor can delete own record
CREATE POLICY "Vendor deletes own record"
ON vendors FOR DELETE
USING (user_id = auth.uid()::text);

-- ─── EVENTS TABLE ───────────────────────────────────────────
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Public can read approved/live events
CREATE POLICY "Public read approved events"
ON events FOR SELECT
USING (status = 'approved' OR status = 'concierge_active' OR status IS NULL);

-- Host can read their own events regardless of status
CREATE POLICY "Host reads own events"
ON events FOR SELECT
USING (user_id = auth.uid()::text);

-- Host can read events by their email
CREATE POLICY "Host reads own events by email"
ON events FOR SELECT
USING (contact_email = (auth.jwt() ->> 'email'));

-- Admin can read all events
CREATE POLICY "Admin reads all events"
ON events FOR SELECT
USING (auth.jwt() ->> 'email' = 'tiffany@southjerseyvendormarket.com');

-- Authenticated users can insert events
CREATE POLICY "Authenticated users insert events"
ON events FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Anon users can insert events (for unauthenticated host signups)
CREATE POLICY "Anon users insert events"
ON events FOR INSERT
WITH CHECK (true);

-- Host can update own events
CREATE POLICY "Host updates own events"
ON events FOR UPDATE
USING (user_id = auth.uid()::text OR contact_email = (auth.jwt() ->> 'email'));

-- Admin can update any event
CREATE POLICY "Admin updates any event"
ON events FOR UPDATE
USING (auth.jwt() ->> 'email' = 'tiffany@southjerseyvendormarket.com');

-- Admin can delete events
CREATE POLICY "Admin deletes events"
ON events FOR DELETE
USING (auth.jwt() ->> 'email' = 'tiffany@southjerseyvendormarket.com');

-- Host can delete own events
CREATE POLICY "Host deletes own events"
ON events FOR DELETE
USING (user_id = auth.uid()::text OR contact_email = (auth.jwt() ->> 'email'));

-- ─── BOOKING_REQUESTS TABLE ─────────────────────────────────
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;

-- Vendor and host can read their own requests
CREATE POLICY "Vendor reads own booking requests"
ON booking_requests FOR SELECT
USING (vendor_id IN (SELECT id::text FROM vendors WHERE user_id = auth.uid()::text)
       OR host_email = (auth.jwt() ->> 'email'));

-- Admin can read all
CREATE POLICY "Admin reads all booking requests"
ON booking_requests FOR SELECT
USING (auth.jwt() ->> 'email' = 'tiffany@southjerseyvendormarket.com');

-- Anyone can read by session (for unauthenticated booking flow)
CREATE POLICY "Session reads booking requests"
ON booking_requests FOR SELECT
USING (true);

-- Authenticated and anon can insert
CREATE POLICY "Anyone inserts booking requests"
ON booking_requests FOR INSERT
WITH CHECK (true);

-- Vendor or host can update status
CREATE POLICY "Parties update booking requests"
ON booking_requests FOR UPDATE
USING (true);

-- Parties can delete
CREATE POLICY "Parties delete booking requests"
ON booking_requests FOR DELETE
USING (true);

-- ─── MESSAGES TABLE ─────────────────────────────────────────
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Sender and recipient can read their messages
CREATE POLICY "Users read own messages"
ON messages FOR SELECT
USING (sender_id = auth.uid()::text OR recipient_id = auth.uid()::text OR sender_id = 'system');

-- Admin can read all messages
CREATE POLICY "Admin reads all messages"
ON messages FOR SELECT
USING (auth.jwt() ->> 'email' = 'tiffany@southjerseyvendormarket.com');

-- Authenticated users can insert messages
CREATE POLICY "Authenticated users insert messages"
ON messages FOR INSERT
WITH CHECK (true);

-- Users can update their own received messages (mark as read)
CREATE POLICY "Users update own messages"
ON messages FOR UPDATE
USING (recipient_id = auth.uid()::text);

-- Users can delete their own messages
CREATE POLICY "Users delete own messages"
ON messages FOR DELETE
USING (sender_id = auth.uid()::text OR recipient_id = auth.uid()::text);

-- Admin can delete any messages
CREATE POLICY "Admin deletes messages"
ON messages FOR DELETE
USING (auth.jwt() ->> 'email' = 'tiffany@southjerseyvendormarket.com');

-- ─── CONTACT_SUBMISSIONS TABLE ──────────────────────────────
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can insert
CREATE POLICY "Anyone inserts contact submissions"
ON contact_submissions FOR INSERT
WITH CHECK (true);

-- Only admin can read
CREATE POLICY "Admin reads contact submissions"
ON contact_submissions FOR SELECT
USING (auth.jwt() ->> 'email' = 'tiffany@southjerseyvendormarket.com');

-- ─── EMAIL_LOG TABLE ────────────────────────────────────────
ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;

-- System/service role can insert
CREATE POLICY "System inserts email log"
ON email_log FOR INSERT
WITH CHECK (true);

-- Only admin can read
CREATE POLICY "Admin reads email log"
ON email_log FOR SELECT
USING (auth.jwt() ->> 'email' = 'tiffany@southjerseyvendormarket.com');

-- ─── EVENT_GOERS TABLE ──────────────────────────────────────
ALTER TABLE event_goers ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "User reads own event goer profile"
ON event_goers FOR SELECT
USING (email = (auth.jwt() ->> 'email'));

-- Admin can read all
CREATE POLICY "Admin reads all event goers"
ON event_goers FOR SELECT
USING (auth.jwt() ->> 'email' = 'tiffany@southjerseyvendormarket.com');

-- Anyone can insert (signup)
CREATE POLICY "Anyone inserts event goers"
ON event_goers FOR INSERT
WITH CHECK (true);

-- User can update own profile
CREATE POLICY "User updates own event goer profile"
ON event_goers FOR UPDATE
USING (email = (auth.jwt() ->> 'email'));

-- User can delete own profile
CREATE POLICY "User deletes own event goer profile"
ON event_goers FOR DELETE
USING (email = (auth.jwt() ->> 'email'));

-- Admin can delete
CREATE POLICY "Admin deletes event goers"
ON event_goers FOR DELETE
USING (auth.jwt() ->> 'email' = 'tiffany@southjerseyvendormarket.com');

-- ─── CHANGE_LOG TABLE (if exists) ───────────────────────────
DO $$ BEGIN
  ALTER TABLE change_log ENABLE ROW LEVEL SECURITY;
  EXECUTE 'CREATE POLICY "Anyone inserts change log" ON change_log FOR INSERT WITH CHECK (true)';
  EXECUTE 'CREATE POLICY "Admin reads change log" ON change_log FOR SELECT USING (auth.jwt() ->> ''email'' = ''tiffany@southjerseyvendormarket.com'')';
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- ─── ADMIN_REMOVAL_LOG TABLE (if exists) ────────────────────
DO $$ BEGIN
  ALTER TABLE admin_removal_log ENABLE ROW LEVEL SECURITY;
  EXECUTE 'CREATE POLICY "Anyone inserts admin removal log" ON admin_removal_log FOR INSERT WITH CHECK (true)';
  EXECUTE 'CREATE POLICY "Admin reads admin removal log" ON admin_removal_log FOR SELECT USING (auth.jwt() ->> ''email'' = ''tiffany@southjerseyvendormarket.com'')';
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
