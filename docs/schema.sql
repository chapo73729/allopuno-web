-- ============================================================================
-- ALLOPUNO — Schéma PostgreSQL 16 + PostGIS (draft d'architecture, v0.1)
-- ----------------------------------------------------------------------------
-- Ce fichier est le schéma de référence du dossier d'architecture (doc 03).
-- En développement, il sera porté en migrations Prisma ; il fait foi pour la
-- modélisation. Conventions :
--   * PK uuid (gen_random_uuid()), timestamps timestamptz, soft-delete ciblé
--   * Colonnes i18n : jsonb {"sq": "...", "en": "..."}
--   * Argent : amount_cents bigint + currency char(3) (jamais de float)
--   * Géo : geography(Point, 4326)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS btree_gist;  -- exclusion (rental_id =, daterange &&)

-- ============================================================================
-- RÉFÉRENTIELS INTERNATIONAUX (CDC §69–70, §129)
-- ============================================================================

CREATE TABLE countries (
  code            char(2) PRIMARY KEY,            -- 'XK'
  name            jsonb NOT NULL,
  default_currency char(3) NOT NULL,              -- 'EUR'
  default_locale  text NOT NULL,                  -- 'sq'
  phone_prefix    text NOT NULL,                  -- '+383'
  tax_rules       jsonb NOT NULL DEFAULT '{}',
  payment_providers jsonb NOT NULL DEFAULT '[]',
  is_active       boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE cities (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code    char(2) NOT NULL REFERENCES countries(code),
  slug            text NOT NULL,                  -- 'prishtine'
  name            jsonb NOT NULL,                 -- {"sq":"Prishtinë","en":"Pristina"}
  location        geography(Point,4326) NOT NULL,
  is_active       boolean NOT NULL DEFAULT false, -- villes de lancement (CDC §99)
  sort_order      int NOT NULL DEFAULT 0,
  UNIQUE (country_code, slug)
);

CREATE TABLE zones (                              -- quartiers / zones (CDC §29)
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id         uuid NOT NULL REFERENCES cities(id),
  slug            text NOT NULL,
  name            jsonb NOT NULL,
  location        geography(Point,4326),
  UNIQUE (city_id, slug)
);

-- ============================================================================
-- IDENTITÉ & COMPTES (CDC §4–5, §44)
-- ============================================================================

CREATE TYPE user_status AS ENUM
  ('active','limited','suspended','banned','deleted');

CREATE TABLE users (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone           text UNIQUE,                    -- E.164
  phone_verified_at timestamptz,
  email           citext UNIQUE,
  email_verified_at timestamptz,
  password_hash   text,                           -- null si OAuth/OTP uniquement
  locale          text NOT NULL DEFAULT 'sq',
  country_code    char(2) NOT NULL DEFAULT 'XK' REFERENCES countries(code),
  status          user_status NOT NULL DEFAULT 'active',
  status_reason   text,
  risk_score      smallint NOT NULL DEFAULT 0,    -- 0–100, recalculé (CDC §46)
  last_seen_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz                     -- soft delete RGPD (purge différée)
);

CREATE TABLE auth_identities (                    -- Google / Apple / futurs (CDC §5)
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider        text NOT NULL,                  -- 'google' | 'apple' | ...
  provider_uid    text NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_uid)
);

CREATE TABLE refresh_tokens (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash      text NOT NULL,
  device_id       uuid,
  expires_at      timestamptz NOT NULL,
  revoked_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id) WHERE revoked_at IS NULL;

CREATE TABLE devices (                            -- anti-fraude (CDC §47), respect privacy
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES users(id) ON DELETE SET NULL,
  fingerprint_hash text NOT NULL,                 -- hash salé, jamais brut
  platform        text,
  push_token      text,
  last_ip_hash    text,
  last_seen_at    timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_devices_fingerprint ON devices(fingerprint_hash);
CREATE INDEX idx_devices_user ON devices(user_id);

-- ============================================================================
-- PROFILS (CDC §21–23, §95)
-- ============================================================================

CREATE TABLE profiles (                           -- profil particulier (1:1 users)
  user_id         uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name    text NOT NULL,
  avatar_media_id uuid,
  city_id         uuid REFERENCES cities(id),
  zone_id         uuid REFERENCES zones(id),
  bio             text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE professional_profiles (              -- capacité "pro" (0..1 par user)
  user_id         uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  business_id     uuid,                           -- FK ajoutée après businesses
  headline        text,                           -- "ARDI ELEKTRO"
  description     text,
  base_location   geography(Point,4326),
  city_id         uuid REFERENCES cities(id),
  service_radius_km smallint NOT NULL DEFAULT 20, -- rayon d'intervention (CDC §17)
  available_now   boolean NOT NULL DEFAULT false, -- DISPO TANI (CDC §31)
  available_now_until timestamptz,
  is_active       boolean NOT NULL DEFAULT true,
  -- Statistiques dénormalisées, recalculées par jobs (source: tables de faits)
  rating_avg      numeric(3,2),
  rating_count    int NOT NULL DEFAULT 0,
  rating_weighted numeric(4,3),                   -- score bayésien (CDC §25)
  jobs_completed  int NOT NULL DEFAULT 0,
  response_rate   numeric(4,3),                   -- 0..1 (CDC §22)
  response_avg_minutes int,
  cancellation_rate numeric(4,3),                 -- ranking dynamique (CDC §109)
  onboarded_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_pro_geo ON professional_profiles USING gist(base_location);
CREATE INDEX idx_pro_available_now ON professional_profiles(available_now) WHERE available_now;

CREATE TABLE businesses (                         -- entreprises (CDC §44, §96)
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_name      text NOT NULL,
  registration_number text,
  address         text,
  representative_name text,
  country_code    char(2) NOT NULL REFERENCES countries(code),
  verified_at     timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE professional_profiles
  ADD CONSTRAINT fk_pro_business FOREIGN KEY (business_id) REFERENCES businesses(id);

CREATE TYPE business_role AS ENUM ('admin','manager','technician');

CREATE TABLE business_members (
  business_id     uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role            business_role NOT NULL DEFAULT 'technician',
  created_at      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (business_id, user_id)
);

-- ============================================================================
-- TAXONOMIE (CDC §32) — hiérarchique (catégories & sous-catégories : parent_id)
-- ============================================================================

CREATE TABLE categories (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id       uuid REFERENCES categories(id),
  slug            text NOT NULL UNIQUE,           -- 'hidraulik'
  name            jsonb NOT NULL,
  icon            text,
  kind            text NOT NULL DEFAULT 'service' CHECK (kind IN ('service','rental')),
  search_synonyms text[] NOT NULL DEFAULT '{}',   -- 'ujë','rrjedhje' (CDC §77)
  price_unit_default text,                        -- 'hour','job','day','m2'...
  requires_exact_address_after_match boolean NOT NULL DEFAULT false, -- CDC §29
  is_active       boolean NOT NULL DEFAULT true,
  sort_order      int NOT NULL DEFAULT 0
);
CREATE INDEX idx_categories_parent ON categories(parent_id);

CREATE TABLE services (                           -- prestations types d'un pro
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id     uuid NOT NULL REFERENCES categories(id),
  name            jsonb NOT NULL,                 -- "Installation électrique"
  is_active       boolean NOT NULL DEFAULT true
);

CREATE TABLE professional_services (              -- ce que propose un pro (CDC §17, §95)
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL REFERENCES professional_profiles(user_id) ON DELETE CASCADE,
  category_id     uuid NOT NULL REFERENCES categories(id),
  service_id      uuid REFERENCES services(id),
  price_min_cents bigint,                         -- tarifs indicatifs
  price_max_cents bigint,
  price_unit      text,
  currency        char(3) NOT NULL DEFAULT 'EUR',
  UNIQUE (professional_id, category_id, service_id)
);
CREATE INDEX idx_pro_services_cat ON professional_services(category_id);

-- ============================================================================
-- MÉDIA (CDC §23, §93)
-- ============================================================================

CREATE TYPE media_status AS ENUM ('uploading','processing','ready','rejected');

CREATE TABLE media (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id   uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind            text NOT NULL CHECK (kind IN ('image','video','document')),
  storage_key     text NOT NULL,
  variants        jsonb NOT NULL DEFAULT '{}',    -- thumbnails, webp/avif
  status          media_status NOT NULL DEFAULT 'uploading',
  moderation_flags jsonb NOT NULL DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE portfolio_items (                    -- portfolio pro (CDC §23)
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL REFERENCES professional_profiles(user_id) ON DELETE CASCADE,
  media_id        uuid NOT NULL REFERENCES media(id),
  caption         text,
  kind            text NOT NULL DEFAULT 'photo' CHECK (kind IN ('photo','before_after','video','certificate')),
  pair_media_id   uuid REFERENCES media(id),      -- avant/après
  sort_order      int NOT NULL DEFAULT 0
);

-- ============================================================================
-- DEMANDES (CDC §10–15, §36, §43)
-- ============================================================================

CREATE TYPE request_status AS ENUM
  ('draft','pending_moderation','published','matched','in_progress',
   'completed','cancelled','expired','blocked');
CREATE TYPE request_visibility AS ENUM ('public','private');
CREATE TYPE request_audience AS ENUM ('all','pro_only');   -- B2B (CDC §43)
CREATE TYPE request_kind AS ENUM ('service','rental_wanted'); -- CDC §36

CREATE TABLE requests (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES users(id),
  kind            request_kind NOT NULL DEFAULT 'service',
  title           text NOT NULL,
  description     text,
  category_id     uuid REFERENCES categories(id),
  subcategory_id  uuid REFERENCES categories(id),
  city_id         uuid REFERENCES cities(id),
  zone_id         uuid REFERENCES zones(id),
  location        geography(Point,4326),          -- approximatif public (CDC §29)
  exact_address   text,                           -- chiffré applicativement, révélé après match
  needed_on       date,
  needed_time     text,                           -- 'morning' | '10:00' | 'flexible'
  is_urgent       boolean NOT NULL DEFAULT false, -- DISPO TANI (CDC §31)
  budget_min_cents bigint,
  budget_max_cents bigint,
  currency        char(3) NOT NULL DEFAULT 'EUR',
  visibility      request_visibility NOT NULL DEFAULT 'public',
  audience        request_audience NOT NULL DEFAULT 'all',
  status          request_status NOT NULL DEFAULT 'draft',
  ai_extraction   jsonb,                          -- sortie NLU (CDC §11), audit & apprentissage
  risk_score      smallint,
  share_slug      text UNIQUE,                    -- lien partageable (CDC §104)
  offers_count    int NOT NULL DEFAULT 0,
  published_at    timestamptz,
  expires_at      timestamptz,
  completed_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_requests_geo ON requests USING gist(location);
CREATE INDEX idx_requests_matching ON requests(category_id, status, published_at DESC)
  WHERE status = 'published';
CREATE INDEX idx_requests_user ON requests(user_id, created_at DESC);
CREATE INDEX idx_requests_title_trgm ON requests USING gin (title gin_trgm_ops);

CREATE TABLE request_images (
  request_id      uuid NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  media_id        uuid NOT NULL REFERENCES media(id),
  sort_order      int NOT NULL DEFAULT 0,
  PRIMARY KEY (request_id, media_id)
);

CREATE TABLE request_recipients (                 -- demandes privées (CDC §15)
  request_id      uuid NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  professional_id uuid NOT NULL REFERENCES professional_profiles(user_id),
  created_at      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (request_id, professional_id)
);

-- ============================================================================
-- MATCHING (CDC §14, §16–18) — trace de diffusion et de scoring
-- ============================================================================

CREATE TABLE request_matches (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id      uuid NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  professional_id uuid NOT NULL REFERENCES professional_profiles(user_id),
  score           numeric(5,2) NOT NULL,
  score_factors   jsonb NOT NULL,                 -- détail par facteur (transparence/debug)
  notified_at     timestamptz,
  notification_mode text,                         -- 'immediate' | 'digest' | 'silent' (CDC §18)
  seen_at         timestamptz,
  responded_at    timestamptz,
  UNIQUE (request_id, professional_id)
);
CREATE INDEX idx_matches_pro ON request_matches(professional_id, notified_at DESC);

CREATE TABLE pro_alert_preferences (              -- alertes pro (CDC §17–18)
  professional_id uuid PRIMARY KEY REFERENCES professional_profiles(user_id) ON DELETE CASCADE,
  categories      uuid[] NOT NULL DEFAULT '{}',
  radius_km       smallint,
  mode            text NOT NULL DEFAULT 'immediate' CHECK (mode IN ('immediate','digest','silent')),
  quiet_hours     jsonb,                          -- {"from":"21:00","to":"07:00"}
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- OFFRES (CDC §19–20, §108)
-- ============================================================================

CREATE TYPE offer_status AS ENUM
  ('pending','seen','shortlisted','accepted','declined','withdrawn','expired');

CREATE TABLE offers (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id      uuid NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  professional_id uuid NOT NULL REFERENCES professional_profiles(user_id),
  price_cents     bigint,
  price_max_cents bigint,                         -- fourchette optionnelle
  price_unit      text,
  currency        char(3) NOT NULL DEFAULT 'EUR',
  available_at    timestamptz,
  duration_estimate text,
  message         text,
  conditions      text,
  completeness_score smallint,                    -- qualité de réponse (CDC §108)
  status          offer_status NOT NULL DEFAULT 'pending',
  accepted_at     timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (request_id, professional_id)
);
CREATE INDEX idx_offers_request ON offers(request_id, created_at);
CREATE INDEX idx_offers_pro ON offers(professional_id, created_at DESC);

CREATE TABLE offer_images (
  offer_id        uuid NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  media_id        uuid NOT NULL REFERENCES media(id),
  PRIMARY KEY (offer_id, media_id)
);

-- ============================================================================
-- MESSAGERIE (CDC §27–28)
-- ============================================================================

CREATE TABLE conversations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id      uuid REFERENCES requests(id),
  rental_id       uuid,                           -- FK ajoutée après rentals
  booking_id      uuid,                           -- FK ajoutée après bookings
  created_at      timestamptz NOT NULL DEFAULT now(),
  last_message_at timestamptz
);

CREATE TABLE conversation_participants (
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_read_at    timestamptz,                    -- read receipts
  is_blocked      boolean NOT NULL DEFAULT false, -- blocage par ce participant
  is_archived     boolean NOT NULL DEFAULT false,
  PRIMARY KEY (conversation_id, user_id)
);
CREATE INDEX idx_conv_participants_user ON conversation_participants(user_id, last_read_at);

CREATE TYPE message_kind AS ENUM
  ('text','image','document','offer','quote','status','system');

CREATE TABLE messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       uuid REFERENCES users(id),      -- null = système
  kind            message_kind NOT NULL DEFAULT 'text',
  body            text,
  payload         jsonb,                          -- media_ids, offer_id, quote_id...
  risk_flags      jsonb,                          -- sortie Risk Engine (CDC §28)
  is_hidden       boolean NOT NULL DEFAULT false, -- masqué par modération
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);

-- ============================================================================
-- AVIS & RÉPUTATION (CDC §25–26)
-- ============================================================================

CREATE TYPE review_status AS ENUM ('published','pending','hidden','removed');

CREATE TABLE reviews (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id       uuid NOT NULL REFERENCES users(id),
  subject_user_id uuid NOT NULL REFERENCES users(id),
  request_id      uuid REFERENCES requests(id),
  booking_id      uuid,                           -- FK ajoutée après bookings
  rating          smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  rating_quality  smallint CHECK (rating_quality BETWEEN 1 AND 5),
  rating_punctuality smallint CHECK (rating_punctuality BETWEEN 1 AND 5),
  rating_communication smallint CHECK (rating_communication BETWEEN 1 AND 5),
  rating_value    smallint CHECK (rating_value BETWEEN 1 AND 5),
  rating_professionalism smallint CHECK (rating_professionalism BETWEEN 1 AND 5),
  comment         text,
  verified_interaction boolean NOT NULL DEFAULT false, -- lié à une prestation réelle
  status          review_status NOT NULL DEFAULT 'published',
  risk_flags      jsonb,                          -- anti-faux-avis (CDC §26)
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (author_id, request_id)                  -- 1 avis par interaction
);
CREATE INDEX idx_reviews_subject ON reviews(subject_user_id, status, created_at DESC);

CREATE TABLE review_replies (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id       uuid NOT NULL UNIQUE REFERENCES reviews(id) ON DELETE CASCADE,
  author_id       uuid NOT NULL REFERENCES users(id),
  body            text NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- VÉRIFICATIONS & BADGES (CDC §24, §96)
-- ============================================================================

CREATE TYPE verification_type AS ENUM
  ('phone','email','identity','business','professional','documents','insurance');
CREATE TYPE verification_status AS ENUM
  ('pending','in_review','verified','rejected','expired');

CREATE TABLE verifications (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_id     uuid REFERENCES businesses(id),
  type            verification_type NOT NULL,
  status          verification_status NOT NULL DEFAULT 'pending',
  evidence        jsonb,                          -- refs media chiffrées, purgées après décision
  reviewed_by     uuid REFERENCES users(id),      -- admin
  verified_at     timestamptz,
  expires_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX idx_verifications_active
  ON verifications(user_id, type) WHERE status IN ('pending','in_review','verified');

-- ============================================================================
-- LOCATION — QIRA (CDC §33–37)
-- ============================================================================

CREATE TYPE rental_status AS ENUM
  ('draft','pending_moderation','published','paused','blocked','archived');

CREATE TABLE rentals (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        uuid NOT NULL REFERENCES users(id),
  title           text NOT NULL,
  description     text,
  category_id     uuid NOT NULL REFERENCES categories(id),
  brand           text,
  model           text,
  year            smallint,
  condition       text CHECK (condition IN ('new','very_good','good','fair')),
  price_day_cents bigint,
  price_week_cents bigint,
  price_month_cents bigint,
  deposit_cents   bigint,
  currency        char(3) NOT NULL DEFAULT 'EUR',
  delivery_available boolean NOT NULL DEFAULT false,
  conditions      text,
  city_id         uuid REFERENCES cities(id),
  location        geography(Point,4326),
  status          rental_status NOT NULL DEFAULT 'draft',
  risk_score      smallint,
  share_slug      text UNIQUE,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_rentals_geo ON rentals USING gist(location);
CREATE INDEX idx_rentals_cat ON rentals(category_id, status) WHERE status='published';

CREATE TABLE rental_images (
  rental_id       uuid NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
  media_id        uuid NOT NULL REFERENCES media(id),
  sort_order      int NOT NULL DEFAULT 0,
  PRIMARY KEY (rental_id, media_id)
);

CREATE TABLE rental_availability (                -- calendrier (CDC §35)
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_id       uuid NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
  date_range      daterange NOT NULL,
  state           text NOT NULL CHECK (state IN ('available','booked','blocked')),
  price_override_cents bigint,                    -- prix variable par période
  EXCLUDE USING gist (rental_id WITH =, date_range WITH &&)
);

-- ============================================================================
-- RÉSERVATIONS (CDC §37)
-- ============================================================================

CREATE TYPE booking_status AS ENUM
  ('pending','confirmed','active','returned','completed','cancelled','disputed');

CREATE TABLE bookings (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_id       uuid NOT NULL REFERENCES rentals(id),
  renter_id       uuid NOT NULL REFERENCES users(id),
  request_id      uuid REFERENCES requests(id),   -- si issue d'une demande de location
  date_range      daterange NOT NULL,
  amount_cents    bigint NOT NULL,
  deposit_cents   bigint NOT NULL DEFAULT 0,
  currency        char(3) NOT NULL DEFAULT 'EUR',
  status          booking_status NOT NULL DEFAULT 'pending',
  cancelled_by    uuid REFERENCES users(id),
  cancel_reason   text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_bookings_rental ON bookings(rental_id, status);
CREATE INDEX idx_bookings_renter ON bookings(renter_id, created_at DESC);

ALTER TABLE conversations ADD CONSTRAINT fk_conv_rental
  FOREIGN KEY (rental_id) REFERENCES rentals(id);
ALTER TABLE conversations ADD CONSTRAINT fk_conv_booking
  FOREIGN KEY (booking_id) REFERENCES bookings(id);
ALTER TABLE reviews ADD CONSTRAINT fk_reviews_booking
  FOREIGN KEY (booking_id) REFERENCES bookings(id);

-- ============================================================================
-- PAIEMENTS — architecture dormante (CDC §38, D8) ; aucun PSP verrouillé
-- ============================================================================

CREATE TYPE payment_status AS ENUM
  ('created','pending','authorized','captured','failed','cancelled','refunded','partially_refunded');

CREATE TABLE payments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payer_id        uuid NOT NULL REFERENCES users(id),
  payee_id        uuid REFERENCES users(id),
  booking_id      uuid REFERENCES bookings(id),
  request_id      uuid REFERENCES requests(id),
  kind            text NOT NULL CHECK (kind IN ('payment','deposit_hold','subscription','payout')),
  amount_cents    bigint NOT NULL,
  currency        char(3) NOT NULL DEFAULT 'EUR',
  provider        text NOT NULL,                  -- abstraction PaymentProvider
  provider_ref    text,
  status          payment_status NOT NULL DEFAULT 'created',
  idempotency_key text UNIQUE,
  metadata        jsonb NOT NULL DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE refunds (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id      uuid NOT NULL REFERENCES payments(id),
  amount_cents    bigint NOT NULL,
  reason          text,
  status          text NOT NULL DEFAULT 'pending',
  provider_ref    text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- DEVIS & FACTURES (CDC §39–40)
-- ============================================================================

CREATE TYPE quote_status AS ENUM
  ('draft','sent','viewed','accepted','declined','revision_requested','expired');

CREATE TABLE quotes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL REFERENCES professional_profiles(user_id),
  client_id       uuid NOT NULL REFERENCES users(id),
  request_id      uuid REFERENCES requests(id),
  number          text NOT NULL,                  -- séquence par pro
  status          quote_status NOT NULL DEFAULT 'draft',
  subtotal_cents  bigint NOT NULL DEFAULT 0,
  tax_cents       bigint NOT NULL DEFAULT 0,
  total_cents     bigint NOT NULL DEFAULT 0,
  currency        char(3) NOT NULL DEFAULT 'EUR',
  valid_until     date,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (professional_id, number)
);

CREATE TABLE quote_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id        uuid NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  kind            text NOT NULL DEFAULT 'service' CHECK (kind IN ('service','material','labor','other')),
  label           text NOT NULL,
  quantity        numeric(10,2) NOT NULL DEFAULT 1,
  unit_price_cents bigint NOT NULL,
  total_cents     bigint NOT NULL,
  sort_order      int NOT NULL DEFAULT 0
);

CREATE TYPE invoice_status AS ENUM ('draft','sent','paid','overdue','cancelled');

CREATE TABLE invoices (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL REFERENCES professional_profiles(user_id),
  client_id       uuid NOT NULL REFERENCES users(id),
  quote_id        uuid REFERENCES quotes(id),
  number          text NOT NULL,
  status          invoice_status NOT NULL DEFAULT 'draft',
  subtotal_cents  bigint NOT NULL DEFAULT 0,
  tax_cents       bigint NOT NULL DEFAULT 0,
  total_cents     bigint NOT NULL DEFAULT 0,
  currency        char(3) NOT NULL DEFAULT 'EUR',
  due_date        date,
  paid_at         timestamptz,
  pdf_media_id    uuid REFERENCES media(id),
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (professional_id, number)
);

CREATE TABLE invoice_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id      uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  label           text NOT NULL,
  quantity        numeric(10,2) NOT NULL DEFAULT 1,
  unit_price_cents bigint NOT NULL,
  total_cents     bigint NOT NULL,
  sort_order      int NOT NULL DEFAULT 0
);

-- ============================================================================
-- ABONNEMENTS — dormants 2 ans (CDC §54–58)
-- ============================================================================

CREATE TABLE plans (
  id              text PRIMARY KEY,               -- 'free','pro','pro_plus','boost','premium'
  name            jsonb NOT NULL,
  features        jsonb NOT NULL DEFAULT '{}',    -- feature flags par plan
  price_month_cents bigint NOT NULL DEFAULT 0,
  currency        char(3) NOT NULL DEFAULT 'EUR',
  is_active       boolean NOT NULL DEFAULT true
);

CREATE TABLE subscriptions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id         text NOT NULL REFERENCES plans(id) DEFAULT 'free',
  status          text NOT NULL DEFAULT 'active' CHECK (status IN ('active','past_due','cancelled','expired')),
  current_period_start timestamptz,
  current_period_end   timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX idx_subscriptions_active ON subscriptions(user_id) WHERE status='active';

-- ============================================================================
-- NOTIFICATIONS (CDC §18, §53)
-- ============================================================================

CREATE TABLE notifications (
  id              uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type            text NOT NULL,                  -- 'request.matched','offer.received',...
  payload         jsonb NOT NULL DEFAULT '{}',
  channels        text[] NOT NULL DEFAULT '{push}',
  grouped_key     text,                           -- regroupement anti-spam (CDC §18)
  sent_at         timestamptz,
  read_at         timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id, created_at)                    -- la PK inclut la clé de partition
) PARTITION BY RANGE (created_at);
CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);

CREATE TABLE notification_preferences (
  user_id         uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  prefs           jsonb NOT NULL DEFAULT '{}',    -- par type × canal
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- FAVORIS & RECHERCHES SAUVEGARDÉES (CDC §51–52)
-- ============================================================================

CREATE TABLE favorites (
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type     text NOT NULL CHECK (target_type IN ('professional','request','rental','service')),
  target_id       uuid NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, target_type, target_id)
);

CREATE TABLE saved_searches (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label           text,
  query           jsonb NOT NULL,                 -- filtres sérialisés
  notify          boolean NOT NULL DEFAULT true,
  last_notified_at timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- MODÉRATION, RISK & SANCTIONS (CDC §12, §46–49)
-- ============================================================================

CREATE TABLE reports (                            -- signalements (CDC §48)
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id     uuid REFERENCES users(id),
  target_type     text NOT NULL CHECK (target_type IN ('user','request','rental','message','review','offer')),
  target_id       uuid NOT NULL,
  reason          text NOT NULL CHECK (reason IN
    ('scam','fake_profile','spam','misleading_price','forbidden_content','abusive','other')),
  details         text,
  status          text NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_review','resolved','dismissed')),
  handled_by      uuid REFERENCES users(id),
  resolved_at     timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_reports_status ON reports(status, created_at);
CREATE INDEX idx_reports_target ON reports(target_type, target_id);

CREATE TABLE risk_events (                        -- Risk Center (CDC §46)
  id              uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES users(id),
  entity_type     text,
  entity_id       uuid,
  source          text NOT NULL,                  -- 'listing_moderation','price_check','message_scan',...
  score           smallint NOT NULL,
  reasons         jsonb NOT NULL DEFAULT '[]',
  device_id       uuid REFERENCES devices(id),
  ip_hash         text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);
CREATE INDEX idx_risk_events_user ON risk_events(user_id, created_at DESC);

CREATE TABLE sanctions (                          -- sanctions graduées (CDC §49)
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES users(id),
  kind            text NOT NULL CHECK (kind IN
    ('warning','limitation','temporary_suspension','verification_required','permanent_ban')),
  reason          text NOT NULL,
  issued_by       uuid REFERENCES users(id),      -- null = automatique
  starts_at       timestamptz NOT NULL DEFAULT now(),
  ends_at         timestamptz,
  revoked_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_sanctions_user ON sanctions(user_id) WHERE revoked_at IS NULL;

CREATE TABLE price_benchmarks (                   -- détection prix contextuelle (CDC §13)
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id     uuid NOT NULL REFERENCES categories(id),
  city_id         uuid REFERENCES cities(id),
  unit            text,
  p10_cents       bigint, p50_cents bigint, p90_cents bigint,
  sample_size     int NOT NULL,
  computed_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (category_id, city_id, unit)
);

-- ============================================================================
-- AUDIT & RGPD (CDC §71–72, §89, §113)
-- ============================================================================

CREATE TABLE audit_logs (
  id              uuid NOT NULL DEFAULT gen_random_uuid(),
  actor_id        uuid,                           -- user ou admin ; null = système
  actor_role      text,
  action          text NOT NULL,                  -- 'user.suspend','request.block',...
  target_type     text,
  target_id       uuid,
  ip_hash         text,
  metadata        jsonb NOT NULL DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);
CREATE INDEX idx_audit_actor ON audit_logs(actor_id, created_at DESC);
CREATE INDEX idx_audit_target ON audit_logs(target_type, target_id);

CREATE TABLE consents (                           -- consent management (CDC §72)
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purpose         text NOT NULL,                  -- 'marketing_email','analytics',...
  granted         boolean NOT NULL,
  updated_at      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, purpose)
);

CREATE TABLE data_requests (                      -- export / suppression (CDC §113)
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES users(id),
  kind            text NOT NULL CHECK (kind IN ('export','deletion')),
  status          text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','done','rejected')),
  result_media_id uuid REFERENCES media(id),
  completed_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- ANALYTICS (CDC §59–62) — événements bruts, agrégés par jobs
-- ============================================================================

CREATE TABLE analytics_events (
  id              bigint GENERATED ALWAYS AS IDENTITY,
  event           text NOT NULL,                  -- taxonomie doc 07
  user_id         uuid,
  anonymous_id    text,
  city_id         uuid,
  category_id     uuid,
  properties      jsonb NOT NULL DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);
CREATE INDEX idx_analytics_event ON analytics_events(event, created_at);

-- ============================================================================
-- CMS & CONFIGURATION (CDC §16, §82–83)
-- ============================================================================

CREATE TABLE cms_pages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text NOT NULL UNIQUE,
  kind            text NOT NULL DEFAULT 'page' CHECK (kind IN ('page','faq','guide','banner','legal')),
  title           jsonb NOT NULL,
  body            jsonb NOT NULL,                 -- contenu multilingue
  seo             jsonb NOT NULL DEFAULT '{}',    -- title/meta/structured data
  status          text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  published_at    timestamptz,
  updated_by      uuid REFERENCES users(id),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE settings (                           -- config runtime (poids matching, seuils risk, flags)
  key             text PRIMARY KEY,               -- 'matching.weights','risk.thresholds',...
  value           jsonb NOT NULL,
  updated_by      uuid REFERENCES users(id),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE admin_roles (                        -- rôles admin (CDC §88)
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role            text NOT NULL CHECK (role IN
    ('super_admin','admin','moderator','support','finance','content_manager')),
  granted_by      uuid REFERENCES users(id),
  created_at      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role)
);
