create table if not exists daily_scan_counts (
  user_id uuid not null references auth.users(id) on delete cascade,
  scan_date date not null default current_date,
  count integer not null default 0,
  primary key (user_id, scan_date)
);

alter table daily_scan_counts enable row level security;

-- Users can read their own count (e.g. to show remaining quota in UI)
create policy "Users can view own scan counts"
  on daily_scan_counts for select
  using (auth.uid() = user_id);

-- Only service role can write (edge function uses service role key to bypass RLS)
