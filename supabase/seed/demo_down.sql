-- Elimina la semilla [DEMO]. Ejecutar antes de la carga histórica real.
-- Solo borra filas con source = 'demo' o nombres [DEMO]; no toca nada más.
do $$
declare o uuid;
begin
  select id into o from public.organizations where slug = 'stone';
  delete from public.payment_allocations where org_id = o and payment_id in (select id from public.payments where source = 'demo');
  delete from public.payments where org_id = o and source = 'demo';
  delete from public.charges where org_id = o and source = 'demo';
  delete from public.expense_shares where org_id = o and expense_id in (select id from public.expenses where source = 'demo');
  delete from public.expenses where org_id = o and source = 'demo';
  delete from public.lease_terms where org_id = o and lease_id in (select id from public.leases where source = 'demo');
  delete from public.lease_units where org_id = o and lease_id in (select id from public.leases where source = 'demo');
  delete from public.leases where org_id = o and source = 'demo';
  delete from public.tenants where org_id = o and display_name like '[DEMO]%';
  delete from public.units where org_id = o and name like '[DEMO]%';
  delete from public.developments where org_id = o and name like '[DEMO]%';
  delete from public.legal_entities where org_id = o and name like '[DEMO]%';
end $$;
