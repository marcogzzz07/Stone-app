-- Semilla [DEMO] · datos sintéticos del prototipo (iteración 0) cargados en la
-- organización `stone` para poder operar y probar la captura antes de la
-- carga histórica. Nada aquí es real. Todo lleva source = 'demo' y nombres
-- con prefijo [DEMO]; se elimina con `supabase/seed/demo_down.sql` antes de
-- importar el histórico real.
--
-- Idempotente: aborta si ya hay filas demo.

do $$
declare
  o uuid;
  ent_stone uuid; ent_a uuid; ent_b uuid; ent_3p uuid;
  dev_plaza uuid; dev_torre uuid;
  u_pl_101 uuid; u_pl_102 uuid; u_pl_103 uuid; u_pl_201 uuid; u_pl_202 uuid;
  u_pl_104 uuid; u_pl_105 uuid; u_pl_203 uuid;
  u_tp_01 uuid; u_tp_02 uuid; u_tp_03 uuid; u_terreno uuid;
  t1 uuid; t2 uuid; t3 uuid; t4 uuid;
  l1 uuid; l2 uuid; l3 uuid; l4 uuid; l5 uuid;
  c record; cid uuid;
  p1 uuid; p2 uuid; p3 uuid; p4 uuid; p5 uuid; p6 uuid; p7 uuid; p8 uuid; p9 uuid; p10 uuid;
begin
  select id into o from public.organizations where slug = 'stone';
  if o is null then raise exception 'No existe la organización stone'; end if;
  if exists (select 1 from public.tenants where org_id = o and display_name like '[DEMO]%') then
    raise notice 'La semilla demo ya está cargada; no se hace nada.';
    return;
  end if;

  -- Entidades
  insert into public.legal_entities (org_id, name, kind, is_stone) values
    (o, '[DEMO] Stone Inmuebles S.A. de C.V.', 'persona_moral', true) returning id into ent_stone;
  insert into public.legal_entities (org_id, name, kind, is_stone) values
    (o, '[DEMO] Propietaria Alfa', 'persona_fisica', true) returning id into ent_a;
  insert into public.legal_entities (org_id, name, kind, is_stone) values
    (o, '[DEMO] Inversiones Beta S.A.P.I.', 'persona_moral', true) returning id into ent_b;
  insert into public.legal_entities (org_id, name, kind, is_stone) values
    (o, '[DEMO] Tercero Gamma (referencia)', 'persona_moral', false) returning id into ent_3p;

  -- Desarrollos
  insert into public.developments (org_id, code, name, city, address, chart_order, is_shared, description) values
    (o, 'PLAZA', '[DEMO] Plaza Ejemplo Norte', 'Ciudad Demo', 'Av. Ficticia 1000, Col. Prototipo', 1, true,
     'Desarrollo compartido: 5 unidades Stone, 3 de terceros (solo contexto).') returning id into dev_plaza;
  insert into public.developments (org_id, code, name, city, address, chart_order, is_shared, description) values
    (o, 'TORRE', '[DEMO] Torre Prototipo', 'Ciudad Demo', 'Blvd. Inventado 220, Col. Maqueta', 2, false,
     'Edificio 100 % administrado por Stone en el prototipo.') returning id into dev_torre;

  -- Unidades Stone
  insert into public.units (org_id, development_id, code, name, kind, managed_by_org_id, owner_entity_id, occupancy, list_rent) values
    (o, dev_plaza, 'PL-101', '[DEMO] Local 101', 'local', o, ent_a, 'occupied', 58000) returning id into u_pl_101;
  insert into public.units (org_id, development_id, code, name, kind, managed_by_org_id, owner_entity_id, occupancy, list_rent) values
    (o, dev_plaza, 'PL-102', '[DEMO] Local 102', 'local', o, ent_a, 'occupied', 42000) returning id into u_pl_102;
  insert into public.units (org_id, development_id, code, name, kind, managed_by_org_id, owner_entity_id, occupancy, list_rent) values
    (o, dev_plaza, 'PL-103', '[DEMO] Local 103', 'local', o, ent_b, 'vacant', 36500) returning id into u_pl_103;
  insert into public.units (org_id, development_id, code, name, kind, managed_by_org_id, owner_entity_id, occupancy, list_rent) values
    (o, dev_plaza, 'PL-201', '[DEMO] Oficina 201', 'oficina', o, ent_b, 'occupied', 29000) returning id into u_pl_201;
  insert into public.units (org_id, development_id, code, name, kind, managed_by_org_id, owner_entity_id, occupancy) values
    (o, dev_plaza, 'PL-202', '[DEMO] Oficina 202', 'oficina', o, ent_b, 'unknown') returning id into u_pl_202;
  -- Unidades de terceros (referencia)
  insert into public.units (org_id, development_id, code, name, kind, reference_only, owner_entity_id) values
    (o, dev_plaza, 'PL-104', '[DEMO] Local 104 (tercero)', 'local', true, ent_3p) returning id into u_pl_104;
  insert into public.units (org_id, development_id, code, name, kind, reference_only, owner_entity_id) values
    (o, dev_plaza, 'PL-105', '[DEMO] Local 105 (tercero)', 'local', true, ent_3p) returning id into u_pl_105;
  insert into public.units (org_id, development_id, code, name, kind, reference_only, owner_entity_id) values
    (o, dev_plaza, 'PL-203', '[DEMO] Oficina 203 (tercero)', 'oficina', true, ent_3p) returning id into u_pl_203;
  -- Torre
  insert into public.units (org_id, development_id, code, name, kind, managed_by_org_id, owner_entity_id, occupancy, list_rent) values
    (o, dev_torre, 'TP-01', '[DEMO] Piso 1', 'oficina', o, ent_b, 'occupied', 95000) returning id into u_tp_01;
  insert into public.units (org_id, development_id, code, name, kind, managed_by_org_id, owner_entity_id, occupancy, list_rent) values
    (o, dev_torre, 'TP-02', '[DEMO] Piso 2', 'oficina', o, ent_b, 'occupied', 95000) returning id into u_tp_02;
  insert into public.units (org_id, development_id, code, name, kind, managed_by_org_id, owner_entity_id, occupancy, list_rent) values
    (o, dev_torre, 'TP-03', '[DEMO] Piso 3', 'oficina', o, ent_b, 'vacant', 90000) returning id into u_tp_03;
  insert into public.units (org_id, development_id, code, name, kind, managed_by_org_id, owner_entity_id, occupancy) values
    (o, null, 'TR-01', '[DEMO] Terreno Baldío Sur', 'terreno', o, ent_a, 'unavailable') returning id into u_terreno;

  -- Arrendatarios
  insert into public.tenants (org_id, display_name, kind) values (o, '[DEMO] Arrendatario Uno S.A.', 'persona_moral') returning id into t1;
  insert into public.tenants (org_id, display_name, kind) values (o, '[DEMO] Arrendataria Dos', 'persona_fisica') returning id into t2;
  insert into public.tenants (org_id, display_name, kind) values (o, '[DEMO] Corporativo Tres', 'persona_moral') returning id into t3;
  insert into public.tenants (org_id, display_name, kind) values (o, '[DEMO] Servicios Cuatro', 'persona_moral') returning id into t4;

  -- Contratos (renta pactada CON IVA, como la captura el reporte: base × 1.16)
  insert into public.leases (org_id, code, tenant_id, lessor_entity_id, development_id, status, start_date, end_date, source, verification) values
    (o, 'DEMO-L1', t1, ent_a, dev_plaza, 'active', '2025-03-01', '2027-02-28', 'demo', 'confirmado') returning id into l1;
  insert into public.lease_units (org_id, lease_id, unit_id) values (o, l1, u_pl_101);
  insert into public.lease_terms (org_id, lease_id, effective_from, effective_to, rent_total, due_day, deposit_amount, source) values
    (o, l1, '2025-03-01', '2026-02-28', 55680, 5, 96000, 'demo');
  insert into public.lease_terms (org_id, lease_id, effective_from, rent_total, due_day, deposit_amount, increase_rule, source) values
    (o, l1, '2026-03-01', 58000, 5, 96000, '{"rule":"INPC anual (documentado en anexo 1)"}', 'demo');

  insert into public.leases (org_id, code, tenant_id, lessor_entity_id, development_id, status, start_date, end_date, source, verification) values
    (o, 'DEMO-L2', t2, ent_a, dev_plaza, 'active', '2026-01-15', '2026-12-31', 'demo', 'por_verificar') returning id into l2;
  insert into public.lease_units (org_id, lease_id, unit_id) values (o, l2, u_pl_102);
  insert into public.lease_terms (org_id, lease_id, effective_from, rent_total, due_day, deposit_amount, source) values
    (o, l2, '2026-01-15', 41760, 1, 36000, 'demo');

  insert into public.leases (org_id, code, tenant_id, lessor_entity_id, development_id, status, start_date, end_date, source, verification) values
    (o, 'DEMO-L3', t3, ent_b, dev_torre, 'active', '2024-09-01', '2029-08-31', 'demo', 'confirmado') returning id into l3;
  insert into public.lease_units (org_id, lease_id, unit_id) values (o, l3, u_tp_01), (o, l3, u_tp_02);
  insert into public.lease_terms (org_id, lease_id, effective_from, rent_total, maintenance_total, due_day, deposit_amount, increase_rule, source) values
    (o, l3, '2024-09-01', 185600, 9860, 10, 320000, '{"rule":"4 % fijo anual (cláusula 7)"}', 'demo');

  insert into public.leases (org_id, code, tenant_id, lessor_entity_id, development_id, status, start_date, end_date, source, verification) values
    (o, 'DEMO-L4', t4, ent_b, dev_plaza, 'active', '2025-11-15', '2026-11-14', 'demo', 'confirmado') returning id into l4;
  insert into public.lease_units (org_id, lease_id, unit_id) values (o, l4, u_pl_201);
  insert into public.lease_terms (org_id, lease_id, effective_from, rent_total, due_day, deposit_amount, source) values
    (o, l4, '2025-11-15', 29000, 15, 50000, 'demo');

  insert into public.leases (org_id, code, tenant_id, lessor_entity_id, development_id, status, start_date, end_date, source, verification) values
    (o, 'DEMO-L5', t2, ent_b, dev_plaza, 'expired', '2024-01-01', '2025-12-31', 'demo', 'confirmado') returning id into l5;
  insert into public.lease_units (org_id, lease_id, unit_id) values (o, l5, u_pl_202);
  insert into public.lease_terms (org_id, lease_id, effective_from, effective_to, rent_total, due_day, deposit_amount, source) values
    (o, l5, '2024-01-01', '2025-12-31', 25520, 1, 22000, 'demo');

  -- Cargos (subtotal sin IVA; folio DEMO-<n>)
  create temp table demo_charges (key text, lease uuid, tenant uuid, unit uuid, dev uuid, period date, subtotal numeric, due date, concept public.charge_concept, src text) on commit drop;
  insert into demo_charges values
    ('c-l1-08', l1, t1, u_pl_101, dev_plaza, '2026-08-01', 50000, '2026-08-05', 'rent', 'excel'),
    ('c-l2-08', l2, t2, u_pl_102, dev_plaza, '2026-08-01', 36000, '2026-08-01', 'rent', 'excel'),
    ('c-l3-08', l3, t3, u_tp_01, dev_torre, '2026-08-01', 160000, '2026-08-10', 'rent', 'excel'),
    ('c-l4-08', l4, t4, u_pl_201, dev_plaza, '2026-08-01', 25000, '2026-08-15', 'rent', 'excel'),
    ('c-l1-09', l1, t1, u_pl_101, dev_plaza, '2026-09-01', 50000, '2026-09-05', 'rent', 'excel'),
    ('c-l2-09', l2, t2, u_pl_102, dev_plaza, '2026-09-01', 36000, '2026-09-01', 'rent', 'excel'),
    ('c-l3-09', l3, t3, u_tp_01, dev_torre, '2026-09-01', 160000, '2026-09-10', 'rent', 'excel'),
    ('c-l4-09', l4, t4, u_pl_201, dev_plaza, '2026-09-01', 25000, '2026-09-15', 'rent', 'excel'),
    ('c-l3-09m', l3, t3, u_tp_01, dev_torre, '2026-09-01', 8500, '2026-09-10', 'maintenance', 'excel'),
    ('c-l1-10', l1, t1, u_pl_101, dev_plaza, '2026-10-01', 50000, '2026-10-05', 'rent', 'captura'),
    ('c-l2-10', l2, t2, u_pl_102, dev_plaza, '2026-10-01', 36000, '2026-10-01', 'rent', 'captura'),
    ('c-l3-10', l3, t3, u_tp_01, dev_torre, '2026-10-01', 160000, '2026-10-10', 'rent', 'captura'),
    ('c-l4-10', l4, t4, u_pl_201, dev_plaza, '2026-10-01', 25000, '2026-10-15', 'rent', 'captura'),
    ('c-l3-10m', l3, t3, u_tp_01, dev_torre, '2026-10-01', 8500, '2026-10-10', 'maintenance', 'captura');

  create temp table demo_charge_ids (key text primary key, id uuid) on commit drop;
  for c in select * from demo_charges loop
    insert into public.charges (org_id, tenant_id, lease_id, unit_id, development_id, concept, period, invoice_folio, invoice_date, due_date, subtotal, tax_amount, source, notes)
    values (o, c.tenant, c.lease, c.unit, c.dev, c.concept, c.period, 'DEMO-' || c.key, c.period, c.due, c.subtotal, round(c.subtotal * 0.16, 2), 'demo', '[DEMO] origen simulado: ' || c.src)
    returning id into cid;
    insert into demo_charge_ids (key, id) values (c.key, cid);
  end loop;

  -- Pagos
  insert into public.payments (org_id, tenant_id, effective_date, amount, method, bank_ref, source) values (o, t1, '2026-08-04', 58000, 'transfer', 'REF-DEMO-0001', 'demo') returning id into p1;
  insert into public.payments (org_id, tenant_id, effective_date, amount, method, bank_ref, source) values (o, t2, '2026-08-02', 41760, 'transfer', 'REF-DEMO-0002', 'demo') returning id into p2;
  insert into public.payments (org_id, tenant_id, effective_date, amount, method, bank_ref, source) values (o, t3, '2026-08-09', 185600, 'transfer', 'REF-DEMO-0003', 'demo') returning id into p3;
  insert into public.payments (org_id, tenant_id, effective_date, amount, method, bank_ref, source) values (o, t4, '2026-08-14', 29000, 'transfer', 'REF-DEMO-0004', 'demo') returning id into p4;
  insert into public.payments (org_id, tenant_id, effective_date, amount, method, bank_ref, source) values (o, t1, '2026-09-03', 58000, 'transfer', 'REF-DEMO-0005', 'demo') returning id into p5;
  insert into public.payments (org_id, tenant_id, effective_date, amount, method, bank_ref, source) values (o, t2, '2026-09-10', 20000, 'cash', null, 'demo') returning id into p6;
  insert into public.payments (org_id, tenant_id, effective_date, amount, method, bank_ref, source) values (o, t3, '2026-09-09', 195460, 'transfer', 'REF-DEMO-0007', 'demo') returning id into p7;
  insert into public.payments (org_id, tenant_id, effective_date, amount, method, bank_ref, source) values (o, t1, '2026-10-05', 58000, 'transfer', 'REF-DEMO-0008', 'demo') returning id into p8;
  insert into public.payments (org_id, tenant_id, effective_date, amount, method, bank_ref, source) values (o, t3, '2026-10-12', 100000, 'transfer', 'REF-DEMO-0009', 'demo') returning id into p9;
  insert into public.payments (org_id, tenant_id, effective_date, amount, method, bank_ref, source) values (o, t4, '2026-10-28', 15000, 'transfer', 'REF-DEMO-0010', 'demo') returning id into p10;

  insert into public.payment_allocations (org_id, payment_id, charge_id, amount)
  select o, p, (select id from demo_charge_ids where key = k), a from (values
    (p1, 'c-l1-08', 58000::numeric), (p2, 'c-l2-08', 41760), (p3, 'c-l3-08', 185600), (p4, 'c-l4-08', 29000),
    (p5, 'c-l1-09', 58000), (p6, 'c-l2-09', 20000), (p7, 'c-l3-09', 185600), (p7, 'c-l3-09m', 9860),
    (p8, 'c-l1-10', 58000), (p9, 'c-l3-10', 100000)
  ) v(p, k, a);

  -- Gastos (total con IVA en el prototipo → se separa 16 %)
  insert into public.expenses (org_id, development_id, unit_id, category, vendor, period, subtotal, tax_amount, classification, recoverable, source) values
    (o, dev_plaza, null, 'maintenance', '[DEMO] Administración Plaza', '2026-10-01', round(18400/1.16, 2), 18400 - round(18400/1.16, 2), 'pending', false, 'demo'),
    (o, dev_torre, u_tp_01, 'electricity', '[DEMO] CFE', '2026-10-01', round(6120/1.16, 2), 6120 - round(6120/1.16, 2), 'tenant_passthrough', true, 'demo'),
    (o, dev_torre, null, 'water', '[DEMO] Agua y Drenaje', '2026-10-01', round(2340/1.16, 2), 2340 - round(2340/1.16, 2), 'stone_expense', false, 'demo'),
    (o, null, u_terreno, 'property_tax', '[DEMO] Tesorería Municipal', '2026-01-01', 14900, 0, 'stone_expense', false, 'demo'),
    (o, dev_plaza, u_pl_103, 'repairs', '[DEMO] Mantenimiento Delta', '2026-10-01', round(7800/1.16, 2), 7800 - round(7800/1.16, 2), 'stone_expense', false, 'demo'),
    (o, dev_plaza, null, 'insurance', '[DEMO] Aseguradora Épsilon', '2026-10-01', round(9300/1.16, 2), 9300 - round(9300/1.16, 2), 'stone_expense', false, 'demo'),
    (o, dev_torre, null, 'admin_fee', '[DEMO] Despacho Zeta', '2026-10-01', 10000, 1600, 'stone_expense', false, 'demo');
end $$;
