-- Enable Row Level Security on all Django tables
-- Run this in Supabase SQL Editor to fix security warnings

-- Enable RLS and create policies for Django system tables
ALTER TABLE public.django_migrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for authenticated users" ON public.django_migrations FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.django_content_type ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for authenticated users" ON public.django_content_type FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.auth_permission ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for authenticated users" ON public.auth_permission FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.auth_group ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for authenticated users" ON public.auth_group FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.auth_group_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for authenticated users" ON public.auth_group_permissions FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.django_admin_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for authenticated users" ON public.django_admin_log FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.django_session ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for authenticated users" ON public.django_session FOR ALL USING (auth.role() = 'authenticated');

-- Enable RLS for user-related tables
ALTER TABLE public.accounts_user ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for authenticated users" ON public.accounts_user FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.accounts_user_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for authenticated users" ON public.accounts_user_groups FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.accounts_user_user_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for authenticated users" ON public.accounts_user_user_permissions FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.accounts_notification ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for authenticated users" ON public.accounts_notification FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.accounts_favorite ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for authenticated users" ON public.accounts_favorite FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.authtoken_token ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for authenticated users" ON public.authtoken_token FOR ALL USING (auth.role() = 'authenticated');

-- Enable RLS for application tables
ALTER TABLE public.deals_deal ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for authenticated users" ON public.deals_deal FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.deals_dealimage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for authenticated users" ON public.deals_dealimage FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.deals_review ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for authenticated users" ON public.deals_review FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.deals_storelink ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for authenticated users" ON public.deals_storelink FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.deals_clicktracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for authenticated users" ON public.deals_clicktracking FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.sellers_seller ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for authenticated users" ON public.sellers_seller FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.sellers_subscriptionplan ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for authenticated users" ON public.sellers_subscriptionplan FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.sellers_payment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for authenticated users" ON public.sellers_payment FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.sellers_subscription ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for authenticated users" ON public.sellers_subscription FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for authenticated users" ON public.seller_profiles FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.categories_category ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for authenticated users" ON public.categories_category FOR ALL USING (auth.role() = 'authenticated');

-- Enable RLS for blog tables
ALTER TABLE public.blog_blogpost ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for authenticated users" ON public.blog_blogpost FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.blog_blogcategory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for authenticated users" ON public.blog_blogcategory FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.blog_blogsubcategory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for authenticated users" ON public.blog_blogsubcategory FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.blog_blogcomment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for authenticated users" ON public.blog_blogcomment FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.blog_blogfollow ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for authenticated users" ON public.blog_blogfollow FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.blog_bloglike ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for authenticated users" ON public.blog_bloglike FOR ALL USING (auth.role() = 'authenticated');

-- Enable RLS for messaging tables
ALTER TABLE public.messaging_conversation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for authenticated users" ON public.messaging_conversation FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.messaging_conversation_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for authenticated users" ON public.messaging_conversation_participants FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.messaging_message ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for authenticated users" ON public.messaging_message FOR ALL USING (auth.role() = 'authenticated');

-- Enable RLS for newsletter and verification tables
ALTER TABLE public.newsletter_newslettersubscriber ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for authenticated users" ON public.newsletter_newslettersubscriber FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.verification_adminnotification ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for authenticated users" ON public.verification_adminnotification FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.verification_adminnotification_specific_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for authenticated users" ON public.verification_adminnotification_specific_users FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.verification_ticket ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for authenticated users" ON public.verification_ticket FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.verification_ticketmessage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for authenticated users" ON public.verification_ticketmessage FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.verification_verificationrequest ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable access for authenticated users" ON public.verification_verificationrequest FOR ALL USING (auth.role() = 'authenticated');