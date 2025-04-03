
create or replace function create_ai_chat_history_if_not_exists()
returns void as $$
begin
  -- Check if the table exists
  if not exists (select from pg_tables where schemaname = 'public' and tablename = 'ai_chat_history') then
    -- Create the table
    create table public.ai_chat_history (
      id uuid primary key default gen_random_uuid(),
      document_id uuid not null,
      user_id uuid not null,
      role text not null,
      content text not null,
      timestamp timestamptz not null default now()
    );
    
    -- Add RLS policies
    alter table public.ai_chat_history enable row level security;
    
    -- Allow users to see their own chat history
    create policy "Users can view their own chat history"
      on public.ai_chat_history for select
      using (auth.uid() = user_id);
    
    -- Allow users to insert their own chat messages
    create policy "Users can insert their own chat messages"
      on public.ai_chat_history for insert
      with check (auth.uid() = user_id);
  end if;
end;
$$ language plpgsql security definer;
