


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


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."room_status" AS ENUM (
    'active',
    'expired'
);


ALTER TYPE "public"."room_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_cleanup_anon_users"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  delete from auth.users u
  using public.anon_users au
  where u.id = au.user_id
    and au.last_seen_at < now() - interval '30 minutes'
    and not exists (
      select 1
      from public.room_members rm
      join public.rooms r on r.id = rm.room_id
      where rm.user_id = u.id
        and r.status = 'active'
    );
end;
$$;


ALTER FUNCTION "public"."fn_cleanup_anon_users"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_delete_expired_rooms"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  DELETE FROM public.rooms
  WHERE expires_at <= now();
END;
$$;


ALTER FUNCTION "public"."fn_delete_expired_rooms"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_expire_rooms"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  UPDATE public.rooms
  SET status = 'expired'
  WHERE expires_at <= now()
    AND status = 'active';
END;
$$;


ALTER FUNCTION "public"."fn_expire_rooms"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_is_member"("p_room_id" "uuid", "p_user_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE
    AS $$
  select exists (
    select 1
    from public.room_members m
    where m.room_id = p_room_id
      and m.user_id = p_user_id
  );
$$;


ALTER FUNCTION "public"."fn_is_member"("p_room_id" "uuid", "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_is_room_active"("p_room_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE
    AS $$
  select exists (
    select 1
    from public.rooms r
    where r.id = p_room_id
      and r.status = 'active'
      and r.expires_at > now()
  );
$$;


ALTER FUNCTION "public"."fn_is_room_active"("p_room_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_is_room_member"("p_room_id" "uuid", "p_user_id" "uuid") RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.room_members rm
    WHERE rm.room_id = p_room_id
      AND rm.user_id = p_user_id
  );
$$;


ALTER FUNCTION "public"."fn_is_room_member"("p_room_id" "uuid", "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_messages_set_sender"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.sender_id := auth.uid();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."fn_messages_set_sender"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_rooms_add_creator_member"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  insert into public.room_members(room_id, user_id)
  values (new.id, new.created_by)
  on conflict do nothing;

  return new;
end $$;


ALTER FUNCTION "public"."fn_rooms_add_creator_member"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_rooms_set_created_by"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  if new.created_by is null then
    new.created_by := auth.uid();
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."fn_rooms_set_created_by"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_rooms_set_expires_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  if new.expires_at is null then
    new.expires_at :=
      now() + make_interval(secs => new.ttl_seconds);
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."fn_rooms_set_expires_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_set_room_member_user"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.user_id := auth.uid();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."fn_set_room_member_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_touch_anon_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into public.anon_users (user_id)
  values (auth.uid())
  on conflict (user_id)
  do update set last_seen_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."fn_touch_anon_user"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."anon_users" (
    "user_id" "uuid" NOT NULL,
    "last_seen_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."anon_users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "room_id" "uuid" NOT NULL,
    "sender_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "content" "text" NOT NULL,
    "client_msg_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    CONSTRAINT "messages_content_len" CHECK ((("char_length"("content") >= 1) AND ("char_length"("content") <= 500)))
);

ALTER TABLE ONLY "public"."messages" REPLICA IDENTITY FULL;


ALTER TABLE "public"."messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."room_members" (
    "room_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "joined_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE ONLY "public"."room_members" REPLICA IDENTITY FULL;


ALTER TABLE "public"."room_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."rooms" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "status" "public"."room_status" DEFAULT 'active'::"public"."room_status" NOT NULL,
    "ttl_seconds" integer DEFAULT 600 NOT NULL,
    CONSTRAINT "rooms_expires_after_created" CHECK (("expires_at" > "created_at")),
    CONSTRAINT "rooms_ttl_reasonable" CHECK ((("ttl_seconds" >= 60) AND ("ttl_seconds" <= 3600)))
);

ALTER TABLE ONLY "public"."rooms" REPLICA IDENTITY FULL;


ALTER TABLE "public"."rooms" OWNER TO "postgres";


ALTER TABLE ONLY "public"."anon_users"
    ADD CONSTRAINT "anon_users_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_room_sender_client_unique" UNIQUE ("room_id", "sender_id", "client_msg_id");



ALTER TABLE ONLY "public"."room_members"
    ADD CONSTRAINT "room_members_pkey" PRIMARY KEY ("room_id", "user_id");



ALTER TABLE ONLY "public"."rooms"
    ADD CONSTRAINT "rooms_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_messages_room_created" ON "public"."messages" USING "btree" ("room_id", "created_at");



CREATE INDEX "idx_messages_sender" ON "public"."messages" USING "btree" ("sender_id");



CREATE INDEX "idx_room_members_room" ON "public"."room_members" USING "btree" ("room_id");



CREATE INDEX "idx_room_members_user" ON "public"."room_members" USING "btree" ("user_id");



CREATE INDEX "idx_rooms_created_by" ON "public"."rooms" USING "btree" ("created_by");



CREATE INDEX "idx_rooms_expires_at" ON "public"."rooms" USING "btree" ("expires_at");



CREATE OR REPLACE TRIGGER "trg_messages_set_sender" BEFORE INSERT ON "public"."messages" FOR EACH ROW EXECUTE FUNCTION "public"."fn_messages_set_sender"();



CREATE OR REPLACE TRIGGER "trg_rooms_add_creator_member" AFTER INSERT ON "public"."rooms" FOR EACH ROW EXECUTE FUNCTION "public"."fn_rooms_add_creator_member"();



CREATE OR REPLACE TRIGGER "trg_rooms_set_created_by" BEFORE INSERT ON "public"."rooms" FOR EACH ROW EXECUTE FUNCTION "public"."fn_rooms_set_created_by"();



CREATE OR REPLACE TRIGGER "trg_rooms_set_expires_at" BEFORE INSERT ON "public"."rooms" FOR EACH ROW EXECUTE FUNCTION "public"."fn_rooms_set_expires_at"();



CREATE OR REPLACE TRIGGER "trg_set_room_member_user" BEFORE INSERT ON "public"."room_members" FOR EACH ROW EXECUTE FUNCTION "public"."fn_set_room_member_user"();



CREATE OR REPLACE TRIGGER "trg_touch_anon_user" AFTER INSERT ON "public"."room_members" FOR EACH ROW EXECUTE FUNCTION "public"."fn_touch_anon_user"();



ALTER TABLE ONLY "public"."anon_users"
    ADD CONSTRAINT "anon_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."room_members"
    ADD CONSTRAINT "room_members_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE CASCADE;



ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "messages_insert_active_room" ON "public"."messages" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."rooms" "r"
  WHERE (("r"."id" = "messages"."room_id") AND ("r"."status" = 'active'::"public"."room_status") AND ("r"."expires_at" > "now"())))));



CREATE POLICY "messages_insert_member_active_room" ON "public"."messages" FOR INSERT TO "authenticated" WITH CHECK ((("sender_id" = "auth"."uid"()) AND "public"."fn_is_member"("room_id", "auth"."uid"()) AND "public"."fn_is_room_active"("room_id") AND (("char_length"("content") >= 1) AND ("char_length"("content") <= 500))));



CREATE POLICY "messages_insert_self" ON "public"."messages" FOR INSERT WITH CHECK ((("sender_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."room_members" "rm"
  WHERE (("rm"."room_id" = "messages"."room_id") AND ("rm"."user_id" = "auth"."uid"()))))));



CREATE POLICY "messages_select" ON "public"."messages" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."rooms" "r"
  WHERE ("r"."id" = "messages"."room_id"))));



CREATE POLICY "messages_select_for_members" ON "public"."messages" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."room_members" "rm"
  WHERE (("rm"."room_id" = "messages"."room_id") AND ("rm"."user_id" = "auth"."uid"())))));



CREATE POLICY "messages_select_members" ON "public"."messages" FOR SELECT TO "authenticated" USING ("public"."fn_is_member"("room_id", "auth"."uid"()));



CREATE POLICY "messages_select_room_members" ON "public"."messages" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."room_members" "rm"
  WHERE (("rm"."room_id" = "messages"."room_id") AND ("rm"."user_id" = "auth"."uid"())))));



ALTER TABLE "public"."room_members" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "room_members_delete_self" ON "public"."room_members" FOR DELETE TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "room_members_insert_self" ON "public"."room_members" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "room_members_select_self" ON "public"."room_members" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."rooms" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "rooms_insert" ON "public"."rooms" FOR INSERT TO "authenticated" WITH CHECK (("created_by" = "auth"."uid"()));



CREATE POLICY "rooms_no_delete" ON "public"."rooms" FOR DELETE TO "authenticated" USING (false);



CREATE POLICY "rooms_select" ON "public"."rooms" FOR SELECT TO "authenticated" USING ((("created_by" = "auth"."uid"()) OR "public"."fn_is_room_member"("id", "auth"."uid"())));



CREATE POLICY "rooms_update" ON "public"."rooms" FOR UPDATE TO "authenticated" USING (("created_by" = "auth"."uid"())) WITH CHECK (("created_by" = "auth"."uid"()));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";









GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";














































































































































































GRANT ALL ON FUNCTION "public"."fn_cleanup_anon_users"() TO "anon";
GRANT ALL ON FUNCTION "public"."fn_cleanup_anon_users"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_cleanup_anon_users"() TO "service_role";



GRANT ALL ON FUNCTION "public"."fn_delete_expired_rooms"() TO "anon";
GRANT ALL ON FUNCTION "public"."fn_delete_expired_rooms"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_delete_expired_rooms"() TO "service_role";



GRANT ALL ON FUNCTION "public"."fn_expire_rooms"() TO "anon";
GRANT ALL ON FUNCTION "public"."fn_expire_rooms"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_expire_rooms"() TO "service_role";



GRANT ALL ON FUNCTION "public"."fn_is_member"("p_room_id" "uuid", "p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."fn_is_member"("p_room_id" "uuid", "p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_is_member"("p_room_id" "uuid", "p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."fn_is_room_active"("p_room_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."fn_is_room_active"("p_room_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_is_room_active"("p_room_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."fn_is_room_member"("p_room_id" "uuid", "p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."fn_is_room_member"("p_room_id" "uuid", "p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_is_room_member"("p_room_id" "uuid", "p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."fn_messages_set_sender"() TO "anon";
GRANT ALL ON FUNCTION "public"."fn_messages_set_sender"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_messages_set_sender"() TO "service_role";



GRANT ALL ON FUNCTION "public"."fn_rooms_add_creator_member"() TO "anon";
GRANT ALL ON FUNCTION "public"."fn_rooms_add_creator_member"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_rooms_add_creator_member"() TO "service_role";



GRANT ALL ON FUNCTION "public"."fn_rooms_set_created_by"() TO "anon";
GRANT ALL ON FUNCTION "public"."fn_rooms_set_created_by"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_rooms_set_created_by"() TO "service_role";



GRANT ALL ON FUNCTION "public"."fn_rooms_set_expires_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."fn_rooms_set_expires_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_rooms_set_expires_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."fn_set_room_member_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."fn_set_room_member_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_set_room_member_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."fn_touch_anon_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."fn_touch_anon_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_touch_anon_user"() TO "service_role";
























GRANT ALL ON TABLE "public"."anon_users" TO "anon";
GRANT ALL ON TABLE "public"."anon_users" TO "authenticated";
GRANT ALL ON TABLE "public"."anon_users" TO "service_role";



GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT SELECT,INSERT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";



GRANT ALL ON TABLE "public"."room_members" TO "anon";
GRANT ALL ON TABLE "public"."room_members" TO "authenticated";
GRANT ALL ON TABLE "public"."room_members" TO "service_role";



GRANT ALL ON TABLE "public"."rooms" TO "anon";
GRANT ALL ON TABLE "public"."rooms" TO "authenticated";
GRANT ALL ON TABLE "public"."rooms" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";

revoke delete on table "public"."messages" from "authenticated";

revoke update on table "public"."messages" from "authenticated";


