create table notification_subs(
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null,
    sub JSONB not null
);