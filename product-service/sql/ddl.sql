create table if not exists products ( id uuid primary key default uuid_generate_v4(), title text not null, description text, price integer );

create table if not exists stocks ( product_id uuid primary key, count integer, foreign key ("product_id") references "products" ("id") on delete cascade );

create extension if not exists "uuid-ossp";
