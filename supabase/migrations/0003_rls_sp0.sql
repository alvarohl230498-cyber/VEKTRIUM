-- Politicas RLS de las 4 tablas de SP-0 (identidad, calendario, auditoria).
-- Ver docs/superpowers/specs/2026-07-29-vektrium-sp0-sp1-design.md seccion 6.

grant select, insert, update on users to authenticated;
grant select, insert, update, delete on authorized_users to authenticated;
grant select, insert, update, delete on calendar_connections to authenticated;
grant select, insert on audit_logs to authenticated;

alter table users enable row level security;
alter table authorized_users enable row level security;
alter table calendar_connections enable row level security;
alter table audit_logs enable row level security;

-- users: cada quien ve lo suyo; el admin ve todo.
create policy users_select on users for select to authenticated
  using (id = auth.uid() or public.is_founder_admin());

-- Nadie modifica su propio rol. Solo el admin actualiza filas de users.
create policy users_update_admin on users for update to authenticated
  using (public.is_founder_admin()) with check (public.is_founder_admin());

-- authorized_users: solo el admin.
create policy authorized_users_all on authorized_users for all to authenticated
  using (public.is_founder_admin()) with check (public.is_founder_admin());

-- calendar_connections: estrictamente del propietario.
create policy calendar_connections_own on calendar_connections for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- audit_logs: lectura para el admin y para PM en proyectos donde es
-- miembro (alcance 'member' de audit.read en la matriz). Insercion desde
-- cualquier sesion autenticada actuando como si misma. Sin politica de
-- update/delete: quedan prohibidos para todos, incluida authenticated.
create policy audit_logs_select on audit_logs for select to authenticated
  using (public.is_founder_admin());

create policy audit_logs_insert on audit_logs for insert to authenticated
  with check (actor_id = auth.uid());
