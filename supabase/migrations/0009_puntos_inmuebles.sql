-- 0009 · Vista de puntos de inmueble para el mapa: expone lon/lat de la
-- geometría vigente de cada desarrollo (PostgREST no puede leer geography).

create or replace view public.development_points
with (security_invoker = true) as
select
  g.target_id as development_id,
  g.org_id,
  extensions.st_x(g.geom::extensions.geometry) as lon,
  extensions.st_y(g.geom::extensions.geometry) as lat,
  g.geom_type,
  g.precision_m,
  g.source,
  g.method,
  g.captured_at
from public.geometries g
where g.target_type = 'development' and g.is_current;

grant select on public.development_points to authenticated;
