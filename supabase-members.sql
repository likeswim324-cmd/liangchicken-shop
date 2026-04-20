-- 在 orders 表加上 line_user_id 欄位
ALTER TABLE orders ADD COLUMN IF NOT EXISTS line_user_id TEXT;

-- 會員表
CREATE TABLE IF NOT EXISTS members (
  line_user_id   TEXT PRIMARY KEY,
  display_name   TEXT NOT NULL DEFAULT '',
  birthday       DATE,
  referral_code  TEXT UNIQUE NOT NULL,
  referred_by    TEXT,
  referral_credited BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- 點數明細表
CREATE TABLE IF NOT EXISTS member_credits (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  line_user_id  TEXT NOT NULL,
  type          TEXT NOT NULL CHECK (type IN ('welcome', 'birthday', 'referral')),
  amount        INTEGER NOT NULL,
  expires_at    TIMESTAMPTZ NOT NULL,
  used          BOOLEAN NOT NULL DEFAULT false,
  used_at       TIMESTAMPTZ,
  order_id      TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);
