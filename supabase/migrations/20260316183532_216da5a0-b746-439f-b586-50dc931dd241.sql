
-- Media articles table
CREATE TABLE public.media_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  summary text NOT NULL,
  content text NOT NULL,
  featured_image text,
  category text NOT NULL DEFAULT 'company_news',
  content_type text NOT NULL DEFAULT 'article',
  is_featured boolean DEFAULT false,
  is_published boolean DEFAULT false,
  video_url text,
  download_url text,
  author text DEFAULT 'Shippers Link Agencies',
  tags text[] DEFAULT '{}',
  views_count integer DEFAULT 0,
  published_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.media_articles ENABLE ROW LEVEL SECURITY;

-- Public can read published articles
CREATE POLICY "Anyone can view published articles"
  ON public.media_articles FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

-- Staff can manage articles
CREATE POLICY "Staff can manage articles"
  ON public.media_articles FOR ALL
  TO authenticated
  USING (NOT is_client(auth.uid()))
  WITH CHECK (NOT is_client(auth.uid()));

-- Newsletter subscribers table
CREATE TABLE public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  company text,
  is_active boolean DEFAULT true,
  subscribed_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe
CREATE POLICY "Anyone can subscribe"
  ON public.newsletter_subscribers FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Staff can view subscribers
CREATE POLICY "Staff can view subscribers"
  ON public.newsletter_subscribers FOR SELECT
  TO authenticated
  USING (NOT is_client(auth.uid()));

-- Staff can manage subscribers
CREATE POLICY "Staff can manage subscribers"
  ON public.newsletter_subscribers FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete subscribers"
  ON public.newsletter_subscribers FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));
