-- PostgreSQL Database Dump for Lapak UI
-- Generated for FTUI SBD Practical Class Final Project
-- Target Server Version: 14/15/16 (Supabase Managed PostgreSQL)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA public;

-- 2. Create Schema Tables
CREATE TABLE public.users (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    faculty character varying(100),
    profile_picture text,
    role character varying(20) DEFAULT 'user'::character varying NOT NULL,
    telegram_chat_id bigint,
    google_calendar_token text,
    rating_avg numeric(3,2) DEFAULT 0.00 NOT NULL,
    rating_count integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_email_key UNIQUE (email)
);

CREATE TABLE public.products (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    seller_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    price integer NOT NULL,
    is_negotiable boolean DEFAULT false NOT NULL,
    category character varying(20),
    sub_category character varying(100),
    condition character varying(20),
    status character varying(20) DEFAULT 'available'::character varying NOT NULL,
    reservation_duration integer DEFAULT 24 NOT NULL,
    cod_location character varying(255),
    faculty_location character varying(100),
    view_count integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT products_pkey PRIMARY KEY (id),
    CONSTRAINT products_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id) ON DELETE CASCADE
);

CREATE TABLE public.product_images (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    image_url text NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    order_index integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT product_images_pkey PRIMARY KEY (id),
    CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE
);

CREATE TABLE public.reservations (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    buyer_id uuid NOT NULL,
    status character varying(30) DEFAULT 'pending'::character varying NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    redis_key character varying(255),
    note text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT reservations_pkey PRIMARY KEY (id),
    CONSTRAINT reservations_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE,
    CONSTRAINT reservations_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.users(id) ON DELETE CASCADE
);

CREATE TABLE public.transactions (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    reservation_id uuid NOT NULL,
    product_id uuid,
    buyer_id uuid,
    seller_id uuid,
    status character varying(30) DEFAULT 'on_progress'::character varying NOT NULL,
    final_price integer,
    cod_location character varying(255),
    cod_scheduled_at timestamp with time zone,
    seller_confirmed_at timestamp with time zone,
    buyer_confirmed_at timestamp with time zone,
    calendar_event_id character varying(255),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT transactions_pkey PRIMARY KEY (id),
    CONSTRAINT transactions_reservation_id_fkey FOREIGN KEY (reservation_id) REFERENCES public.reservations(id) ON DELETE CASCADE,
    CONSTRAINT transactions_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL,
    CONSTRAINT transactions_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.users(id) ON DELETE SET NULL,
    CONSTRAINT transactions_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE TABLE public.reviews (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    transaction_id uuid NOT NULL,
    reviewer_id uuid,
    reviewee_id uuid,
    rating smallint NOT NULL,
    comment character varying(500),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT reviews_pkey PRIMARY KEY (id),
    CONSTRAINT reviews_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON DELETE CASCADE,
    CONSTRAINT reviews_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.users(id) ON DELETE SET NULL,
    CONSTRAINT reviews_reviewee_id_fkey FOREIGN KEY (reviewee_id) REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE TABLE public.posts (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    author_id uuid NOT NULL,
    content text NOT NULL,
    like_count integer DEFAULT 0 NOT NULL,
    reply_count integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT posts_pkey PRIMARY KEY (id),
    CONSTRAINT posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE CASCADE
);

CREATE TABLE public.post_images (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    image_url text NOT NULL,
    order_index integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT post_images_pkey PRIMARY KEY (id),
    CONSTRAINT post_images_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE
);

CREATE TABLE public.comments (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    author_id uuid NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT comments_pkey PRIMARY KEY (id),
    CONSTRAINT comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE,
    CONSTRAINT comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE CASCADE
);

CREATE TABLE public.likes (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT likes_pkey PRIMARY KEY (id),
    CONSTRAINT likes_post_id_user_id_key UNIQUE (post_id, user_id),
    CONSTRAINT likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE,
    CONSTRAINT likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

CREATE TABLE public.chats (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    product_id uuid,
    participant_a uuid,
    participant_b uuid,
    last_message text,
    last_message_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chats_pkey PRIMARY KEY (id),
    CONSTRAINT chats_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL,
    CONSTRAINT chats_participant_a_fkey FOREIGN KEY (participant_a) REFERENCES public.users(id) ON DELETE SET NULL,
    CONSTRAINT chats_participant_b_fkey FOREIGN KEY (participant_b) REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE TABLE public.messages (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    chat_id uuid NOT NULL,
    sender_id uuid,
    content text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT messages_pkey PRIMARY KEY (id),
    CONSTRAINT messages_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chats(id) ON DELETE CASCADE,
    CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE TABLE public.wishlists (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    product_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT wishlists_pkey PRIMARY KEY (id),
    CONSTRAINT wishlists_user_id_product_id_key UNIQUE (user_id, product_id),
    CONSTRAINT wishlists_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT wishlists_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE
);

CREATE TABLE public.notifications (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    type character varying(50) NOT NULL,
    title character varying(255),
    message text,
    link character varying(255),
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT notifications_pkey PRIMARY KEY (id),
    CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- 3. Inserting Mock Data for SBD Evaluation
-- All users are mock UI Students
INSERT INTO public.users (id, name, email, password_hash, faculty, role, telegram_chat_id) VALUES
('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'Marshal Aufa', 'marshal.aufa@ui.ac.id', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', 'Fakultas Teknik', 'admin', 123456789),
('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Deandro Najwan', 'deandro.najwan@ui.ac.id', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', 'Fakultas Teknik', 'user', 987654321),
('c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f', 'Musyaffa Iman', 'musyaffa.iman@ui.ac.id', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', 'Fakultas Ilmu Komputer', 'user', 555666777);

INSERT INTO public.products (id, seller_id, title, description, price, is_negotiable, category, sub_category, condition, status, cod_location, faculty_location) VALUES
('d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'Buku Kalkulus Purcell Edisi 9', 'Buku kalkulus wajib bagi mahasiswa tingkat pertama teknik. Masih mulus, tidak ada coretan pulpen.', 120000, true, 'barang', 'Buku & Alat Tulis', 'bekas_mulus', 'available', 'Perpustakaan FT UI', 'FT'),
('e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b', 'c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f', 'Jasa Install MATLAB & Proteus', 'Membantu instalasi software simulasi teknik elektro dan elektro-komputer. COD di kantin Fasilkom.', 35000, false, 'jasa', 'Teknologi & Desain', 'baru', 'available', 'Kantin Fasilkom UI', 'Fasilkom');

INSERT INTO public.product_images (id, product_id, image_url, is_primary, order_index) VALUES
('f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f9a0b1c', 'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', 'https://lapak-ui-images.s3.amazonaws.com/kalkulus.jpg', true, 0);

-- End of SQL Dump
