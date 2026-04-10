-- FoodRescue Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PROFILES TABLE
-- =============================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  org_name TEXT DEFAULT '',
  role TEXT NOT NULL CHECK (role IN ('donor', 'ngo')) DEFAULT 'donor',
  avatar_url TEXT,
  bio TEXT DEFAULT '',
  location TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'donor')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- FOOD LISTINGS TABLE
-- =============================================
CREATE TABLE public.food_listings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  donor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Other',
  quantity NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'kg',
  expiry_date DATE,
  location TEXT NOT NULL DEFAULT '',
  notes TEXT DEFAULT '',
  urgent BOOLEAN DEFAULT false,
  status TEXT NOT NULL CHECK (status IN ('available', 'claimed', 'picked_up', 'expired')) DEFAULT 'available',
  photos TEXT[] DEFAULT '{}',
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PICKUP REQUESTS TABLE
-- =============================================
CREATE TABLE public.pickup_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID REFERENCES public.food_listings(id) ON DELETE CASCADE NOT NULL,
  ngo_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  donor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  pickup_date DATE NOT NULL,
  pickup_time TEXT NOT NULL,
  message TEXT DEFAULT '',
  status TEXT NOT NULL CHECK (status IN ('pending', 'scheduled', 'completed', 'cancelled')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CONVERSATIONS TABLE
-- =============================================
CREATE TABLE public.conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  participant_1 UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  participant_2 UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  last_message TEXT DEFAULT '',
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant_1, participant_2)
);

-- =============================================
-- MESSAGES TABLE
-- =============================================
CREATE TABLE public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  icon TEXT DEFAULT '🔔',
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('request', 'success', 'warning', 'message', 'info')) DEFAULT 'info',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickup_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all, update own
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Food Listings: all can read, donors can insert/update/delete own
CREATE POLICY "Food listings are viewable by everyone" ON public.food_listings FOR SELECT USING (true);
CREATE POLICY "Donors can create listings" ON public.food_listings FOR INSERT WITH CHECK (auth.uid() = donor_id);
CREATE POLICY "Donors can update own listings" ON public.food_listings FOR UPDATE USING (auth.uid() = donor_id);
CREATE POLICY "Donors can delete own listings" ON public.food_listings FOR DELETE USING (auth.uid() = donor_id);

-- Pickup Requests: participants can read, NGOs can create
CREATE POLICY "Pickup requests viewable by participants" ON public.pickup_requests FOR SELECT USING (auth.uid() = ngo_id OR auth.uid() = donor_id);
CREATE POLICY "NGOs can create pickup requests" ON public.pickup_requests FOR INSERT WITH CHECK (auth.uid() = ngo_id);
CREATE POLICY "Participants can update pickup requests" ON public.pickup_requests FOR UPDATE USING (auth.uid() = ngo_id OR auth.uid() = donor_id);

-- Conversations: participants can read/create
CREATE POLICY "Users can view own conversations" ON public.conversations FOR SELECT USING (auth.uid() = participant_1 OR auth.uid() = participant_2);
CREATE POLICY "Users can create conversations" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);
CREATE POLICY "Users can update own conversations" ON public.conversations FOR UPDATE USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- Messages: conversation participants can read/create
CREATE POLICY "Users can view messages in their conversations" ON public.messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id
    AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
  )
);
CREATE POLICY "Users can send messages in their conversations" ON public.messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id
    AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
  )
);
CREATE POLICY "Users can update own messages" ON public.messages FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id
    AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
  )
);

-- Notifications: users can read/update own
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- =============================================
-- ENABLE REALTIME
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_food_listings_donor ON public.food_listings(donor_id);
CREATE INDEX idx_food_listings_status ON public.food_listings(status);
CREATE INDEX idx_food_listings_category ON public.food_listings(category);
CREATE INDEX idx_pickup_requests_ngo ON public.pickup_requests(ngo_id);
CREATE INDEX idx_pickup_requests_donor ON public.pickup_requests(donor_id);
CREATE INDEX idx_pickup_requests_listing ON public.pickup_requests(listing_id);
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX idx_messages_created ON public.messages(created_at);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_conversations_p1 ON public.conversations(participant_1);
CREATE INDEX idx_conversations_p2 ON public.conversations(participant_2);
