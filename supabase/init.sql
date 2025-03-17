-- Create profiles table
create table if not exists profiles (
  id uuid references auth.users primary key,
  email text unique not null,
  display_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create transactions table
create table if not exists transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  amount decimal(12,2) not null,
  description text not null,
  category text not null,
  date timestamp with time zone not null,
  type text not null check (type in ('income', 'expense')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create budgets table
create table if not exists budgets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  category text not null,
  amount decimal(12,2) not null,
  period text not null check (period in ('monthly', 'yearly')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create bank_accounts table
create table if not exists bank_accounts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  type text not null,
  balance decimal(12,2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table transactions enable row level security;
alter table budgets enable row level security;
alter table bank_accounts enable row level security;

-- Profiles policies
create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- Transactions policies
create policy "Users can view their own transactions"
  on transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own transactions"
  on transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own transactions"
  on transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own transactions"
  on transactions for delete
  using (auth.uid() = user_id);

-- Budgets policies
create policy "Users can view their own budgets"
  on budgets for select
  using (auth.uid() = user_id);

create policy "Users can insert their own budgets"
  on budgets for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own budgets"
  on budgets for update
  using (auth.uid() = user_id);

create policy "Users can delete their own budgets"
  on budgets for delete
  using (auth.uid() = user_id);

-- Bank accounts policies
create policy "Users can view their own bank accounts"
  on bank_accounts for select
  using (auth.uid() = user_id);

create policy "Users can insert their own bank accounts"
  on bank_accounts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own bank accounts"
  on bank_accounts for update
  using (auth.uid() = user_id);

create policy "Users can delete their own bank accounts"
  on bank_accounts for delete
  using (auth.uid() = user_id); 