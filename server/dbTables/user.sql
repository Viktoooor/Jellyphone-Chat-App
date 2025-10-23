create table users(
    id UUID primary key not null default gen_random_uuid(),
    email varchar(50) unique not null,
    password varchar(64) not null,
    user_name varchar(50) unique not null,
    first_name varchar(50) not null,
    is_activated boolean default false,
    activation_link varchar(100),
    bio text,
    picture varchar(2048) default 'default.png'
);