create table tokens(
    user_id uuid primary key not null,
    token text not null,
    expires_at date not null,

    constraint user_id_fk foreign key (user_id) references users (id) on delete cascade
);