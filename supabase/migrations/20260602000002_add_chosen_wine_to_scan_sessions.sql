-- Add chosen_wine_name to track which wine recommendation the user selected
alter table scan_sessions
  add column if not exists chosen_wine_name text;
