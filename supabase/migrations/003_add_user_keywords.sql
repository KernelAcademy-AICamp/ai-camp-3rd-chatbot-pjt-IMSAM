-- ============================================
-- User Keywords Table for Interview Continuity
-- ============================================
-- Stores extracted keywords from interviews
-- Used to personalize future interview questions

-- Create keyword category enum
CREATE TYPE keyword_category AS ENUM (
  'technical',
  'soft_skill',
  'experience',
  'project',
  'strength',
  'weakness'
);

-- User Keywords Table
CREATE TABLE user_keywords (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES interview_sessions(id) ON DELETE SET NULL,
  keyword TEXT NOT NULL,
  category keyword_category NOT NULL,
  context TEXT,
  mentioned_count INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient keyword lookup
CREATE INDEX user_keywords_user_id_idx ON user_keywords(user_id);
CREATE INDEX user_keywords_category_idx ON user_keywords(category);
CREATE INDEX user_keywords_keyword_idx ON user_keywords(keyword);

-- Composite unique constraint to prevent exact duplicates
CREATE UNIQUE INDEX user_keywords_unique_idx ON user_keywords(user_id, keyword, category);

-- RLS for user_keywords
ALTER TABLE user_keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own keywords"
  ON user_keywords FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own keywords"
  ON user_keywords FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own keywords"
  ON user_keywords FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own keywords"
  ON user_keywords FOR DELETE
  USING (auth.uid() = user_id);

-- User Interview Summary Table
-- Stores overall summary from each interview
CREATE TABLE user_interview_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES interview_sessions(id) ON DELETE CASCADE NOT NULL UNIQUE,
  summary TEXT NOT NULL,
  job_type TEXT NOT NULL,
  industry TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX user_interview_summaries_user_id_idx ON user_interview_summaries(user_id);

-- RLS for user_interview_summaries
ALTER TABLE user_interview_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own summaries"
  ON user_interview_summaries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own summaries"
  ON user_interview_summaries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to upsert keywords (insert or increment count)
CREATE OR REPLACE FUNCTION upsert_user_keyword(
  p_user_id UUID,
  p_session_id UUID,
  p_keyword TEXT,
  p_category keyword_category,
  p_context TEXT,
  p_mentioned_count INT
)
RETURNS void AS $$
BEGIN
  INSERT INTO user_keywords (user_id, session_id, keyword, category, context, mentioned_count)
  VALUES (p_user_id, p_session_id, p_keyword, p_category, p_context, p_mentioned_count)
  ON CONFLICT (user_id, keyword, category)
  DO UPDATE SET
    mentioned_count = user_keywords.mentioned_count + EXCLUDED.mentioned_count,
    context = COALESCE(EXCLUDED.context, user_keywords.context),
    session_id = EXCLUDED.session_id,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_keywords_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE TRIGGER update_user_keywords_updated_at
  BEFORE UPDATE ON user_keywords
  FOR EACH ROW
  EXECUTE FUNCTION update_user_keywords_updated_at();
