create table contact_requests(
    sender_id uuid not null,
    accepter_id uuid not null,
    blocked boolean default false,

    primary key (sender_id, accepter_id),

    constraint sender_id_fk foreign key (sender_id) references users (id) on delete cascade,
    constraint accepter_id_fk foreign key (accepter_id) references users (id) on delete cascade,

    constraint check_not_self check (sender_id <> accepter_id)
);