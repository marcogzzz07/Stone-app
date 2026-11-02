-- 0007 · Endurecimiento tras el linter de Supabase:
--  · las funciones de autorización salen del esquema `public` (expuesto por
--    PostgREST en /rest/v1/rpc) a un esquema `app` no expuesto;
--  · search_path fijo en todas las funciones;
--  · funciones de trigger sin EXECUTE para anon/authenticated;
--  · índices para las FK que sí se consultan.

create schema if not exists app;
grant usage on schema app to authenticated, service_role;

-- ---------------------------------------------------------------- funciones en app
create or replace function app.auth_org_ids()
returns setof uuid language sql stable security definer set search_path = public as $$
  select m.org_id from public.memberships m
  where m.profile_id = (select auth.uid()) and m.status = 'active'
$$;

create or replace function app.auth_role(p_org uuid)
returns public.app_role language sql stable security definer set search_path = public as $$
  select m.role from public.memberships m
  where m.profile_id = (select auth.uid()) and m.org_id = p_org and m.status = 'active'
  limit 1
$$;

create or replace function app.is_member(p_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.memberships m
    where m.profile_id = (select auth.uid()) and m.org_id = p_org and m.status = 'active')
$$;

create or replace function app.has_role(p_org uuid, variadic p_roles public.app_role[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.memberships m
    where m.profile_id = (select auth.uid()) and m.org_id = p_org
      and m.status = 'active' and m.role = any (p_roles))
$$;

create or replace function app.can_view_document(p_org uuid, p_sens public.document_sensitivity)
returns boolean language sql stable security definer set search_path = public as $$
  select case p_sens
    when 'public_internal' then app.is_member(p_org)
    when 'restricted'      then app.has_role(p_org, 'admin', 'operator')
    when 'sensitive'       then app.has_role(p_org, 'admin')
  end
$$;

create or replace function app.storage_org_id(p_name text)
returns uuid language sql immutable set search_path = public as $$
  select case when (storage.foldername(p_name))[1] ~ '^[0-9a-f-]{36}$'
              then (storage.foldername(p_name))[1]::uuid end
$$;

revoke all on all functions in schema app from public, anon;
grant execute on all functions in schema app to authenticated, service_role;

-- ---------------------------------------------------------------- rehacer políticas con app.*
do $$
declare p record;
begin
  for p in select schemaname, tablename, policyname from pg_policies where schemaname = 'public' loop
    execute format('drop policy %I on %I.%I', p.policyname, p.schemaname, p.tablename);
  end loop;
  for p in select policyname from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname like 'stone_%' loop
    execute format('drop policy %I on storage.objects', p.policyname);
  end loop;
end $$;

drop function public.apply_std_policies(text, text);
drop function public.can_view_document(uuid, public.document_sensitivity);
drop function public.storage_org_id(text);
drop function public.has_role(uuid, public.app_role[]);
drop function public.is_member(uuid);
drop function public.auth_role(uuid);
drop function public.auth_org_ids();

create or replace function app.apply_std_policies(p_table text, p_mode text)
returns void language plpgsql set search_path = public as $$
declare
  t text := format('public.%I', p_table);
  r_sel text; r_write text; r_del text := 'app.has_role(org_id, ''admin'')';
begin
  execute format('alter table %s enable row level security', t);
  execute format('alter table %s force row level security', t);
  case p_mode
    when 'member_read_ops_write' then
      r_sel := 'app.is_member(org_id)';
      r_write := 'app.has_role(org_id, ''admin'', ''operator'')';
    when 'ops_only' then
      r_sel := 'app.has_role(org_id, ''admin'', ''operator'')';
      r_write := r_sel;
    when 'ops_read_admin_write' then
      r_sel := 'app.has_role(org_id, ''admin'', ''operator'')';
      r_write := 'app.has_role(org_id, ''admin'')';
    when 'member_read_admin_write' then
      r_sel := 'app.is_member(org_id)';
      r_write := 'app.has_role(org_id, ''admin'')';
    else raise exception 'modo desconocido %', p_mode;
  end case;
  execute format('create policy %I on %s for select to authenticated using (%s)', p_table || '_select', t, r_sel);
  execute format('create policy %I on %s for insert to authenticated with check (%s)', p_table || '_insert', t, r_write);
  execute format('create policy %I on %s for update to authenticated using (%s) with check (%s)', p_table || '_update', t, r_write, r_write);
  execute format('create policy %I on %s for delete to authenticated using (%s)', p_table || '_delete', t, r_del);
end $$;
revoke all on function app.apply_std_policies(text, text) from public, anon, authenticated;

select app.apply_std_policies(t, 'member_read_ops_write') from unnest(array[
  'legal_entities', 'developments', 'assets', 'units', 'ownership_interests', 'surfaces', 'geometries',
  'tenants', 'tenant_aliases', 'leases', 'lease_units', 'lease_terms',
  'document_versions', 'document_links', 'critical_dates',
  'import_batches', 'import_rows', 'import_discrepancies', 'source_records'
]) as t;
select app.apply_std_policies(t, 'ops_only') from unnest(array[
  'legal_entity_details', 'tenant_details',
  'charges', 'payments', 'payment_allocations',
  'expenses', 'expense_shares', 'expense_payments', 'expense_recoveries'
]) as t;
select app.apply_std_policies('charge_adjustments', 'ops_read_admin_write');
select app.apply_std_policies(t, 'member_read_admin_write') from unnest(array[
  'source_of_truth_rules', 'period_locks', 'memberships'
]) as t;

create policy organizations_select on public.organizations for select to authenticated
  using (app.is_member(id));
create policy organizations_update on public.organizations for update to authenticated
  using (app.has_role(id, 'admin')) with check (app.has_role(id, 'admin'));

create policy profiles_select on public.profiles for select to authenticated
  using (
    id = (select auth.uid())
    or exists (select 1 from public.memberships m
               where m.profile_id = profiles.id and m.org_id in (select app.auth_org_ids()))
  );
create policy profiles_update on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy invitations_admin on public.invitations for all to authenticated
  using (app.has_role(org_id, 'admin')) with check (app.has_role(org_id, 'admin'));

create policy audit_logs_select on public.audit_logs for select to authenticated
  using (org_id is not null and app.has_role(org_id, 'admin'));

create policy documents_select on public.documents for select to authenticated
  using (app.can_view_document(org_id, sensitivity));
create policy documents_insert on public.documents for insert to authenticated
  with check (app.can_view_document(org_id, sensitivity) and app.has_role(org_id, 'admin', 'operator'));
create policy documents_update on public.documents for update to authenticated
  using (app.can_view_document(org_id, sensitivity) and app.has_role(org_id, 'admin', 'operator'))
  with check (app.can_view_document(org_id, sensitivity) and app.has_role(org_id, 'admin', 'operator'));
create policy documents_delete on public.documents for delete to authenticated
  using (app.has_role(org_id, 'admin'));

create policy stone_storage_read on storage.objects for select to authenticated
  using (bucket_id in ('legal', 'fiscal', 'technical', 'commercial', 'imports') and (
      (bucket_id = 'legal' and app.has_role(app.storage_org_id(name), 'admin'))
   or (bucket_id <> 'legal' and app.has_role(app.storage_org_id(name), 'admin', 'operator'))));
create policy stone_storage_write on storage.objects for insert to authenticated
  with check (bucket_id in ('legal', 'fiscal', 'technical', 'commercial', 'imports') and (
      (bucket_id = 'legal' and app.has_role(app.storage_org_id(name), 'admin'))
   or (bucket_id <> 'legal' and app.has_role(app.storage_org_id(name), 'admin', 'operator'))));
create policy stone_storage_update on storage.objects for update to authenticated
  using (bucket_id in ('legal', 'fiscal', 'technical', 'commercial', 'imports')
         and app.has_role(app.storage_org_id(name), 'admin', 'operator'));
create policy stone_storage_delete on storage.objects for delete to authenticated
  using (bucket_id in ('legal', 'fiscal', 'technical', 'commercial', 'imports')
         and app.has_role(app.storage_org_id(name), 'admin'));

-- ---------------------------------------------------------------- search_path y EXECUTE en funciones de trigger
alter function public.set_updated_at() set search_path = public;
alter function public.normalize_name(text) set search_path = public;
alter function public.reject_reference_only_unit() set search_path = public;
alter function public.check_allocation_limits() set search_path = public;

revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.audit_row() from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.reject_reference_only_unit() from public, anon, authenticated;
revoke all on function public.check_allocation_limits() from public, anon, authenticated;
revoke all on function public.normalize_name(text) from public, anon;
revoke all on function public.lease_term_at(uuid, date) from public, anon;

-- ---------------------------------------------------------------- índices de FK consultadas
create index charges_unit_idx on public.charges (unit_id);
create index charges_development_idx on public.charges (development_id);
create index charges_import_row_idx on public.charges (import_row_id);
create index payments_import_row_idx on public.payments (import_row_id);
create index expenses_unit_idx on public.expenses (unit_id);
create index expenses_asset_idx on public.expenses (asset_id);
create index expenses_payer_idx on public.expenses (payer_entity_id);
create index expense_shares_entity_idx on public.expense_shares (entity_id);
create index expense_shares_tenant_idx on public.expense_shares (tenant_id);
create index expense_recoveries_charge_idx on public.expense_recoveries (charge_id);
create index ownership_entity_idx on public.ownership_interests (entity_id);
create index units_owner_idx on public.units (owner_entity_id);
create index leases_lessor_idx on public.leases (lessor_entity_id);
create index leases_contract_document_idx on public.leases (contract_document_id);
create index assets_parent_idx on public.assets (parent_asset_id);
create index import_discrepancies_batch_idx on public.import_discrepancies (batch_id);
create index source_records_target_idx on public.source_records (target_type, target_id);
create index documents_org_idx on public.documents (org_id);
