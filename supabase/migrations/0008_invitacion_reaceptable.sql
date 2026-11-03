-- 0008 · Una invitación aceptada vuelve a dar membresía si el usuario se crea
-- de nuevo (p. ej. se borró del dashboard y se reinvitó). Antes solo contaban
-- las pendientes, y el segundo usuario quedaba sin acceso.

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  inv record;
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;

  for inv in
    select * from public.invitations
    where lower(email) = lower(new.email)
      and (status = 'accepted' or (status = 'pending' and expires_at > now()))
  loop
    insert into public.memberships (org_id, profile_id, role)
    values (inv.org_id, new.id, inv.role)
    on conflict (org_id, profile_id) do update set role = excluded.role, status = 'active';
    update public.invitations set status = 'accepted', accepted_at = coalesce(accepted_at, now()) where id = inv.id;
  end loop;
  return new;
end $$;

-- Reparación: usuarios ya creados cuya invitación está aceptada pero sin membresía.
insert into public.memberships (org_id, profile_id, role)
select i.org_id, p.id, i.role
from public.invitations i
join public.profiles p on lower(p.email) = lower(i.email)
where i.status = 'accepted'
on conflict (org_id, profile_id) do update set role = excluded.role, status = 'active';
