create table contacts(
    user_id uuid not null,
    contact_id uuid not null,
    chat_id uuid not null unique,
    
    primary key (user_id, contact_id),

    constraint user_id_fk foreign key (user_id) references users (id) on delete cascade,
    constraint contact_id_fk foreign key (contact_id) references users (id) on delete cascade,
    constraint chat_id_fk foreign key (chat_id) references chats(chat_id) on delete cascade,

    constraint check_many check (user_id < contact_id)
);