-- Add portfolio_doc_id column to interview_sessions
ALTER TABLE interview_sessions
ADD COLUMN IF NOT EXISTS portfolio_doc_id UUID REFERENCES documents(id) ON DELETE SET NULL;
