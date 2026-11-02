-- Pruebas negativas de RLS e invariantes (plan §5). Se ejecuta como postgres
-- dentro de una transacción que SIEMPRE se revierte: no deja usuarios ni datos.
-- Uso: pegar en el SQL editor de Supabase o `psql -f`. Todas las filas deben
-- salir con ok = true. Última corrida: 2026-11-02, 36/36.
begin;
set local search_path = public;

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
 ('00000000-0000-0000-0000-00000000000a','00000000-0000-0000-0000-000000000000','authenticated','authenticated','demo-admin@stone.demo','x',now(),'{}','{"full_name":"[DEMO] Admin"}',now(),now()),
 ('00000000-0000-0000-0000-00000000000b','00000000-0000-0000-0000-000000000000','authenticated','authenticated','demo-op@stone.demo','x',now(),'{}','{"full_name":"[DEMO] Operator"}',now(),now()),
 ('00000000-0000-0000-0000-00000000000c','00000000-0000-0000-0000-000000000000','authenticated','authenticated','demo-viewer@stone.demo','x',now(),'{}','{"full_name":"[DEMO] Viewer"}',now(),now()),
 ('00000000-0000-0000-0000-00000000000d','00000000-0000-0000-0000-000000000000','authenticated','authenticated','demo-nobody@stone.demo','x',now(),'{}','{}',now(),now());

create temp table r (n serial, test text, ok boolean);
grant all on r to authenticated, anon; grant all on sequence r_n_seq to authenticated, anon;

do $$
declare
  org uuid := (select id from organizations where slug = 'stone');
  t_ref uuid; t_ok uuid; ten uuid; ch uuid; pay uuid; lease uuid;
  n int; failed boolean;
begin
  select count(*) into n from profiles; insert into r (test, ok) values ('trigger crea 4 profiles', n = 4);

  insert into invitations (org_id, email, role) values (org, 'demo-invited@stone.demo', 'operator');
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values ('00000000-0000-0000-0000-00000000000e','00000000-0000-0000-0000-000000000000','authenticated','authenticated','demo-invited@stone.demo','x',now(),'{}','{}',now(),now());
  insert into r (test, ok) values ('invitación crea membresía operator',
    (select role = 'operator' from memberships where profile_id = '00000000-0000-0000-0000-00000000000e'));
  insert into r (test, ok) values ('invitación queda accepted',
    (select status = 'accepted' from invitations where email = 'demo-invited@stone.demo'));

  insert into memberships (org_id, profile_id, role) values
    (org, '00000000-0000-0000-0000-00000000000a', 'admin'),
    (org, '00000000-0000-0000-0000-00000000000b', 'operator'),
    (org, '00000000-0000-0000-0000-00000000000c', 'viewer');

  insert into units (org_id, code, name, reference_only) values (org, 'DEMO-REF', '[DEMO] Local tercero', true) returning id into t_ref;
  insert into units (org_id, code, name) values (org, 'DEMO-OK', '[DEMO] Bodega Stone') returning id into t_ok;
  insert into tenants (org_id, display_name) values (org, '[DEMO] Arrendatario') returning id into ten;
  insert into tenant_details (tenant_id, org_id, rfc) values (ten, org, 'XAXX010101000');
  insert into leases (org_id, tenant_id) values (org, ten) returning id into lease;
  insert into charges (org_id, tenant_id, lease_id, unit_id, concept, period, subtotal, tax_amount, invoice_folio, due_date)
    values (org, ten, lease, t_ok, 'rent', '2026-09-01', 10000, 1600, 'DEMO-1', '2026-09-10') returning id into ch;
  insert into payments (org_id, tenant_id, effective_date, amount) values (org, ten, '2026-09-05', 5000) returning id into pay;

  failed := false;
  begin insert into lease_units (org_id, lease_id, unit_id) values (org, lease, t_ref);
  exception when check_violation then failed := true; end;
  insert into r (test, ok) values ('reference_only rechaza lease_units', failed);

  failed := false;
  begin insert into charges (org_id, tenant_id, unit_id, concept, period, subtotal) values (org, ten, t_ref, 'rent', '2026-09-01', 1);
  exception when check_violation then failed := true; end;
  insert into r (test, ok) values ('reference_only rechaza charges', failed);

  failed := false;
  begin insert into charges (org_id, tenant_id, concept, period, subtotal) values (org, ten, 'rent', '2026-09-15', 1);
  exception when check_violation then failed := true; end;
  insert into r (test, ok) values ('period debe ser día 1', failed);

  failed := false;
  begin insert into payment_allocations (org_id, payment_id, charge_id, amount) values (org, pay, ch, 6000);
  exception when check_violation then failed := true; end;
  insert into r (test, ok) values ('allocation > pago rechazada', failed);
  insert into payment_allocations (org_id, payment_id, charge_id, amount) values (org, pay, ch, 5000);
  insert into r (test, ok) values ('charge_balances saldo 6600 parcial', (select balance = 6600 and status = 'partially_paid' from charge_balances where charge_id = ch));

  insert into lease_terms (org_id, lease_id, effective_from, effective_to, rent_total) values (org, lease, '2026-01-01', '2026-07-31', 16014.21);
  failed := false;
  begin insert into lease_terms (org_id, lease_id, effective_from, rent_total) values (org, lease, '2026-07-01', 16553.24);
  exception when exclusion_violation then failed := true; end;
  insert into r (test, ok) values ('lease_terms traslape rechazado', failed);
  insert into lease_terms (org_id, lease_id, effective_from, rent_total) values (org, lease, '2026-08-01', 16553.24);
  insert into r (test, ok) values ('lease_term_at agosto = 16553.24', (select rent_total = 16553.24 from lease_term_at(lease, '2026-08-15')));
  insert into r (test, ok) values ('breakdown subtotal 14270.03', (select rent_subtotal = 14270.03 from lease_terms_breakdown where lease_id = lease and effective_from = '2026-08-01'));
  insert into r (test, ok) values ('normalize_name', normalize_name('  OXXO, S.A. de C.V. ') = 'oxxo sa de cv');

  -- VIEWER
  perform set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000c","role":"authenticated"}', true);
  perform set_config('role', 'authenticated', true);
  select count(*) into n from units; insert into r (test, ok) values ('viewer lee units', n = 2);
  select count(*) into n from payments; insert into r (test, ok) values ('viewer NO lee payments', n = 0);
  select count(*) into n from charges; insert into r (test, ok) values ('viewer NO lee charges', n = 0);
  select count(*) into n from charge_balances; insert into r (test, ok) values ('viewer NO lee charge_balances', n = 0);
  select count(*) into n from tenant_details; insert into r (test, ok) values ('viewer NO lee tenant_details', n = 0);
  select count(*) into n from tenants; insert into r (test, ok) values ('viewer lee tenants (nombre)', n = 1);
  failed := false;
  begin insert into units (org_id, code, name) values (org, 'DEMO-V', '[DEMO] viewer');
  exception when insufficient_privilege then failed := true; end;
  insert into r (test, ok) values ('viewer NO inserta units', failed);

  -- OPERATOR
  perform set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000b","role":"authenticated"}', true);
  select count(*) into n from payments; insert into r (test, ok) values ('operator lee payments', n = 1);
  select count(*) into n from tenant_details; insert into r (test, ok) values ('operator lee tenant_details', n = 1);
  failed := false;
  begin insert into charge_adjustments (org_id, charge_id, kind, amount, reason) values (org, ch, 'discount', -100, 'x');
  exception when insufficient_privilege then failed := true; end;
  insert into r (test, ok) values ('operator NO inserta charge_adjustments', failed);
  failed := false;
  begin insert into invitations (org_id, email, role) values (org, 'x@stone.demo', 'viewer');
  exception when insufficient_privilege then failed := true; end;
  insert into r (test, ok) values ('operator NO invita', failed);
  select count(*) into n from invitations; insert into r (test, ok) values ('operator NO lee invitations', n = 0);
  insert into units (org_id, code, name) values (org, 'DEMO-OP', '[DEMO] operator');
  insert into r (test, ok) values ('operator inserta units', true);
  delete from units where code = 'DEMO-OP';
  select count(*) into n from units where code = 'DEMO-OP';
  insert into r (test, ok) values ('operator NO borra units (RLS filtra)', n = 1);
  failed := false;
  begin insert into units (org_id, code, name) values ('00000000-0000-0000-0000-0000000000ff', 'DEMO-X', 'otra org');
  exception when insufficient_privilege or foreign_key_violation then failed := true; end;
  insert into r (test, ok) values ('operator NO inserta en otra org', failed);

  -- ADMIN
  perform set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}', true);
  insert into charge_adjustments (org_id, charge_id, kind, amount, reason) values (org, ch, 'discount', -100, 'prueba');
  insert into r (test, ok) values ('admin inserta charge_adjustments', true);
  insert into r (test, ok) values ('saldo tras ajuste 6500', (select balance = 6500 from charge_balances where charge_id = ch));
  select count(*) into n from audit_logs; insert into r (test, ok) values ('admin lee audit_logs (>0)', n > 0);
  select count(*) into n from profiles; insert into r (test, ok) values ('admin ve perfiles de su org', n = 4);
  insert into invitations (org_id, email, role) values (org, 'y@stone.demo', 'viewer');
  insert into r (test, ok) values ('admin invita', true);

  -- SIN MEMBRESÍA
  perform set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000d","role":"authenticated"}', true);
  select count(*) into n from units; insert into r (test, ok) values ('sin membresía NO lee units', n = 0);
  select count(*) into n from organizations; insert into r (test, ok) values ('sin membresía NO lee organizations', n = 0);
  select count(*) into n from profiles; insert into r (test, ok) values ('sin membresía solo ve su perfil', n = 1);

  -- ANON
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  perform set_config('role', 'anon', true);
  failed := false;
  begin select count(*) into n from units;
  exception when insufficient_privilege then failed := true; end;
  insert into r (test, ok) values ('anon sin privilegios en units', failed);
  perform set_config('role', 'postgres', true);
end $$;

select n, test, ok from r order by n;
rollback;
