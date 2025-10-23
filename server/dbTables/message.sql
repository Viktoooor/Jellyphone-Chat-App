create table messages(
    id uuid primary key default gen_random_uuid(),
    chat_id uuid not null unique,
    message bytea not null,
    send_time timestamp not null,
    meta jsonb not null,

    constraint chat_id_fk foreign key (chat_id) references chats(chat_id) on delete cascade
)