-- ============================================
-- Interviewer Names Pool
-- ============================================
-- 면접관 이름 풀 - 역할별로 다양한 이름을 랜덤 선택
-- 역할은 고정 (실무팀장/HR/시니어), 이름만 랜덤

-- Create interviewer names table
CREATE TABLE IF NOT EXISTS interviewer_names (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role_type TEXT NOT NULL CHECK (role_type IN ('hiring_manager', 'hr_manager', 'senior_peer')),
  name TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female', 'neutral')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique index to prevent duplicate names per role
CREATE UNIQUE INDEX interviewer_names_role_name_idx ON interviewer_names(role_type, name);

-- Index for efficient random selection
CREATE INDEX interviewer_names_role_active_idx ON interviewer_names(role_type, is_active);

-- Insert diverse names for each role
-- 실무팀장 (hiring_manager) - 전문적이고 신뢰감 있는 이름
INSERT INTO interviewer_names (role_type, name, gender) VALUES
-- Male names
('hiring_manager', '김기술', 'male'),
('hiring_manager', '이준혁', 'male'),
('hiring_manager', '박성민', 'male'),
('hiring_manager', '정우진', 'male'),
('hiring_manager', '최동현', 'male'),
('hiring_manager', '강민수', 'male'),
('hiring_manager', '조현우', 'male'),
('hiring_manager', '윤태호', 'male'),
('hiring_manager', '장석훈', 'male'),
('hiring_manager', '한승준', 'male'),
-- Female names
('hiring_manager', '김지현', 'female'),
('hiring_manager', '이수진', 'female'),
('hiring_manager', '박소연', 'female'),
('hiring_manager', '정민아', 'female'),
('hiring_manager', '최유진', 'female'),
('hiring_manager', '강서영', 'female'),
('hiring_manager', '조은비', 'female'),
('hiring_manager', '윤하늘', 'female'),
('hiring_manager', '장미래', 'female'),
('hiring_manager', '한소희', 'female')
ON CONFLICT (role_type, name) DO NOTHING;

-- HR 담당자 (hr_manager) - 친근하고 따뜻한 이름
INSERT INTO interviewer_names (role_type, name, gender) VALUES
-- Male names
('hr_manager', '박인사', 'male'),
('hr_manager', '김민준', 'male'),
('hr_manager', '이승호', 'male'),
('hr_manager', '정재원', 'male'),
('hr_manager', '최현석', 'male'),
('hr_manager', '강지훈', 'male'),
('hr_manager', '조영민', 'male'),
('hr_manager', '윤성빈', 'male'),
('hr_manager', '장원호', 'male'),
('hr_manager', '한도윤', 'male'),
-- Female names
('hr_manager', '김하은', 'female'),
('hr_manager', '이서연', 'female'),
('hr_manager', '박지은', 'female'),
('hr_manager', '정수빈', 'female'),
('hr_manager', '최예진', 'female'),
('hr_manager', '강민지', 'female'),
('hr_manager', '조아영', 'female'),
('hr_manager', '윤채원', 'female'),
('hr_manager', '장소율', 'female'),
('hr_manager', '한지유', 'female')
ON CONFLICT (role_type, name) DO NOTHING;

-- 시니어 동료/직속상사 (senior_peer) - 친근하면서 전문적인 이름
INSERT INTO interviewer_names (role_type, name, gender) VALUES
-- Male names
('senior_peer', '이시니어', 'male'),
('senior_peer', '김현준', 'male'),
('senior_peer', '박진우', 'male'),
('senior_peer', '정태영', 'male'),
('senior_peer', '최민혁', 'male'),
('senior_peer', '강준서', 'male'),
('senior_peer', '조시우', 'male'),
('senior_peer', '윤지호', 'male'),
('senior_peer', '장건우', 'male'),
('senior_peer', '한예준', 'male'),
-- Female names
('senior_peer', '김다은', 'female'),
('senior_peer', '이유나', 'female'),
('senior_peer', '박세아', 'female'),
('senior_peer', '정하린', 'female'),
('senior_peer', '최서현', 'female'),
('senior_peer', '강예나', 'female'),
('senior_peer', '조민서', 'female'),
('senior_peer', '윤가은', 'female'),
('senior_peer', '장다인', 'female'),
('senior_peer', '한시아', 'female')
ON CONFLICT (role_type, name) DO NOTHING;

-- Enable RLS
ALTER TABLE interviewer_names ENABLE ROW LEVEL SECURITY;

-- Public read access (anyone can read names)
CREATE POLICY "Anyone can read interviewer_names"
  ON interviewer_names FOR SELECT
  TO authenticated
  USING (true);

-- Also allow anon to read for session creation
CREATE POLICY "Anon can read interviewer_names"
  ON interviewer_names FOR SELECT
  TO anon
  USING (true);

-- Grant permissions
GRANT SELECT ON interviewer_names TO authenticated;
GRANT SELECT ON interviewer_names TO anon;

-- Function to get random names for all three roles
CREATE OR REPLACE FUNCTION get_random_interviewer_names()
RETURNS TABLE (
  hiring_manager_name TEXT,
  hr_manager_name TEXT,
  senior_peer_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT name FROM interviewer_names WHERE role_type = 'hiring_manager' AND is_active = true ORDER BY random() LIMIT 1),
    (SELECT name FROM interviewer_names WHERE role_type = 'hr_manager' AND is_active = true ORDER BY random() LIMIT 1),
    (SELECT name FROM interviewer_names WHERE role_type = 'senior_peer' AND is_active = true ORDER BY random() LIMIT 1);
END;
$$ LANGUAGE plpgsql;
