alter table public.scenes add column if not exists cast_roles text[];

update public.scenes
set cast_roles = case
  when id = 'spicy-cuckold' then array['wife','male_lover','husband']::text[]
  when id = 'spicy-ffm' then array['husband','wife','female_lover']::text[]
  when id in ('erotic-one-night','spicy-bbc','spicy-creampie') then array['wife','male_lover']::text[]
  when cast_count = 1 then array['wife']::text[]
  when cast_count = 2 then array['wife','husband']::text[]
  when cast_count = 3 then array['wife','husband','male_lover']::text[]
  else null
end
where cast_roles is null or cardinality(cast_roles) = 0;

alter table public.scenes alter column cast_roles set not null;

alter table public.scenes drop constraint if exists scenes_cast_count_valid;
alter table public.scenes add constraint scenes_cast_count_valid check (cast_count between 1 and 3);

alter table public.scenes drop constraint if exists scenes_cast_roles_count;
alter table public.scenes add constraint scenes_cast_roles_count check (cardinality(cast_roles) = cast_count);

alter table public.scenes drop constraint if exists scenes_cast_roles_valid;
alter table public.scenes add constraint scenes_cast_roles_valid check (cast_roles <@ array['wife','husband','female_lover','male_lover']::text[]);

alter table public.scenes drop constraint if exists scenes_solo_consistent;
alter table public.scenes add constraint scenes_solo_consistent check (is_solo = (cast_count = 1));
