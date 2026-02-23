--
-- PostgreSQL database dump
--

\restrict XAJScYnpPnHYddsZvk77sHcjehOGX2jiq0gf71EmiqTmhUCaJjtIGRXEjIjL9BA

-- Dumped from database version 18.1 (Debian 18.1-1.pgdg12+2)
-- Dumped by pg_dump version 18.2 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: neondb_owner
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO neondb_owner;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: neondb_owner
--

COMMENT ON SCHEMA public IS '';


--
-- Name: add_company_category_on_service_insert(); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.add_company_category_on_service_insert() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM company_categories
    WHERE company_id = NEW.company_id
      AND category_id = NEW.category_id
  ) THEN
    INSERT INTO company_categories (company_id, category_id)
    VALUES (NEW.company_id, NEW.category_id);
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.add_company_category_on_service_insert() OWNER TO neondb_owner;

--
-- Name: add_company_to_category_from_service(); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.add_company_to_category_from_service() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
 IF NOT EXISTS (
        SELECT 1
        FROM company_categories
        WHERE company_id = NEW.company_id
          AND category_id = NEW.category_id
    ) THEN
        INSERT INTO company_categories (company_id, category_id)
        VALUES (NEW.company_id, NEW.category_id);
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.add_company_to_category_from_service() OWNER TO neondb_owner;

--
-- Name: add_service_item_translations(); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.add_service_item_translations() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO translations (table_name, column_name, row_id, lang_code, value)
    SELECT 
        'service_items', 
        'name', 
        NEW.id,
        lang,
        CASE 
            WHEN NEW.price > 1500 OR NEW.duration > 60 THEN 'Premium'
            ELSE 'Standard'
        END AS type_name
    FROM (VALUES ('sr'), ('en'), ('sv')) AS langs(lang)
    ON CONFLICT (table_name, column_name, row_id, lang_code) DO NOTHING;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.add_service_item_translations() OWNER TO neondb_owner;

--
-- Name: insert_service_item_translations(); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.insert_service_item_translations() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO translations (table_name, column_name, row_id, lang_code, value)
    VALUES
        ('service_items', 'name', NEW.id, 'sr', CASE WHEN NEW.price > 1500 OR NEW.duration > 60 THEN 'Premium' ELSE 'Standard' END),
        ('service_items', 'name', NEW.id, 'en', CASE WHEN NEW.price > 1500 OR NEW.duration > 60 THEN 'Premium' ELSE 'Standard' END),
        ('service_items', 'name', NEW.id, 'sv', CASE WHEN NEW.price > 1500 OR NEW.duration > 60 THEN 'Premium' ELSE 'Standard' END)
    ON CONFLICT (table_name, column_name, row_id, lang_code) DO NOTHING;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.insert_service_item_translations() OWNER TO neondb_owner;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: bookings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.bookings (
    id integer NOT NULL,
    user_id integer,
    service text,
    slot_time timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    status text DEFAULT 'pending'::text,
    slot_id integer NOT NULL,
    company_id integer
);


ALTER TABLE public.bookings OWNER TO neondb_owner;

--
-- Name: bookings_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.bookings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bookings_id_seq OWNER TO neondb_owner;

--
-- Name: bookings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.bookings_id_seq OWNED BY public.bookings.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.categories OWNER TO neondb_owner;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO neondb_owner;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: categories_backup; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.categories_backup (
    id integer DEFAULT nextval('public.categories_id_seq'::regclass) NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.categories_backup OWNER TO neondb_owner;

--
-- Name: category_translations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.category_translations (
    id integer NOT NULL,
    category_id integer,
    language character varying(5) NOT NULL,
    name text
);


ALTER TABLE public.category_translations OWNER TO neondb_owner;

--
-- Name: category_translations_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.category_translations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.category_translations_id_seq OWNER TO neondb_owner;

--
-- Name: category_translations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.category_translations_id_seq OWNED BY public.category_translations.id;


--
-- Name: companies; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.companies (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    city character varying(255) NOT NULL,
    phone character varying(50),
    email character varying(255),
    description text,
    user_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    services jsonb DEFAULT '[]'::jsonb,
    slots jsonb DEFAULT '[]'::jsonb NOT NULL,
    images jsonb DEFAULT '[]'::jsonb,
    category_id integer,
    name_json jsonb,
    description_json jsonb
);


ALTER TABLE public.companies OWNER TO neondb_owner;

--
-- Name: companies_backup; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.companies_backup (
    id integer NOT NULL,
    name text NOT NULL,
    category text,
    city text,
    address text,
    phone text,
    description text,
    images text[],
    services text,
    user_id integer
);


ALTER TABLE public.companies_backup OWNER TO neondb_owner;

--
-- Name: companies_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.companies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.companies_id_seq OWNER TO neondb_owner;

--
-- Name: companies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.companies_id_seq OWNED BY public.companies.id;


--
-- Name: companies_with_ratings; Type: VIEW; Schema: public; Owner: neondb_owner
--

CREATE VIEW public.companies_with_ratings AS
SELECT
    NULL::integer AS id,
    NULL::character varying(255) AS name,
    NULL::character varying(255) AS city,
    NULL::character varying(50) AS phone,
    NULL::character varying(255) AS email,
    NULL::text AS description,
    NULL::integer AS user_id,
    NULL::timestamp without time zone AS created_at,
    NULL::timestamp without time zone AS updated_at,
    NULL::jsonb AS services,
    NULL::jsonb AS slots,
    NULL::jsonb AS images,
    NULL::integer AS category_id,
    NULL::numeric AS avg_rating,
    NULL::bigint AS review_count;


ALTER VIEW public.companies_with_ratings OWNER TO neondb_owner;

--
-- Name: company_categories; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.company_categories (
    company_id integer NOT NULL,
    category_id integer NOT NULL
);


ALTER TABLE public.company_categories OWNER TO neondb_owner;

--
-- Name: company_images; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.company_images (
    id integer NOT NULL,
    company_id integer,
    image_path text NOT NULL,
    public_id character varying(255),
    cloudinary_public_id text
);


ALTER TABLE public.company_images OWNER TO neondb_owner;

--
-- Name: company_images_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.company_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.company_images_id_seq OWNER TO neondb_owner;

--
-- Name: company_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.company_images_id_seq OWNED BY public.company_images.id;


--
-- Name: company_services; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.company_services (
    id integer NOT NULL,
    company_id integer,
    name character varying(255),
    price numeric(10,2),
    service_id integer
);


ALTER TABLE public.company_services OWNER TO neondb_owner;

--
-- Name: company_services_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.company_services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.company_services_id_seq OWNER TO neondb_owner;

--
-- Name: company_services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.company_services_id_seq OWNED BY public.company_services.id;


--
-- Name: company_translations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.company_translations (
    id integer NOT NULL,
    company_id integer,
    language character varying(5) NOT NULL,
    name text,
    description text
);


ALTER TABLE public.company_translations OWNER TO neondb_owner;

--
-- Name: company_translations_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.company_translations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.company_translations_id_seq OWNER TO neondb_owner;

--
-- Name: company_translations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.company_translations_id_seq OWNED BY public.company_translations.id;


--
-- Name: korisnici_backup; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.korisnici_backup (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    role text DEFAULT 'user'::text
);


ALTER TABLE public.korisnici_backup OWNER TO neondb_owner;

--
-- Name: providers; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.providers (
    id integer NOT NULL,
    name text NOT NULL,
    company_id integer
);


ALTER TABLE public.providers OWNER TO neondb_owner;

--
-- Name: providers_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.providers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.providers_id_seq OWNER TO neondb_owner;

--
-- Name: providers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.providers_id_seq OWNED BY public.providers.id;


--
-- Name: providers_backup; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.providers_backup (
    id integer DEFAULT nextval('public.providers_id_seq'::regclass) NOT NULL,
    name text NOT NULL,
    company_id integer
);


ALTER TABLE public.providers_backup OWNER TO neondb_owner;

--
-- Name: reviews; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.reviews (
    id integer NOT NULL,
    company_id integer NOT NULL,
    user_id integer NOT NULL,
    rating integer NOT NULL,
    comment text,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.reviews OWNER TO neondb_owner;

--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reviews_id_seq OWNER TO neondb_owner;

--
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- Name: rezervacije; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.rezervacije (
    id integer NOT NULL,
    korisnik_id integer NOT NULL,
    termin_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.rezervacije OWNER TO neondb_owner;

--
-- Name: rezervacije_backup; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.rezervacije_backup (
    id integer DEFAULT nextval('public.bookings_id_seq'::regclass) NOT NULL,
    user_id integer,
    company_id integer,
    service text,
    slot_time timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.rezervacije_backup OWNER TO neondb_owner;

--
-- Name: rezervacije_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.rezervacije_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rezervacije_id_seq OWNER TO neondb_owner;

--
-- Name: rezervacije_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.rezervacije_id_seq OWNED BY public.rezervacije.id;


--
-- Name: service_items; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.service_items (
    id integer NOT NULL,
    service_id integer NOT NULL,
    price numeric(10,2),
    duration integer
);


ALTER TABLE public.service_items OWNER TO neondb_owner;

--
-- Name: service_items_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.service_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.service_items_id_seq OWNER TO neondb_owner;

--
-- Name: service_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.service_items_id_seq OWNED BY public.service_items.id;


--
-- Name: service_translations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.service_translations (
    id integer NOT NULL,
    service_id integer,
    language character varying(5) NOT NULL,
    name text
);


ALTER TABLE public.service_translations OWNER TO neondb_owner;

--
-- Name: service_translations_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.service_translations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.service_translations_id_seq OWNER TO neondb_owner;

--
-- Name: service_translations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.service_translations_id_seq OWNED BY public.service_translations.id;


--
-- Name: services; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.services (
    id integer NOT NULL,
    company_id integer,
    name character varying(255) NOT NULL,
    price numeric(10,2),
    duration integer,
    category_id integer,
    temp_id text
);


ALTER TABLE public.services OWNER TO neondb_owner;

--
-- Name: services_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.services_id_seq OWNER TO neondb_owner;

--
-- Name: services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.services_id_seq OWNED BY public.services.id;


--
-- Name: slots; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.slots (
    id bigint NOT NULL,
    company_id integer,
    provider_id integer,
    start_time timestamp without time zone,
    end_time timestamp without time zone,
    service_id bigint,
    is_booked boolean DEFAULT false
);


ALTER TABLE public.slots OWNER TO neondb_owner;

--
-- Name: slots_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.slots_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.slots_id_seq OWNER TO neondb_owner;

--
-- Name: slots_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.slots_id_seq OWNED BY public.slots.id;


--
-- Name: slots_backup; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.slots_backup (
    id integer DEFAULT nextval('public.slots_id_seq'::regclass) NOT NULL,
    company_id integer,
    provider_id integer,
    start_time timestamp without time zone,
    end_time timestamp without time zone
);


ALTER TABLE public.slots_backup OWNER TO neondb_owner;

--
-- Name: termini; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.termini (
    id integer NOT NULL,
    company_id integer,
    provider_id integer,
    slot_id integer,
    booked_by integer,
    service text,
    status text DEFAULT 'pending'::text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.termini OWNER TO neondb_owner;

--
-- Name: termini_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.termini_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.termini_id_seq OWNER TO neondb_owner;

--
-- Name: termini_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.termini_id_seq OWNED BY public.termini.id;


--
-- Name: termini_backup; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.termini_backup (
    id integer DEFAULT nextval('public.termini_id_seq'::regclass) NOT NULL,
    company_id integer,
    provider_id integer,
    slot_id integer,
    booked_by integer,
    service text,
    status text DEFAULT 'pending'::text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.termini_backup OWNER TO neondb_owner;

--
-- Name: translations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.translations (
    id integer NOT NULL,
    table_name character varying(50) NOT NULL,
    column_name character varying(50) NOT NULL,
    row_id integer NOT NULL,
    lang_code character(2) NOT NULL,
    value text NOT NULL
);


ALTER TABLE public.translations OWNER TO neondb_owner;

--
-- Name: translations_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.translations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.translations_id_seq OWNER TO neondb_owner;

--
-- Name: translations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.translations_id_seq OWNED BY public.translations.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(50) DEFAULT 'user'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    city character varying(100),
    phone character varying(20),
    reset_token character varying(255),
    reset_token_expires timestamp without time zone,
    avatar text
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: bookings id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bookings ALTER COLUMN id SET DEFAULT nextval('public.bookings_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: category_translations id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.category_translations ALTER COLUMN id SET DEFAULT nextval('public.category_translations_id_seq'::regclass);


--
-- Name: companies id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.companies ALTER COLUMN id SET DEFAULT nextval('public.companies_id_seq'::regclass);


--
-- Name: company_images id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.company_images ALTER COLUMN id SET DEFAULT nextval('public.company_images_id_seq'::regclass);


--
-- Name: company_services id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.company_services ALTER COLUMN id SET DEFAULT nextval('public.company_services_id_seq'::regclass);


--
-- Name: company_translations id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.company_translations ALTER COLUMN id SET DEFAULT nextval('public.company_translations_id_seq'::regclass);


--
-- Name: providers id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.providers ALTER COLUMN id SET DEFAULT nextval('public.providers_id_seq'::regclass);


--
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- Name: rezervacije id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.rezervacije ALTER COLUMN id SET DEFAULT nextval('public.rezervacije_id_seq'::regclass);


--
-- Name: service_items id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.service_items ALTER COLUMN id SET DEFAULT nextval('public.service_items_id_seq'::regclass);


--
-- Name: service_translations id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.service_translations ALTER COLUMN id SET DEFAULT nextval('public.service_translations_id_seq'::regclass);


--
-- Name: services id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.services ALTER COLUMN id SET DEFAULT nextval('public.services_id_seq'::regclass);


--
-- Name: slots id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.slots ALTER COLUMN id SET DEFAULT nextval('public.slots_id_seq'::regclass);


--
-- Name: termini id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.termini ALTER COLUMN id SET DEFAULT nextval('public.termini_id_seq'::regclass);


--
-- Name: translations id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.translations ALTER COLUMN id SET DEFAULT nextval('public.translations_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.bookings (id, user_id, service, slot_time, created_at, status, slot_id, company_id) FROM stdin;
102	31	Depilacija	\N	2026-02-08 17:54:48.36832	pending	67	\N
107	33	Sminka	\N	2026-02-14 12:08:09.824299	pending	156	16
59	33	Masaza	\N	2026-02-03 18:55:21.258795	pending	68	\N
63	33	Lakiranje	\N	2026-02-06 10:00:32.57537	pending	116	\N
114	31	Sisanje (sredna duzina)	\N	2026-02-21 12:39:20.981703	pending	208	8
115	31	Prophilo (1 tretman)	\N	2026-02-21 12:39:36.021625	pending	223	17
116	31	Depilacija (noge)	\N	2026-02-21 12:39:54.109549	pending	231	18
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.categories (id, name) FROM stdin;
3	Masaža
4	Manikir
5	Trepavice & Obrve
6	Lepota
7	Zdravlje
8	Last Minute
9	Pedikir
10	Tretman Lice&Telo
1	Depilacija
2	Frizeri
11	Ostale usluge
\.


--
-- Data for Name: categories_backup; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.categories_backup (id, name) FROM stdin;
\.


--
-- Data for Name: category_translations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.category_translations (id, category_id, language, name) FROM stdin;
1	3	en	Hairdressers
2	3	sv	Frisörer
\.


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.companies (id, name, city, phone, email, description, user_id, created_at, updated_at, services, slots, images, category_id, name_json, description_json) FROM stdin;
13	Salon Beauty	Nis	0765653708	\N	Dobro dosli u nas Salon Beauty!	32	2026-01-25 20:55:08.565973	2026-02-16 14:29:35.794903	[{"id": 143, "name": "Balayage", "price": "4000.00", "tempId": "temp-1770995114943", "duration": 60, "company_id": 13, "category_id": 3}, {"id": 144, "name": "Sisanje (kratka kosa)", "price": "2000.00", "tempId": "temp-1770995239368", "duration": 60, "company_id": 13, "category_id": 3}, {"id": 145, "name": "Pramenove", "price": "12000.00", "tempId": "temp-1770995277900", "duration": 60, "company_id": 13, "category_id": 3}]	[]	[]	3	{"en": "Salon Beauty", "sr": "Salon Beauty", "sv": "Salon Beauty"}	{"en": "Dobro dosli u nas Salon Beauty!", "sr": "Dobro dosli u nas Salon Beauty!", "sv": "Dobro dosli u nas Salon Beauty!"}
12	Studio Belo	Novi Sad	0763912026	\N	Masaže, manikir, pedikir i tretmani za oblikovanje tela uz savremene aparate. Brza i jednostavna online rezervacija termina, uz profesionalnu uslugu i individualan pristup.	30	2026-01-24 22:44:03.321083	2026-02-16 14:29:35.794903	[{"id": 138, "name": "Masaza", "price": "3500.00", "tempId": "temp-1770994719424", "duration": 60, "company_id": 12, "category_id": 4}, {"id": 139, "name": "HIFU (lice)", "price": "6000.00", "tempId": "temp-1770994748500", "duration": 60, "company_id": 12, "category_id": 11}, {"id": 140, "name": "Depilacija (noge)", "price": "3800.00", "tempId": "temp-1770994799008", "duration": 60, "company_id": 12, "category_id": 1}, {"id": 141, "name": "Pedikir (medicinski)", "price": "3600.00", "tempId": "temp-1770994825063", "duration": 60, "company_id": 12, "category_id": 10}, {"id": 142, "name": "French (izlivanje)", "price": "4000.00", "tempId": "temp-1770994882561", "duration": 60, "company_id": 12, "category_id": 5}]	[]	[{"image_path": "1769291299195-2npju43.jpg"}, {"image_path": "1769291299197-g88z4zb.jpg"}, {"image_path": "1769291299197-wmhmw1r.jpg"}, {"image_path": "1769291299203-i6tfzdw.jpg"}]	3	{"en": "Studio Belo", "sr": "Studio Belo", "sv": "Studio Belo"}	{"en": "Masaže, manikir, pedikir i tretmani za oblikovanje tela uz savremene aparate. Brza i jednostavna online rezervacija termina, uz profesionalnu uslugu i individualan pristup.", "sr": "Masaže, manikir, pedikir i tretmani za oblikovanje tela uz savremene aparate. Brza i jednostavna online rezervacija termina, uz profesionalnu uslugu i individualan pristup.", "sv": "Masaže, manikir, pedikir i tretmani za oblikovanje tela uz savremene aparate. Brza i jednostavna online rezervacija termina, uz profesionalnu uslugu i individualan pristup."}
14	Kozmeticki Salon Nails	Pancevo	0763912026	\N	Dobro dosli u najbolji salon za nokte Nails!	34	2026-01-28 00:04:03.013357	2026-02-16 14:29:35.794903	[{"id": 112, "name": "Lakiranje", "price": 2000, "tempId": "temp-1769947376606", "duration": 60, "company_id": 14, "category_id": 5}, {"id": 113, "name": "Manikir (gelack)", "price": 3000, "tempId": "temp-1769947419813", "duration": 60, "company_id": 14, "category_id": 5}, {"id": 121, "name": "French manikir", "price": 3000, "tempId": "temp-1770370913754", "duration": 60, "category_id": 5}, {"id": 122, "name": "Gelack", "price": 3600, "tempId": "temp-1770371041262", "duration": 60, "category_id": 5}]	[]	[]	\N	{"en": "Kozmeticki Salon Nails", "sr": "Kozmeticki Salon Nails", "sv": "Kozmeticki Salon Nails"}	{"en": "Dobro dosli u najbolji salon za nokte Nails!", "sr": "Dobro dosli u najbolji salon za nokte Nails!", "sv": "Dobro dosli u najbolji salon za nokte Nails!"}
8	Studio Malena	Beograd	\N	\N	Dobro dosli u nase Studio za frizure i nokte!	8	2026-01-24 14:29:59.586196	2026-02-17 01:46:17.66648	[{"id": 168, "name": "Sminka", "price": "7000.00", "temp_id": "temp-1771289041517", "duration": 60, "company_id": 8, "category_id": 6}, {"id": 165, "name": "Sisanje (sredna duzina)", "price": "400.00", "temp_id": "temp-1771287913280", "duration": 60, "company_id": 8, "category_id": 2}, {"id": 166, "name": "Balayage", "price": "6000.00", "temp_id": "temp-1771288612948", "duration": 60, "company_id": 8, "category_id": 2}, {"id": 167, "name": "Manikir (gelack)", "price": "3000.00", "temp_id": "temp-1771288668444", "duration": 60, "company_id": 8, "category_id": 4}]	[]	[{"image_path": "1769286505650-x605f0v.jpg"}, {"image_path": "1769286505651-z83bvdv.jpg"}, {"image_path": "1769286505652-t12js8q.jpg"}, {"image_path": "1769286505653-43h3lmc.jpg"}]	3	{"en": "Studio Malena", "sr": "Studio Malena", "sv": "Studio Malena"}	{"en": "Dobro dosli u nase Studio za frizure i nokte!", "sr": "Dobro dosli u nase Studio za frizure i nokte!", "sv": "Dobro dosli u nase Studio za frizure i nokte!"}
18	Salon Zemun	Beograd	063123456	\N	Dobro dosli u najmoderniji salon za kozmetika!	38	2026-02-19 17:46:00.849963	2026-02-19 19:41:28.807906	[{"id": 178, "name": "Botox", "price": "12000.00", "temp_id": "temp-1771526169988", "duration": 60, "company_id": 18, "category_id": 10}, {"id": 179, "name": "Fillers 2ml", "price": "16000.00", "temp_id": "temp-1771526239846", "duration": 60, "company_id": 18, "category_id": 10}, {"id": 180, "name": "Depilacija (noge)", "price": "3000.00", "temp_id": "temp-1771526425951", "duration": 60, "company_id": 18, "category_id": 1}]	[]	[]	\N	\N	\N
16	Studio NK	Niš	0765653708	\N	Najbolji i najsovremeniji Studio u gradu!	36	2026-02-06 11:05:14.148538	2026-02-16 14:29:35.794903	[{"id": 123, "name": "Frizura", "price": 3600, "tempId": "temp-1770373877694", "duration": 60, "company_id": 16, "category_id": 3}, {"id": 126, "name": "Sisanje (sredna duzina)", "price": 2800, "tempId": "temp-1770374279819", "duration": 60, "company_id": 16, "category_id": 3}, {"id": 127, "name": "Sminka", "price": 3800, "tempId": "temp-1770374380768", "duration": 60, "category_id": 7}, {"id": 137, "name": "Lash lift", "price": 3000, "tempId": "temp-1770994574259", "duration": 60, "category_id": 6}]	[]	[]	\N	{"en": "Studio NK", "sr": "Studio NK", "sv": "Studio NK"}	{"en": "Najbolji i najsovremeniji Studio u gradu!", "sr": "Najbolji i najsovremeniji Studio u gradu!", "sv": "Najbolji i najsovremeniji Studio u gradu!"}
15	Salon luxury Treatments	Novi Sad	0763912026	\N	Dobro dosli u nas salon gde nudimo usluge za podmladjivanje i njega lice i telo!	35	2026-01-28 00:19:08.430819	2026-02-16 14:29:35.794903	[{"id": 129, "name": "Botox (celo lice)", "price": 16000, "tempId": "temp-1770894644980", "duration": 60, "category_id": 11}, {"id": 130, "name": "Fillers 2ml", "price": 24000, "tempId": "temp-1770894684832", "duration": 60, "category_id": 11}, {"id": 131, "name": "Botox ( 2 arije)", "price": 13000, "tempId": "temp-1770894860347", "duration": 60, "category_id": 11}, {"id": 132, "name": "Prophilo (1 tretman)", "price": 12000, "tempId": "temp-1770894878338", "duration": 60, "category_id": 11}, {"id": 146, "name": "Prophilo (1 tretman)", "price": "12000.00", "tempId": "temp-1770995444938", "duration": 60, "company_id": 15, "category_id": 11}]	[]	[]	\N	{"en": "Salon luxury Treatments", "sr": "Salon luxury Treatments", "sv": "Salon luxury Treatments"}	{"en": "Dobro dosli u nas salon gde nudimo usluge za podmladjivanje i njega lice i telo!", "sr": "Dobro dosli u nas salon gde nudimo usluge za podmladjivanje i njega lice i telo!", "sv": "Dobro dosli u nas salon gde nudimo usluge za podmladjivanje i njega lice i telo!"}
17	Studio Aestetic	Beograd	063123321	\N	Welcome to the best Studio for Beauty!	37	2026-02-19 11:19:48.790699	2026-02-21 11:34:13.324611	[{"id": 170, "name": "Botox", "price": "12000.00", "temp_id": "temp-1771503997798", "duration": 60, "company_id": 17, "category_id": 10}, {"id": 171, "name": "Fillers 1ml", "price": "8000.00", "temp_id": "temp-1771505443061", "duration": 60, "company_id": 17, "category_id": 10}, {"id": 172, "name": "Prophilo (1 tretman)", "price": "13000.00", "temp_id": "temp-1771505971678", "duration": 60, "company_id": 17, "category_id": 10}, {"id": 173, "name": "Prophilo (1 tretman)", "price": "13000.00", "temp_id": "temp-1771506015260", "duration": 60, "company_id": 17, "category_id": 10}, {"id": 174, "name": "Prophilo (1 tretman)", "price": "13000.00", "temp_id": "temp-1771506041293", "duration": 60, "company_id": 17, "category_id": 10}, {"id": 175, "name": "Botox (celo lice)", "price": "20000.00", "temp_id": "temp-1771506148986", "duration": 60, "company_id": 17, "category_id": 10}, {"id": 176, "name": "Fillers 2ml", "price": "24000.00", "temp_id": "temp-1771509246415", "duration": 60, "company_id": 17, "category_id": 8}, {"id": 177, "name": "Exosomes", "price": "10000.00", "temp_id": "temp-1771512922788", "duration": 60, "company_id": 17, "category_id": 10}]	[]	[]	\N	\N	\N
2	Frizerski Salon Elegant VIP	Beograd	\N	\N	Najbolji frizerski salon u gradu sa novim paketom usluga!	2	2026-01-24 14:29:59.586196	2026-02-21 20:48:55.11296	[{"id": 169, "name": "Feniranje", "price": "3200.00", "temp_id": "temp-1771289343508", "duration": 60, "company_id": 2, "category_id": 2}, {"id": 156, "name": "Feniranje", "price": "3200.00", "temp_id": null, "duration": 60, "company_id": 2, "category_id": 2}, {"id": 157, "name": "Feniranje", "price": "2500.00", "temp_id": null, "duration": 60, "company_id": 2, "category_id": 8}, {"id": 158, "name": "Pramenove", "price": "8000.00", "temp_id": null, "duration": 60, "company_id": 2, "category_id": 2}, {"id": 159, "name": "Sisanje (sredna duzina)", "price": "2300.00", "temp_id": null, "duration": 60, "company_id": 2, "category_id": 2}, {"id": 160, "name": "Balayage", "price": "6000.00", "temp_id": null, "duration": 60, "company_id": 2, "category_id": 2}, {"id": 161, "name": "Sisanje (sredna duzina)", "price": "3000.00", "temp_id": null, "duration": 60, "company_id": 2, "category_id": 2}, {"id": 162, "name": "Pedikir", "price": "2800.00", "temp_id": null, "duration": 60, "company_id": 2, "category_id": 9}, {"id": 163, "name": "Balayage", "price": "6000.00", "temp_id": null, "duration": 60, "company_id": 2, "category_id": 2}]	[]	[{"image_path": "1769277929798-y2z5cq2.jpg"}, {"image_path": "1769277979457-s4bz2ew.jpg"}, {"image_path": "1769284736382-6rmfjj8.jpg"}, {"image_path": "1769284736383-wmf0l87.jpg"}]	3	{"en": "Frizerski Salon Elegant VIP", "sr": "Frizerski Salon Elegant VIP", "sv": "Frizerski Salon Elegant VIP"}	{"en": "Najbolji frizerski salon u gradu sa novim paketom usluga!", "sr": "Najbolji frizerski salon u gradu sa novim paketom usluga!", "sv": "Najbolji frizerski salon u gradu sa novim paketom usluga!"}
\.


--
-- Data for Name: companies_backup; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.companies_backup (id, name, category, city, address, phone, description, images, services, user_id) FROM stdin;
\.


--
-- Data for Name: company_categories; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.company_categories (company_id, category_id) FROM stdin;
2	3
2	5
2	10
2	11
8	5
8	10
8	6
8	7
13	7
13	11
13	6
12	8
12	4
15	11
14	5
2	7
8	3
8	9
16	3
16	7
16	6
14	9
12	11
12	1
12	10
12	5
13	3
2	2
2	8
2	9
8	2
8	4
17	10
17	8
18	10
18	1
\.


--
-- Data for Name: company_images; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.company_images (id, company_id, image_path, public_id, cloudinary_public_id) FROM stdin;
122	13	1769371542046-feniranje.jpg	\N	\N
123	13	1769371542056-sisanje.jpg	\N	\N
124	13	1769371542067-frizurabeauty.jpg	\N	\N
125	13	1769371542101-salonbeauty.jpg	\N	\N
126	14	1769555090878-crninokti.jpg	\N	\N
127	14	1769555090879-noktifirma.jpg	\N	\N
128	14	1769555090881-manikirfir.jpg	\N	\N
129	14	1769555090884-manikirfirma.jpg	\N	\N
130	15	1769556011037-profhilo.jpg	\N	\N
131	15	1769556011038-hifu.jpg	\N	\N
132	15	1769556011038-fillers.jpg	\N	\N
133	15	1769556011046-botox.jpg	\N	\N
134	16	1770373865738-makeup.jpg	\N	\N
135	16	1770373865742-frizure.jpg	\N	\N
136	16	1770373865743-hair.jpg	\N	\N
137	16	1770373865744-studionk.jpg	\N	\N
118	12	1769359176362-7ytpuj.jpg	\N	\N
119	12	1769359176364-cjvgis.jpg	\N	\N
120	12	1769359176364-cwulqa.jpg	\N	\N
121	12	1769359176368-is5m28.jpg	\N	\N
142	8	https://termindirekt-backend.onrender.com/uploads/companies/1771283902006-manikir.jpg	\N	\N
144	8	https://termindirekt-backend.onrender.com/uploads/companies/1771284035190-frizuraa.jpg	\N	\N
146	8	https://termindirekt-backend.onrender.com/uploads/companies/1771286545542-naslovna.jpg	\N	\N
147	8	https://termindirekt-backend.onrender.com/uploads/companies/1771286593949-kozmetika2.jpg	\N	\N
153	18	https://termindirekt-backend.onrender.com/uploads/companies/1771526188304-nokti.jpg	\N	\N
154	18	https://termindirekt-backend.onrender.com/uploads/companies/1771526188306-masaza1.jpg	\N	\N
155	18	https://termindirekt-backend.onrender.com/uploads/companies/1771526188309-kozmetika1.jpg	\N	\N
156	18	https://termindirekt-backend.onrender.com/uploads/companies/1771526189704-kozmetika.jpg	\N	\N
160	17	https://termindirekt-backend.onrender.com/uploads/companies/1771673651127-IMG_3382.JPG	\N	\N
161	17	https://termindirekt-backend.onrender.com/uploads/companies/1771673651127-IMG_3383.JPG	\N	\N
162	17	https://termindirekt-backend.onrender.com/uploads/companies/1771673651128-IMG_3385.PNG	\N	\N
163	17	https://termindirekt-backend.onrender.com/uploads/companies/1771673651131-IMG_3386.JPG	\N	\N
164	2	https://termindirekt-backend.onrender.com/uploads/companies/1771675248235-pedikir.jpg	\N	\N
165	2	https://termindirekt-backend.onrender.com/uploads/companies/1771675273376-feniranje.jpg	\N	\N
166	2	1771706919720-kozmetika.jpg	\N	\N
\.


--
-- Data for Name: company_services; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.company_services (id, company_id, name, price, service_id) FROM stdin;
\.


--
-- Data for Name: company_translations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.company_translations (id, company_id, language, name, description) FROM stdin;
1	8	en	Studio Malena	Professional beauty studio
2	8	sv	Studio Malena	Professionell skönhetsstudio
\.


--
-- Data for Name: korisnici_backup; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.korisnici_backup (id, name, email, password, role) FROM stdin;
\.


--
-- Data for Name: providers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.providers (id, name, company_id) FROM stdin;
\.


--
-- Data for Name: providers_backup; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.providers_backup (id, name, company_id) FROM stdin;
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.reviews (id, company_id, user_id, rating, comment, created_at) FROM stdin;
1	15	2	5	Odličan salon, toplo preporučujem!	2026-02-02 21:09:23.418637
2	15	31	5	hbvhjb	2026-02-02 23:10:59.493447
3	15	31	5	Savrseni!	2026-02-03 00:28:03.018748
4	14	33	5	Odlicni,sve preporuke!	2026-02-03 16:58:23.740915
5	8	31	3	Solidno!	2026-02-03 18:14:58.047836
6	13	31	4	Odlicno, sve preporuke!	2026-02-03 18:22:08.920287
7	2	31	5	Odlicno, najbolji salon!	2026-02-03 18:22:57.829144
8	12	31	5	Najbolji salon u Novi Sad, sve preporuke!	2026-02-03 18:24:11.752975
9	16	31	5	Odlicno, vrhunska usluga!	2026-02-06 12:43:24.083945
10	16	33	5	Sve preporuke!	2026-02-14 12:17:22.631815
\.


--
-- Data for Name: rezervacije; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.rezervacije (id, korisnik_id, termin_id, created_at) FROM stdin;
\.


--
-- Data for Name: rezervacije_backup; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.rezervacije_backup (id, user_id, company_id, service, slot_time, created_at) FROM stdin;
\.


--
-- Data for Name: service_items; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.service_items (id, service_id, price, duration) FROM stdin;
8	105	0.00	60
9	106	0.00	60
10	107	0.00	60
11	108	0.00	60
12	109	0.00	60
13	110	0.00	60
14	111	0.00	60
15	112	0.00	60
16	113	0.00	60
35	47	0.00	60
36	48	0.00	60
37	49	0.00	60
38	52	0.00	60
39	53	0.00	60
40	55	0.00	60
41	56	0.00	60
42	57	0.00	60
43	60	0.00	60
44	61	0.00	60
45	62	0.00	60
46	64	0.00	60
47	65	0.00	60
48	66	0.00	60
63	101	0.00	60
64	102	0.00	60
65	103	0.00	60
66	104	0.00	60
68	121	0.00	60
69	122	0.00	60
70	123	0.00	60
71	124	0.00	60
72	125	0.00	60
73	126	0.00	60
74	127	0.00	60
75	128	0.00	60
76	129	0.00	60
77	130	0.00	60
78	131	0.00	60
79	132	0.00	60
80	133	0.00	60
81	134	0.00	60
\.


--
-- Data for Name: service_translations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.service_translations (id, service_id, language, name) FROM stdin;
\.


--
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.services (id, company_id, name, price, duration, category_id, temp_id) FROM stdin;
168	8	Sminka	7000.00	60	6	temp-1771289041517
169	2	Feniranje	3200.00	60	2	temp-1771289343508
170	17	Botox	12000.00	60	10	temp-1771503997798
171	17	Fillers 1ml	8000.00	60	10	temp-1771505443061
172	17	Prophilo (1 tretman)	13000.00	60	10	temp-1771505971678
173	17	Prophilo (1 tretman)	13000.00	60	10	temp-1771506015260
174	17	Prophilo (1 tretman)	13000.00	60	10	temp-1771506041293
175	17	Botox (celo lice)	20000.00	60	10	temp-1771506148986
176	17	Fillers 2ml	24000.00	60	8	temp-1771509246415
177	17	Exosomes	10000.00	60	10	temp-1771512922788
178	18	Botox	12000.00	60	10	temp-1771526169988
179	18	Fillers 2ml	16000.00	60	10	temp-1771526239846
105	14	Gelack	3600.00	60	5	\N
106	14	Lakirane	1200.00	60	5	\N
107	14	Izlivanje gel	3800.00	60	5	\N
108	14	Lakiranje	800.00	60	5	\N
109	14	Crni gelack	2300.00	60	5	\N
110	14	Gellack	2600.00	60	5	\N
111	14	Lakiranje	2000.00	60	5	\N
112	14	Lakiranje	2000.00	60	5	\N
113	14	Manikir (gelack)	3000.00	60	5	\N
180	18	Depilacija (noge)	3000.00	60	1	temp-1771526425951
47	12	Depilacija (noge)	2400.00	60	\N	\N
48	12	Masaza (medicinska)	3000.00	60	\N	\N
49	12	HIFU (telo)	8000.00	60	\N	\N
52	12	Depilacija	3000.00	60	\N	\N
53	12	Masaza	3000.00	60	\N	\N
55	13	Sisanje (sredna duzina)	2500.00	60	\N	\N
56	13	Feniranje	3000.00	60	\N	\N
57	13	Pramenovi	4500.00	60	\N	\N
60	14	French Manikir	2800.00	60	\N	\N
61	14	Gel Lack	2500.00	60	\N	\N
62	14	Manikir  (sopstvene nokte)	1200.00	60	\N	\N
64	15	Botox (2 arije)	15000.00	60	\N	\N
65	15	Fillers (3 arije)	250000.00	60	\N	\N
66	15	Prophilo (1 tretman)	25000.00	60	\N	\N
101	14	Manikir (gelack)	3600.00	60	5	\N
102	14	French manikir	3600.00	60	5	\N
103	14	Gelack	3800.00	60	5	\N
104	14	Sopstvene nokte	3200.00	60	5	\N
121	14	French manikir	3000.00	60	5	\N
122	14	Gelack	3600.00	60	5	\N
123	16	Frizura	3600.00	60	3	\N
124	16	Sminka	4000.00	60	7	\N
125	16	Lash lift	5000.00	60	6	\N
126	16	Sisanje (sredna duzina)	2800.00	60	3	\N
127	16	Sminka	3800.00	60	7	\N
128	16	Lash lift	4000.00	60	6	\N
129	15	Botox (celo lice)	16000.00	60	11	\N
130	15	Fillers 2ml	24000.00	60	11	\N
131	15	Botox ( 2 arije)	13000.00	60	11	\N
132	15	Prophilo (1 tretman)	12000.00	60	11	\N
133	15	Prophilo (2tretmana)	22000.00	60	11	\N
134	14	French (izlivanje)	3000.00	60	9	\N
137	16	Lash lift	3000.00	60	6	\N
138	12	Masaza	3500.00	60	4	\N
139	12	HIFU (lice)	6000.00	60	11	\N
140	12	Depilacija (noge)	3800.00	60	1	\N
141	12	Pedikir (medicinski)	3600.00	60	10	\N
142	12	French (izlivanje)	4000.00	60	5	\N
143	13	Balayage	4000.00	60	3	\N
144	13	Sisanje (kratka kosa)	2000.00	60	3	\N
145	13	Pramenove	12000.00	60	3	\N
146	15	Prophilo (1 tretman)	12000.00	60	11	\N
156	2	Feniranje	3200.00	60	2	\N
157	2	Feniranje	2500.00	60	8	\N
158	2	Pramenove	8000.00	60	2	\N
159	2	Sisanje (sredna duzina)	2300.00	60	2	\N
160	2	Balayage	6000.00	60	2	\N
161	2	Sisanje (sredna duzina)	3000.00	60	2	\N
162	2	Pedikir	2800.00	60	9	\N
163	2	Balayage	6000.00	60	2	\N
165	8	Sisanje (sredna duzina)	400.00	60	2	temp-1771287913280
166	8	Balayage	6000.00	60	2	temp-1771288612948
167	8	Manikir (gelack)	3000.00	60	4	temp-1771288668444
\.


--
-- Data for Name: slots; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.slots (id, company_id, provider_id, start_time, end_time, service_id, is_booked) FROM stdin;
151	14	\N	2026-03-29 08:54:00	2026-03-29 09:54:00	113	f
153	14	\N	2026-04-01 11:55:00	2026-04-01 12:55:00	122	f
158	12	\N	2026-03-17 15:01:00	2026-03-17 16:01:00	142	f
159	12	\N	2026-03-18 16:01:00	2026-03-18 17:01:00	141	f
160	12	\N	2026-03-22 13:01:00	2026-03-22 14:02:00	140	f
161	12	\N	2026-03-23 13:02:00	2026-03-23 14:02:00	139	f
162	12	\N	2026-03-25 13:02:00	2026-03-25 14:02:00	138	f
163	12	\N	2026-04-23 15:02:00	2026-05-23 16:02:00	52	f
164	12	\N	2026-04-24 14:03:00	2026-04-24 15:03:00	52	f
170	15	\N	2026-03-25 16:10:00	2026-03-25 17:10:00	146	f
228	18	\N	2026-03-27 13:37:00	2026-03-27 14:37:00	179	f
171	15	\N	2026-03-28 14:11:00	2026-03-28 15:11:00	131	f
230	18	\N	2026-03-31 12:40:00	2026-03-31 13:40:00	180	f
172	15	\N	2026-03-17 13:11:00	2026-03-17 14:11:00	130	f
173	15	\N	2026-03-30 14:11:00	2026-03-30 15:11:00	129	f
174	15	\N	2026-04-09 15:12:00	2026-04-09 16:12:00	130	f
175	15	\N	2026-04-17 16:12:00	2026-04-17 17:12:00	146	f
210	8	\N	2026-03-30 04:37:00	2026-03-30 05:38:00	167	f
211	8	\N	2026-05-21 04:38:00	2026-05-21 05:38:00	166	f
213	8	\N	2026-03-13 10:45:00	2026-03-13 13:46:00	166	f
152	14	\N	2026-03-30 14:54:00	2026-03-30 15:54:00	121	f
150	14	\N	2026-03-26 14:54:00	2026-03-26 15:54:00	112	f
103	14	\N	2026-03-08 04:15:00	2026-03-08 05:15:00	134	f
105	14	\N	2026-03-08 04:36:00	2026-03-08 05:36:00	134	f
97	14	\N	2026-03-08 04:39:00	2026-03-08 05:39:00	134	f
70	13	\N	2026-01-30 15:14:00	2026-01-30 16:14:00	57	f
111	14	\N	2026-03-08 04:44:00	2026-03-08 05:45:00	134	f
106	14	\N	2026-03-08 05:26:00	2026-03-08 06:26:00	134	f
104	14	\N	2026-03-08 05:30:00	2026-03-08 06:30:00	134	f
107	14	\N	2026-03-08 05:32:00	2026-03-08 06:32:00	134	f
109	14	\N	2026-03-08 05:41:00	2026-03-08 06:41:00	134	f
133	16	\N	2026-03-15 07:47:00	2026-03-15 08:47:00	128	f
110	14	\N	2026-03-08 05:42:00	2026-03-08 06:42:00	134	f
112	14	\N	2026-03-08 06:56:00	2026-03-08 07:56:00	134	f
140	14	\N	2026-03-27 12:18:00	2026-03-27 13:18:00	134	f
67	12	\N	2026-01-29 15:13:00	2026-01-29 16:13:00	53	t
69	13	\N	2026-01-29 10:13:00	2026-01-29 11:13:00	57	f
229	18	\N	2026-03-30 05:37:00	2026-03-30 06:38:00	178	f
154	16	\N	2026-03-27 14:56:00	2026-03-27 15:56:00	123	f
68	12	\N	2026-01-30 16:13:00	2026-01-30 17:14:00	53	t
132	16	\N	2026-03-08 07:46:00	2026-03-08 08:46:00	128	f
135	16	\N	2026-03-22 14:01:00	2026-03-22 15:01:00	128	f
129	16	\N	2026-05-20 17:39:00	2026-05-20 18:39:00	128	f
74	14	\N	2026-02-02 00:07:00	2026-02-02 01:07:00	134	f
102	14	\N	2026-03-05 04:10:00	2026-03-05 05:10:00	134	f
108	14	\N	2026-03-06 05:41:00	2026-03-06 06:41:00	134	f
116	14	\N	2026-03-06 06:15:00	2026-03-06 07:15:00	134	t
130	16	\N	2026-03-06 06:45:00	2026-03-06 07:45:00	128	f
75	15	\N	2026-02-03 21:21:00	2026-02-03 22:21:00	133	f
76	15	\N	2026-02-05 05:22:00	2026-02-05 06:22:00	133	f
77	15	\N	2026-02-07 04:22:00	2026-02-07 05:22:00	133	f
137	15	\N	2026-03-28 07:12:00	2026-03-28 08:12:00	133	f
138	15	\N	2026-03-27 09:15:00	2026-03-27 10:15:00	133	f
139	15	\N	2026-03-30 10:15:00	2026-03-30 11:15:00	133	f
96	14	\N	2026-03-07 04:35:00	2026-03-07 05:35:00	134	f
114	14	\N	2026-03-07 05:01:00	2026-03-07 06:01:00	134	f
113	14	\N	2026-03-07 05:56:00	2026-03-07 07:56:00	134	f
93	14	\N	2026-03-08 01:07:00	2026-03-08 02:07:00	134	f
95	14	\N	2026-03-08 03:34:00	2026-03-08 04:34:00	134	f
131	16	\N	2026-03-07 08:46:00	2026-03-07 09:46:00	128	f
71	13	\N	2026-01-31 17:14:00	2026-01-31 18:14:00	57	f
98	14	\N	2026-03-08 03:40:00	2026-03-08 04:40:00	134	f
99	14	\N	2026-03-08 03:51:00	2026-03-08 04:51:00	134	f
100	14	\N	2026-03-08 03:59:00	2026-03-08 04:59:00	134	f
165	13	\N	2026-03-24 15:07:00	2026-03-24 16:08:00	55	f
166	13	\N	2026-03-27 16:08:00	2026-03-27 17:08:00	56	f
134	16	\N	2026-03-07 13:58:00	2026-03-07 14:58:00	128	f
167	13	\N	2026-03-30 16:08:00	2026-03-30 17:08:00	143	f
168	13	\N	2026-03-28 12:08:00	2026-03-28 13:08:00	144	f
169	13	\N	2026-03-26 13:09:00	2026-03-26 14:09:00	145	f
155	16	\N	2026-03-31 14:56:00	2026-03-31 15:56:00	126	f
212	8	\N	2026-03-25 13:44:00	2026-03-25 14:44:00	168	f
209	8	\N	2026-03-27 09:37:00	2026-03-27 10:37:00	166	f
157	16	\N	2026-04-16 11:57:00	2026-04-16 12:57:00	137	f
136	15	\N	2026-03-20 04:11:00	2026-03-20 05:11:00	133	f
156	16	\N	2026-04-16 15:56:00	2026-04-16 16:57:00	127	t
215	2	\N	2026-03-28 04:58:00	2026-03-28 06:58:00	158	f
219	2	\N	2026-03-15 07:00:00	2026-03-15 08:00:00	162	f
218	2	\N	2026-03-12 05:00:00	2026-03-12 06:00:00	160	f
220	2	\N	2026-03-14 05:00:00	2026-03-14 06:01:00	158	f
232	2	\N	2026-03-21 14:51:00	2026-03-21 16:51:00	160	f
222	17	\N	2026-03-18 23:58:00	2026-03-19 00:59:00	171	f
221	17	\N	2026-03-26 00:50:00	2026-03-26 01:50:00	170	f
227	17	\N	2026-03-28 14:55:00	2026-03-28 15:55:00	177	f
217	2	\N	2026-03-29 05:59:00	2026-03-29 06:59:00	160	f
224	17	\N	2026-04-01 04:02:00	2026-05-01 05:03:00	174	f
226	17	\N	2026-04-03 06:54:00	2026-04-03 07:54:00	176	f
225	17	\N	2026-04-04 02:03:00	2026-04-04 03:03:00	175	f
208	8	\N	2026-03-30 00:25:00	2026-03-30 01:25:00	165	t
223	17	\N	2026-03-29 20:01:00	2026-03-29 21:01:00	172	t
231	18	\N	2026-04-04 13:40:00	2026-04-04 14:41:00	180	t
214	2	\N	2026-03-27 00:57:00	2026-03-27 01:58:00	169	f
216	2	\N	2026-04-03 00:59:00	2026-04-03 01:59:00	159	f
\.


--
-- Data for Name: slots_backup; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.slots_backup (id, company_id, provider_id, start_time, end_time) FROM stdin;
\.


--
-- Data for Name: termini; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.termini (id, company_id, provider_id, slot_id, booked_by, service, status, created_at) FROM stdin;
\.


--
-- Data for Name: termini_backup; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.termini_backup (id, company_id, provider_id, slot_id, booked_by, service, status, created_at) FROM stdin;
\.


--
-- Data for Name: translations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.translations (id, table_name, column_name, row_id, lang_code, value) FROM stdin;
1521	services	name	153	sr	Maderoterapija
1522	services	name	153	en	Maderotherapy
1523	services	name	153	sv	Maderoterapi
1524	service_items	name	87	sr	Standard
1525	service_items	name	87	en	Standard
1526	service_items	name	87	sv	Standard
1530	service_items	name	88	sr	Premium
1531	service_items	name	88	en	Premium
1532	service_items	name	88	sv	Premium
2	services	name	1	en	Leg waxing
1	services	name	1	sr	Depilacija noge
3	services	name	1	sv	Benvaxning
5	services	name	135	en	Maderotherapy
4	services	name	135	sr	Maderoterapija
6	services	name	135	sv	Maderoterapi
1539	categories	name	3	sr	Masaža
1542	categories	name	4	sr	Manikir
1545	categories	name	5	sr	Trepavice & Obrve
1548	categories	name	6	sr	Lepota
1551	categories	name	7	sr	Zdravlje
1554	categories	name	8	sr	Last Minute
1557	categories	name	9	sr	Pedikir
1560	categories	name	10	sr	Tretman Lice&Telo
1761	companies	name	2	24	V
1536	categories	name	1	sr	Depilacija
1540	categories	name	3	en	Massage
1543	categories	name	4	en	Manicure
1546	categories	name	5	en	Lashes & Brows
1549	categories	name	6	en	Beauty
1552	categories	name	7	en	Health
1555	categories	name	8	en	Last Minute
1558	categories	name	9	en	Pedicure
1561	categories	name	10	en	Face & Body Treatment
1762	companies	name	2	25	I
1537	categories	name	1	en	Waxing
1541	categories	name	3	sv	Massage
1544	categories	name	4	sv	Manikyr
1547	categories	name	5	sv	Ögonfransar & Ögonbryn
1550	categories	name	6	sv	Skönhet
1553	categories	name	7	sv	Hälsa
1556	categories	name	8	sv	Sista minuten
1559	categories	name	9	sv	Pedikyr
1562	categories	name	10	sv	Ansikte & Kropp behandling
1763	companies	name	2	26	P
1538	categories	name	1	sv	Vaxning
1764	companies	name	2	en	Frizerski Salon Elegant VIP
1765	companies	description	2	0 	N
1766	companies	description	2	1 	a
1767	companies	description	2	2 	j
1737	companies	name	2	0 	F
1738	companies	name	2	1 	r
1739	companies	name	2	2 	i
1740	companies	name	2	3 	z
1741	companies	name	2	4 	e
1742	companies	name	2	5 	r
1743	companies	name	2	6 	s
1744	companies	name	2	7 	k
1745	companies	name	2	8 	i
1768	companies	description	2	3 	b
1769	companies	description	2	4 	o
1770	companies	description	2	5 	l
1771	companies	description	2	6 	j
1772	companies	description	2	7 	i
1773	companies	description	2	8 	 
1774	companies	description	2	9 	f
1775	companies	description	2	10	r
1563	categories	name	11	sr	Ostale usluge
1564	categories	name	11	en	Other services
1565	categories	name	11	sv	Andra tjänster
1746	companies	name	2	9 	 
1747	companies	name	2	10	S
1748	companies	name	2	11	a
1749	companies	name	2	12	l
1750	companies	name	2	13	o
1751	companies	name	2	14	n
1752	companies	name	2	15	 
1753	companies	name	2	16	E
1754	companies	name	2	17	l
1755	companies	name	2	18	e
1756	companies	name	2	19	g
1757	companies	name	2	20	a
1758	companies	name	2	21	n
1759	companies	name	2	22	t
1760	companies	name	2	23	 
1797	companies	description	2	32	 
1798	companies	description	2	33	s
1799	companies	description	2	34	a
1800	companies	description	2	35	 
1801	companies	description	2	36	n
1802	companies	description	2	37	o
1803	companies	description	2	38	v
1804	companies	description	2	39	i
1805	companies	description	2	40	m
1806	companies	description	2	41	 
1776	companies	description	2	11	i
1777	companies	description	2	12	z
1778	companies	description	2	13	e
1779	companies	description	2	14	r
1780	companies	description	2	15	s
1781	companies	description	2	16	k
1782	companies	description	2	17	i
1783	companies	description	2	18	 
1784	companies	description	2	19	s
1785	companies	description	2	20	a
1786	companies	description	2	21	l
1787	companies	description	2	22	o
1788	companies	description	2	23	n
1789	companies	description	2	24	 
1790	companies	description	2	25	u
1791	companies	description	2	26	 
1792	companies	description	2	27	g
1793	companies	description	2	28	r
1794	companies	description	2	29	a
1795	companies	description	2	30	d
1796	companies	description	2	31	u
1807	companies	description	2	42	p
1808	companies	description	2	43	a
1809	companies	description	2	44	k
1810	companies	description	2	45	e
1811	companies	description	2	46	t
1812	companies	description	2	47	o
1813	companies	description	2	48	m
1814	companies	description	2	49	 
1815	companies	description	2	50	u
1816	companies	description	2	51	s
1817	companies	description	2	52	l
1818	companies	description	2	53	u
1819	companies	description	2	54	g
1820	companies	description	2	55	a
1821	companies	description	2	56	!
1822	companies	description	2	en	Najbolji frizerski salon u gradu sa novim paketom usluga!
1709	categories	name	2	sr	Frizeri
1721	categories	name	2	en	Hairdressers
1733	categories	name	2	sv	Frisörer
1278	service_items	name	2	sr	Standard
1279	service_items	name	2	en	Standard
1280	service_items	name	2	sv	Standard
1281	service_items	name	3	sr	Premium
1282	service_items	name	3	en	Premium
1283	service_items	name	3	sv	Premium
1284	service_items	name	8	sr	Standard
1285	service_items	name	8	en	Standard
1286	service_items	name	8	sv	Standard
1287	service_items	name	9	sr	Standard
1288	service_items	name	9	en	Standard
1289	service_items	name	9	sv	Standard
1290	service_items	name	10	sr	Standard
1291	service_items	name	10	en	Standard
1292	service_items	name	10	sv	Standard
1293	service_items	name	11	sr	Standard
1294	service_items	name	11	en	Standard
1295	service_items	name	11	sv	Standard
1296	service_items	name	12	sr	Standard
1297	service_items	name	12	en	Standard
1298	service_items	name	12	sv	Standard
1299	service_items	name	13	sr	Standard
1300	service_items	name	13	en	Standard
1301	service_items	name	13	sv	Standard
1302	service_items	name	14	sr	Standard
1303	service_items	name	14	en	Standard
1304	service_items	name	14	sv	Standard
1305	service_items	name	15	sr	Standard
1306	service_items	name	15	en	Standard
1307	service_items	name	15	sv	Standard
1308	service_items	name	16	sr	Standard
1309	service_items	name	16	en	Standard
1310	service_items	name	16	sv	Standard
1311	service_items	name	17	sr	Standard
1312	service_items	name	17	en	Standard
1313	service_items	name	17	sv	Standard
1314	service_items	name	18	sr	Standard
1315	service_items	name	18	en	Standard
1316	service_items	name	18	sv	Standard
1317	service_items	name	19	sr	Standard
1318	service_items	name	19	en	Standard
1319	service_items	name	19	sv	Standard
1320	service_items	name	20	sr	Standard
1321	service_items	name	20	en	Standard
1322	service_items	name	20	sv	Standard
1323	service_items	name	21	sr	Standard
1324	service_items	name	21	en	Standard
1325	service_items	name	21	sv	Standard
1326	service_items	name	22	sr	Standard
1327	service_items	name	22	en	Standard
1328	service_items	name	22	sv	Standard
1329	service_items	name	23	sr	Standard
1330	service_items	name	23	en	Standard
1331	service_items	name	23	sv	Standard
1332	service_items	name	24	sr	Standard
1333	service_items	name	24	en	Standard
1334	service_items	name	24	sv	Standard
1335	service_items	name	25	sr	Standard
1336	service_items	name	25	en	Standard
1337	service_items	name	25	sv	Standard
1338	service_items	name	26	sr	Standard
1339	service_items	name	26	en	Standard
1340	service_items	name	26	sv	Standard
1341	service_items	name	27	sr	Standard
1342	service_items	name	27	en	Standard
1343	service_items	name	27	sv	Standard
1344	service_items	name	28	sr	Standard
1345	service_items	name	28	en	Standard
1346	service_items	name	28	sv	Standard
1347	service_items	name	29	sr	Standard
1348	service_items	name	29	en	Standard
1349	service_items	name	29	sv	Standard
1350	service_items	name	30	sr	Standard
1351	service_items	name	30	en	Standard
1352	service_items	name	30	sv	Standard
1353	service_items	name	31	sr	Standard
1354	service_items	name	31	en	Standard
1355	service_items	name	31	sv	Standard
1356	service_items	name	32	sr	Standard
1357	service_items	name	32	en	Standard
1358	service_items	name	32	sv	Standard
1359	service_items	name	33	sr	Standard
1360	service_items	name	33	en	Standard
1361	service_items	name	33	sv	Standard
1362	service_items	name	34	sr	Standard
1363	service_items	name	34	en	Standard
1364	service_items	name	34	sv	Standard
1365	service_items	name	35	sr	Standard
1366	service_items	name	35	en	Standard
1367	service_items	name	35	sv	Standard
1368	service_items	name	36	sr	Standard
1369	service_items	name	36	en	Standard
1370	service_items	name	36	sv	Standard
1371	service_items	name	37	sr	Standard
1372	service_items	name	37	en	Standard
1373	service_items	name	37	sv	Standard
1374	service_items	name	38	sr	Standard
1375	service_items	name	38	en	Standard
1376	service_items	name	38	sv	Standard
1377	service_items	name	39	sr	Standard
1378	service_items	name	39	en	Standard
1379	service_items	name	39	sv	Standard
1380	service_items	name	40	sr	Standard
1381	service_items	name	40	en	Standard
1382	service_items	name	40	sv	Standard
1383	service_items	name	41	sr	Standard
1384	service_items	name	41	en	Standard
1385	service_items	name	41	sv	Standard
1386	service_items	name	42	sr	Standard
1387	service_items	name	42	en	Standard
1388	service_items	name	42	sv	Standard
1389	service_items	name	43	sr	Standard
1390	service_items	name	43	en	Standard
1391	service_items	name	43	sv	Standard
1392	service_items	name	44	sr	Standard
1393	service_items	name	44	en	Standard
1394	service_items	name	44	sv	Standard
1395	service_items	name	45	sr	Standard
1396	service_items	name	45	en	Standard
1397	service_items	name	45	sv	Standard
1398	service_items	name	46	sr	Standard
1399	service_items	name	46	en	Standard
1400	service_items	name	46	sv	Standard
1401	service_items	name	47	sr	Standard
1402	service_items	name	47	en	Standard
1403	service_items	name	47	sv	Standard
1404	service_items	name	48	sr	Standard
1405	service_items	name	48	en	Standard
1406	service_items	name	48	sv	Standard
1407	service_items	name	49	sr	Standard
1408	service_items	name	49	en	Standard
1409	service_items	name	49	sv	Standard
1410	service_items	name	50	sr	Standard
1411	service_items	name	50	en	Standard
1412	service_items	name	50	sv	Standard
1413	service_items	name	51	sr	Standard
1414	service_items	name	51	en	Standard
1415	service_items	name	51	sv	Standard
1416	service_items	name	52	sr	Standard
1417	service_items	name	52	en	Standard
1418	service_items	name	52	sv	Standard
1419	service_items	name	53	sr	Standard
1420	service_items	name	53	en	Standard
1421	service_items	name	53	sv	Standard
1422	service_items	name	54	sr	Standard
1423	service_items	name	54	en	Standard
1424	service_items	name	54	sv	Standard
1425	service_items	name	55	sr	Standard
1426	service_items	name	55	en	Standard
1427	service_items	name	55	sv	Standard
1428	service_items	name	56	sr	Standard
1429	service_items	name	56	en	Standard
1430	service_items	name	56	sv	Standard
1431	service_items	name	57	sr	Standard
1432	service_items	name	57	en	Standard
1433	service_items	name	57	sv	Standard
1434	service_items	name	58	sr	Standard
1435	service_items	name	58	en	Standard
1436	service_items	name	58	sv	Standard
1437	service_items	name	59	sr	Standard
1438	service_items	name	59	en	Standard
1439	service_items	name	59	sv	Standard
1440	service_items	name	60	sr	Standard
1441	service_items	name	60	en	Standard
1442	service_items	name	60	sv	Standard
1443	service_items	name	61	sr	Standard
1444	service_items	name	61	en	Standard
1445	service_items	name	61	sv	Standard
1446	service_items	name	62	sr	Standard
1447	service_items	name	62	en	Standard
1448	service_items	name	62	sv	Standard
1449	service_items	name	63	sr	Standard
1450	service_items	name	63	en	Standard
1451	service_items	name	63	sv	Standard
1452	service_items	name	64	sr	Standard
1453	service_items	name	64	en	Standard
1454	service_items	name	64	sv	Standard
1455	service_items	name	65	sr	Standard
1456	service_items	name	65	en	Standard
1457	service_items	name	65	sv	Standard
1458	service_items	name	66	sr	Standard
1459	service_items	name	66	en	Standard
1460	service_items	name	66	sv	Standard
1461	service_items	name	67	sr	Standard
1462	service_items	name	67	en	Standard
1463	service_items	name	67	sv	Standard
1464	service_items	name	68	sr	Standard
1465	service_items	name	68	en	Standard
1466	service_items	name	68	sv	Standard
1467	service_items	name	69	sr	Standard
1468	service_items	name	69	en	Standard
1469	service_items	name	69	sv	Standard
1470	service_items	name	70	sr	Standard
1471	service_items	name	70	en	Standard
1472	service_items	name	70	sv	Standard
1473	service_items	name	71	sr	Standard
1474	service_items	name	71	en	Standard
1475	service_items	name	71	sv	Standard
1476	service_items	name	72	sr	Standard
1477	service_items	name	72	en	Standard
1478	service_items	name	72	sv	Standard
1479	service_items	name	73	sr	Standard
1480	service_items	name	73	en	Standard
1481	service_items	name	73	sv	Standard
1482	service_items	name	74	sr	Standard
1483	service_items	name	74	en	Standard
1484	service_items	name	74	sv	Standard
1485	service_items	name	75	sr	Standard
1486	service_items	name	75	en	Standard
1487	service_items	name	75	sv	Standard
1488	service_items	name	76	sr	Standard
1489	service_items	name	76	en	Standard
1490	service_items	name	76	sv	Standard
1491	service_items	name	77	sr	Standard
1492	service_items	name	77	en	Standard
1493	service_items	name	77	sv	Standard
1494	service_items	name	78	sr	Standard
1495	service_items	name	78	en	Standard
1496	service_items	name	78	sv	Standard
1497	service_items	name	79	sr	Standard
1498	service_items	name	79	en	Standard
1499	service_items	name	79	sv	Standard
1500	service_items	name	80	sr	Standard
1501	service_items	name	80	en	Standard
1502	service_items	name	80	sv	Standard
1503	service_items	name	81	sr	Standard
1504	service_items	name	81	en	Standard
1505	service_items	name	81	sv	Standard
1506	service_items	name	82	sr	Standard
1507	service_items	name	82	en	Standard
1508	service_items	name	82	sv	Standard
1509	service_items	name	83	sr	Standard
1510	service_items	name	83	en	Standard
1511	service_items	name	83	sv	Standard
1512	service_items	name	84	sr	Standard
1513	service_items	name	84	en	Standard
1514	service_items	name	84	sv	Standard
1515	service_items	name	85	sr	Standard
1516	service_items	name	85	en	Standard
1517	service_items	name	85	sv	Standard
1518	service_items	name	86	sr	Standard
1519	service_items	name	86	en	Standard
1520	service_items	name	86	sv	Standard
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, name, email, password, role, created_at, updated_at, city, phone, reset_token, reset_token_expires, avatar) FROM stdin;
8	Studio Malena	Vladozgr79@hotmail.com	$2b$10$zsUvfdlqW/wbh/4.4b7LXeH0Elf7UvseR6PENLYVkPqOnYGPcayXG	company	2026-01-24 14:29:02.966754	2026-01-24 14:51:06.992688	\N	\N	\N	\N	\N
2	Frizerski Salon Elegant VIP	tanjapreo@hotmail.com	$2b$10$myvyZ48h/P8PtAOVLnXC/O.3jRaRZPy3V5LkH5O31RLgcdZaAhbyK	company	2026-01-24 14:29:02.966754	2026-01-24 14:50:47.713716	\N	\N	6211466fbde1c294b705b4afe0e33cbcc50d2e8e6ddb0e3af8af10baaec2316e	2026-01-24 22:57:03.133	\N
30	Studio Belo	tanjapreo@gmail.com	$2b$10$dvO6kQ5yt51Exrqx7eSgPe0rsdclyPRghDf2UbMxmwM0zbynIvjqq	company	2026-01-24 22:44:03.313255	2026-01-24 22:44:03.313255	\N	\N	\N	\N	\N
32	Salon Beauty	tanja@hotmail.com	$2b$10$OI/EfIuj/H9v/x.dIRq8W..27EABFkbokiNgRIMD5ju7FhiEX5tp6	company	2026-01-25 20:55:08.55687	2026-01-25 20:55:08.55687	\N	\N	\N	\N	\N
34	Kozmeticki Salon Nails	pancevo@hotmail.com	$2b$10$Y1/Hb9AmeuTs2e1tGEpKfeysrhLdU9LR6cDQ92mDDfbEM9yFUI2Fe	company	2026-01-28 00:04:03.003141	2026-01-28 00:04:03.003141	\N	\N	\N	\N	\N
35	Salon luxury Treatments	treatment@hotmail.com	$2b$10$QYwONvu2iZle/Z4JNiWiH.E/DveFCcb0u9RdeseeKA9qHc3JzWbDC	company	2026-01-28 00:19:08.426877	2026-01-28 00:19:08.426877	\N	\N	\N	\N	\N
31	Tanya Cvetanovska	vlado@hotmail.com	$2b$10$JInK0zz4tNEDrga3TNKcyOasfdBUTw/q7QoysUAcS8JDWA7yjYeXO	user	2026-01-25 12:01:43.641231	2026-01-25 12:01:43.641231	\N	0763912026	\N	\N	avatar_31_1770236563161.jpg
36	Studio NK	nk@hotmail.com	$2b$10$z/rsrWR2QiLX10uQBCVkyOWLS.zAfMldgGErYuj2Nbax1lB7iWzoC	company	2026-02-06 11:05:14.139903	2026-02-06 11:05:14.139903	\N	\N	\N	\N	\N
33	Tanya Cvetanovska	malena@hotmail.com	$2b$10$6RZO8RozA9yehyKM/QpNM.j5fPhE05qw.2llmrZLRjaq7ql/0QkqC	user	2026-01-26 14:58:16.745079	2026-01-26 14:58:16.745079	\N	0763912026	\N	\N	avatar_33_1771067077465.jpg
37	Studio Aestetic	tanya@hotmail.com	$2b$10$P7pL9M5Hora3r1tObRoA2.XZx2xkJxBgGTYYAGYhWYoUO.ojIhHX6	company	2026-02-19 11:19:48.7798	2026-02-19 11:19:48.7798	\N	\N	\N	\N	\N
38	Salon Zemun	vlaj@hotmail.com	$2b$10$FMbM4a/spidsLnkZWqHhwevMImF2Y2RL4C/awHtqeSLYTO69GaADO	company	2026-02-19 17:46:00.84452	2026-02-19 17:46:00.84452	\N	\N	\N	\N	\N
\.


--
-- Name: bookings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.bookings_id_seq', 116, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.categories_id_seq', 12, true);


--
-- Name: category_translations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.category_translations_id_seq', 2, true);


--
-- Name: companies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.companies_id_seq', 18, true);


--
-- Name: company_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.company_images_id_seq', 166, true);


--
-- Name: company_services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.company_services_id_seq', 1, false);


--
-- Name: company_translations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.company_translations_id_seq', 2, true);


--
-- Name: providers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.providers_id_seq', 1, false);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.reviews_id_seq', 10, true);


--
-- Name: rezervacije_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.rezervacije_id_seq', 1, false);


--
-- Name: service_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.service_items_id_seq', 88, true);


--
-- Name: service_translations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.service_translations_id_seq', 2, true);


--
-- Name: services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.services_id_seq', 180, true);


--
-- Name: slots_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.slots_id_seq', 232, true);


--
-- Name: termini_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.termini_id_seq', 1, false);


--
-- Name: translations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.translations_id_seq', 2166, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.users_id_seq', 38, true);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: categories_backup categories_backup_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.categories_backup
    ADD CONSTRAINT categories_backup_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: category_translations category_translations_category_id_language_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.category_translations
    ADD CONSTRAINT category_translations_category_id_language_key UNIQUE (category_id, language);


--
-- Name: category_translations category_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.category_translations
    ADD CONSTRAINT category_translations_pkey PRIMARY KEY (id);


--
-- Name: companies_backup companies_backup_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.companies_backup
    ADD CONSTRAINT companies_backup_pkey PRIMARY KEY (id);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: company_categories company_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.company_categories
    ADD CONSTRAINT company_categories_pkey PRIMARY KEY (company_id, category_id);


--
-- Name: company_images company_images_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.company_images
    ADD CONSTRAINT company_images_pkey PRIMARY KEY (id);


--
-- Name: company_services company_services_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.company_services
    ADD CONSTRAINT company_services_pkey PRIMARY KEY (id);


--
-- Name: company_translations company_translations_company_id_language_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.company_translations
    ADD CONSTRAINT company_translations_company_id_language_key UNIQUE (company_id, language);


--
-- Name: company_translations company_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.company_translations
    ADD CONSTRAINT company_translations_pkey PRIMARY KEY (id);


--
-- Name: korisnici_backup korisnici_backup_email_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.korisnici_backup
    ADD CONSTRAINT korisnici_backup_email_key UNIQUE (email);


--
-- Name: korisnici_backup korisnici_backup_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.korisnici_backup
    ADD CONSTRAINT korisnici_backup_pkey PRIMARY KEY (id);


--
-- Name: companies one_company_per_user; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT one_company_per_user UNIQUE (user_id);


--
-- Name: providers_backup providers_backup_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.providers_backup
    ADD CONSTRAINT providers_backup_pkey PRIMARY KEY (id);


--
-- Name: providers providers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.providers
    ADD CONSTRAINT providers_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: rezervacije_backup rezervacije_backup_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.rezervacije_backup
    ADD CONSTRAINT rezervacije_backup_pkey PRIMARY KEY (id);


--
-- Name: rezervacije rezervacije_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.rezervacije
    ADD CONSTRAINT rezervacije_pkey PRIMARY KEY (id);


--
-- Name: service_items service_items_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.service_items
    ADD CONSTRAINT service_items_pkey PRIMARY KEY (id);


--
-- Name: service_translations service_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.service_translations
    ADD CONSTRAINT service_translations_pkey PRIMARY KEY (id);


--
-- Name: service_translations service_translations_service_id_language_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.service_translations
    ADD CONSTRAINT service_translations_service_id_language_key UNIQUE (service_id, language);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: slots_backup slots_backup_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.slots_backup
    ADD CONSTRAINT slots_backup_pkey PRIMARY KEY (id);


--
-- Name: slots slots_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.slots
    ADD CONSTRAINT slots_pkey PRIMARY KEY (id);


--
-- Name: termini_backup termini_backup_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.termini_backup
    ADD CONSTRAINT termini_backup_pkey PRIMARY KEY (id);


--
-- Name: termini termini_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.termini
    ADD CONSTRAINT termini_pkey PRIMARY KEY (id);


--
-- Name: translations translations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.translations
    ADD CONSTRAINT translations_pkey PRIMARY KEY (id);


--
-- Name: translations translations_table_name_column_name_row_id_lang_code_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.translations
    ADD CONSTRAINT translations_table_name_column_name_row_id_lang_code_key UNIQUE (table_name, column_name, row_id, lang_code);


--
-- Name: company_categories unique_company_category; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.company_categories
    ADD CONSTRAINT unique_company_category UNIQUE (company_id, category_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_bookings_slot_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_bookings_slot_id ON public.bookings USING btree (slot_id);


--
-- Name: idx_services_company_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_services_company_id ON public.services USING btree (company_id);


--
-- Name: idx_slots_company_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_slots_company_id ON public.slots USING btree (company_id);


--
-- Name: idx_slots_service_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_slots_service_id ON public.slots USING btree (service_id);


--
-- Name: one_booking_per_slot; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX one_booking_per_slot ON public.bookings USING btree (slot_id);


--
-- Name: companies_with_ratings _RETURN; Type: RULE; Schema: public; Owner: neondb_owner
--

CREATE OR REPLACE VIEW public.companies_with_ratings AS
 SELECT c.id,
    c.name,
    c.city,
    c.phone,
    c.email,
    c.description,
    c.user_id,
    c.created_at,
    c.updated_at,
    c.services,
    c.slots,
    c.images,
    c.category_id,
    COALESCE(avg(r.rating), (0)::numeric) AS avg_rating,
    count(r.id) AS review_count
   FROM (public.companies c
     LEFT JOIN public.reviews r ON ((r.company_id = c.id)))
  GROUP BY c.id;


--
-- Name: service_items service_items_translations_trigger; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER service_items_translations_trigger AFTER INSERT ON public.service_items FOR EACH ROW EXECUTE FUNCTION public.insert_service_item_translations();


--
-- Name: services trg_add_company_category; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER trg_add_company_category AFTER INSERT ON public.services FOR EACH ROW EXECUTE FUNCTION public.add_company_category_on_service_insert();


--
-- Name: service_items trg_add_service_item_translations; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER trg_add_service_item_translations AFTER INSERT ON public.service_items FOR EACH ROW EXECUTE FUNCTION public.add_service_item_translations();


--
-- Name: services trigger_add_company_from_service; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER trigger_add_company_from_service AFTER INSERT ON public.services FOR EACH ROW EXECUTE FUNCTION public.add_company_to_category_from_service();


--
-- Name: companies update_company_updated_at; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER update_company_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: bookings bookings_slot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_slot_id_fkey FOREIGN KEY (slot_id) REFERENCES public.slots(id) ON DELETE CASCADE;


--
-- Name: bookings bookings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: category_translations category_translations_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.category_translations
    ADD CONSTRAINT category_translations_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: companies companies_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: companies companies_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: company_categories company_categories_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.company_categories
    ADD CONSTRAINT company_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: company_categories company_categories_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.company_categories
    ADD CONSTRAINT company_categories_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: company_images company_images_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.company_images
    ADD CONSTRAINT company_images_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: company_services company_services_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.company_services
    ADD CONSTRAINT company_services_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: company_services company_services_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.company_services
    ADD CONSTRAINT company_services_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: company_translations company_translations_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.company_translations
    ADD CONSTRAINT company_translations_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: bookings fk_bookings_slot; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT fk_bookings_slot FOREIGN KEY (slot_id) REFERENCES public.slots(id);


--
-- Name: bookings fk_bookings_user; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: bookings fk_company; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT fk_company FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: services fk_services_company; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT fk_services_company FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: slots fk_slots_company; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.slots
    ADD CONSTRAINT fk_slots_company FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: slots fk_slots_service; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.slots
    ADD CONSTRAINT fk_slots_service FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: providers providers_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.providers
    ADD CONSTRAINT providers_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: service_items service_items_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.service_items
    ADD CONSTRAINT service_items_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: service_translations service_translations_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.service_translations
    ADD CONSTRAINT service_translations_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: services services_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: slots slots_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.slots
    ADD CONSTRAINT slots_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.providers(id) ON DELETE CASCADE;


--
-- Name: termini termini_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.termini
    ADD CONSTRAINT termini_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.providers(id) ON DELETE CASCADE;


--
-- Name: termini termini_slot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.termini
    ADD CONSTRAINT termini_slot_id_fkey FOREIGN KEY (slot_id) REFERENCES public.slots(id) ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: neondb_owner
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON SEQUENCES TO neondb_owner;


--
-- Name: DEFAULT PRIVILEGES FOR TYPES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TYPES TO neondb_owner;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON FUNCTIONS TO neondb_owner;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TABLES TO neondb_owner;


--
-- PostgreSQL database dump complete
--

\unrestrict XAJScYnpPnHYddsZvk77sHcjehOGX2jiq0gf71EmiqTmhUCaJjtIGRXEjIjL9BA

