-- ============================================================
-- Recetario v2 — schema
-- Run once in Supabase > SQL Editor
-- ============================================================

-- TAG TYPES
create table tag_types (
    id   uuid primary key default gen_random_uuid(),
    name text not null unique
);

-- TAGS
create table tags (
    id          uuid primary key default gen_random_uuid(),
    name        text not null unique,
    tag_type_id uuid references tag_types(id) on delete set null
);

-- INGREDIENTS (master catalog)
create table ingredients (
    id   uuid primary key default gen_random_uuid(),
    name text not null unique
);

-- UNITS
create table units (
    id           uuid primary key default gen_random_uuid(),
    name         text not null unique,
    abbreviation text not null
);

-- RECIPES
create table recipes (
    id          uuid primary key default gen_random_uuid(),
    title       text        not null,
    description text,
    image_url   text,
    prep_time   integer,
    cook_time   integer,
    servings    integer,
    rating      integer     check (rating >= 1 and rating <= 4),
    rating_note text,
    created_at  timestamptz default now(),
    updated_at  timestamptz default now()
);

-- RECIPE <-> TAGS (M:N)
create table recipe_tags (
    recipe_id uuid not null references recipes(id) on delete cascade,
    tag_id    uuid not null references tags(id)    on delete cascade,
    primary key (recipe_id, tag_id)
);

-- RECIPE INGREDIENTS
create table recipe_ingredients (
    id            uuid    primary key default gen_random_uuid(),
    recipe_id     uuid    not null references recipes(id)     on delete cascade,
    ingredient_id uuid    not null references ingredients(id) on delete restrict,
    quantity      decimal,
    unit_id       uuid    references units(id) on delete set null,
    optional      boolean not null default false
);

-- RECIPE STEPS
create table recipe_steps (
    id          uuid    primary key default gen_random_uuid(),
    recipe_id   uuid    not null references recipes(id) on delete cascade,
    step_number integer not null,
    description text    not null
);

-- ── Índices ────────────────────────────────────────────────────
create index on recipe_ingredients(recipe_id);
create index on recipe_ingredients(ingredient_id);
create index on recipe_steps(recipe_id);
create index on tags(tag_type_id);

-- ── updated_at trigger ─────────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger recipes_updated_at
    before update on recipes
    for each row execute function update_updated_at();

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================

alter table recipes           enable row level security;
alter table recipe_tags       enable row level security;
alter table recipe_ingredients enable row level security;
alter table recipe_steps      enable row level security;
alter table tags              enable row level security;
alter table tag_types         enable row level security;
alter table ingredients       enable row level security;
alter table units             enable row level security;

-- Public: read everything
create policy "public read recipes"            on recipes            for select using (true);
create policy "public read recipe_tags"        on recipe_tags        for select using (true);
create policy "public read recipe_ingredients" on recipe_ingredients for select using (true);
create policy "public read recipe_steps"       on recipe_steps       for select using (true);
create policy "public read tags"               on tags               for select using (true);
create policy "public read tag_types"          on tag_types          for select using (true);
create policy "public read ingredients"        on ingredients        for select using (true);
create policy "public read units"              on units              for select using (true);

-- Owner (authenticated): full write
create policy "owner insert recipes"    on recipes    for insert with check (auth.role() = 'authenticated');
create policy "owner update recipes"    on recipes    for update using     (auth.role() = 'authenticated');
create policy "owner delete recipes"    on recipes    for delete using     (auth.role() = 'authenticated');

create policy "owner insert recipe_tags"   on recipe_tags   for insert with check (auth.role() = 'authenticated');
create policy "owner delete recipe_tags"   on recipe_tags   for delete using     (auth.role() = 'authenticated');

create policy "owner insert recipe_ingredients" on recipe_ingredients for insert with check (auth.role() = 'authenticated');
create policy "owner delete recipe_ingredients" on recipe_ingredients for delete using     (auth.role() = 'authenticated');

create policy "owner insert recipe_steps" on recipe_steps for insert with check (auth.role() = 'authenticated');
create policy "owner delete recipe_steps" on recipe_steps for delete using     (auth.role() = 'authenticated');

create policy "owner all tags"       on tags       for all using (auth.role() = 'authenticated');
create policy "owner all tag_types"  on tag_types  for all using (auth.role() = 'authenticated');
create policy "owner all ingredients" on ingredients for all using (auth.role() = 'authenticated');
create policy "owner all units"      on units      for all using (auth.role() = 'authenticated');

-- ============================================================
-- Storage: recipe images bucket
-- ============================================================

insert into storage.buckets (id, name, public)
values ('recipe-images', 'recipe-images', true);

create policy "public view recipe images"
    on storage.objects for select
    using (bucket_id = 'recipe-images');

create policy "owner upload recipe images"
    on storage.objects for insert
    with check (bucket_id = 'recipe-images' and auth.role() = 'authenticated');

create policy "owner delete recipe images"
    on storage.objects for delete
    using (bucket_id = 'recipe-images' and auth.role() = 'authenticated');

-- ============================================================
-- Seed: units
-- ============================================================

insert into units (name, abbreviation) values
    ('gramos',      'g'),
    ('kilogramos',  'kg'),
    ('mililitros',  'ml'),
    ('litros',      'l'),
    ('taza',        'taza'),
    ('cucharada',   'cda'),
    ('cucharadita', 'cdta'),
    ('unidad',      'u'),
    ('cantidad necesaria',       'c/n'),
    ('otro',       'otro');
