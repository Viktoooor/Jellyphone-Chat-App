create table chat_members(
    user_id uuid not null,
    chat_id uuid not null,
    role varchar(50) not null default 'member',

    constraint user_id_fk foreign key (user_id) references users (id) on delete cascade,
    constraint chat_id_fk foreign key (chat_id) references chats(chat_id) on delete cascade
);