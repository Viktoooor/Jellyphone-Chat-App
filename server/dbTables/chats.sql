create table chats(
    chat_id uuid primary key,
    type varchar(50) not null,
    info jsonb
);