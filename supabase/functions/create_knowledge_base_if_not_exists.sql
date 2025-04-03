
create or replace function create_knowledge_base_if_not_exists()
returns void as $$
begin
  -- Check if the table exists
  if not exists (select from pg_tables where schemaname = 'public' and tablename = 'knowledge_base') then
    -- Create the table
    create table public.knowledge_base (
      id uuid primary key default gen_random_uuid(),
      title text not null,
      content text not null,
      file_path text,
      file_type text,
      authors text[],
      year text,
      source text,
      url text,
      format text,
      user_id uuid not null,
      created_at timestamptz not null default now()
    );
    
    -- Add RLS policies
    alter table public.knowledge_base enable row level security;
    
    -- Allow users to view their own knowledge base items
    create policy "Users can view their own knowledge base items"
      on public.knowledge_base for select
      using (auth.uid() = user_id);
    
    -- Allow users to insert their own knowledge base items
    create policy "Users can insert their own knowledge base items"
      on public.knowledge_base for insert
      with check (auth.uid() = user_id);
      
    -- Allow users to delete their own knowledge base items
    create policy "Users can delete their own knowledge base items"
      on public.knowledge_base for delete
      using (auth.uid() = user_id);
  end if;
end;
$$ language plpgsql security definer;
