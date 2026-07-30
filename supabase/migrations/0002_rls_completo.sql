-- Politicas RLS para las 13 tablas de VEKTRIUM OS.
--
-- El rol que conecta la app (vektrium_app, ver src/db/client.ts) NO tiene
-- BYPASSRLS, a diferencia de "postgres" (usado solo por src/db/admin y
-- migraciones). Estas politicas son la unica linea de defensa real.
--
-- Funciones auxiliares SECURITY DEFINER: evitan recursion infinita al
-- consultar project_members desde su propia politica, y encapsulan la logica
-- de "rol efectivo" (global u de proyecto, el mas permisivo) de
-- src/domain/permissions.ts en SQL.

create or replace function public.current_role_name() returns text
language sql stable security definer set search_path = public
as $$
  select role::text from users where id = auth.uid();
$$;

create or replace function public.is_founder_admin() returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce(public.current_role_name() = 'FOUNDER_ADMIN', false);
$$;

create or replace function public.is_project_manager() returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce(public.current_role_name() = 'PROJECT_MANAGER', false);
$$;

-- Alcance 'member': existe fila en project_members para este usuario y proyecto.
create or replace function public.is_project_member(p_project_id uuid) returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from project_members
    where project_id = p_project_id and user_id = auth.uid()
  );
$$;

-- Un cliente es "propio" de un usuario con membresia si tiene al menos un
-- proyecto de ese cliente donde el usuario es miembro. Es la unica forma hoy
-- de acotar clients/contacts a "member": no existe una tabla de membresia a
-- nivel de cliente, solo a nivel de proyecto.
create or replace function public.is_client_member(p_client_id uuid) returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from projects p
    join project_members pm on pm.project_id = p.id
    where p.client_id = p_client_id and pm.user_id = auth.uid()
  );
$$;

create or replace function public.is_meeting_related(p_meeting_id uuid) returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from meetings m
    left join project_members pm on pm.project_id = m.project_id and pm.user_id = auth.uid()
    left join meeting_attendees ma on ma.meeting_id = m.id and ma.user_id = auth.uid()
    where m.id = p_meeting_id
      and (pm.user_id is not null or ma.user_id is not null or m.organizer_id = auth.uid())
  );
$$;

-- Permisos de tabla para el rol authenticated. RLS decide que filas, esto que
-- operaciones son alcanzables en absoluto.
grant select, insert, update, delete on
  clients, contacts, opportunities, projects, project_members, project_phases,
  tasks, meetings, meeting_attendees
to authenticated;

alter table clients enable row level security;
alter table contacts enable row level security;
alter table opportunities enable row level security;
alter table projects enable row level security;
alter table project_members enable row level security;
alter table project_phases enable row level security;
alter table tasks enable row level security;
alter table meetings enable row level security;
alter table meeting_attendees enable row level security;

-- ============================================================ clients
-- FOUNDER_ADMIN y PROJECT_MANAGER: alcance 'all' (ven y editan cualquier
-- cliente). Los demas roles: 'member', via proyectos compartidos.
create policy clients_select on clients for select to authenticated
  using (public.is_founder_admin() or public.is_project_manager() or public.is_client_member(id));

create policy clients_write on clients for insert to authenticated
  with check (public.is_founder_admin() or public.is_project_manager());

create policy clients_update on clients for update to authenticated
  using (public.is_founder_admin() or public.is_project_manager())
  with check (public.is_founder_admin() or public.is_project_manager());

-- ============================================================ contacts
create policy contacts_select on contacts for select to authenticated
  using (
    public.is_founder_admin() or public.is_project_manager()
    or public.is_client_member(client_id)
  );

create policy contacts_write on contacts for insert to authenticated
  with check (public.is_founder_admin() or public.is_project_manager());

create policy contacts_update on contacts for update to authenticated
  using (public.is_founder_admin() or public.is_project_manager())
  with check (public.is_founder_admin() or public.is_project_manager());

-- ============================================================ opportunities
-- Solo FOUNDER_ADMIN y PROJECT_MANAGER tienen algun acceso (regla 7: nunca
-- se eliminan, por eso no hay politica de DELETE — el grant tampoco importa
-- porque ninguna politica lo permite, asi que toda fila queda protegida).
create policy opportunities_select on opportunities for select to authenticated
  using (public.is_founder_admin() or public.is_project_manager());

create policy opportunities_write on opportunities for insert to authenticated
  with check (public.is_founder_admin() or public.is_project_manager());

create policy opportunities_update on opportunities for update to authenticated
  using (public.is_founder_admin() or public.is_project_manager())
  with check (public.is_founder_admin() or public.is_project_manager());

-- ============================================================ projects
create policy projects_select on projects for select to authenticated
  using (public.is_founder_admin() or public.is_project_member(id));

create policy projects_write on projects for insert to authenticated
  with check (public.is_founder_admin() or public.is_project_manager());

create policy projects_update on projects for update to authenticated
  using (public.is_founder_admin() or (public.is_project_manager() and public.is_project_member(id)))
  with check (public.is_founder_admin() or (public.is_project_manager() and public.is_project_member(id)));

-- ============================================================ project_members
-- Un usuario ve las membresias de los proyectos donde el mismo es miembro
-- (para saber su propio rol ahi), o todo si es FOUNDER_ADMIN.
create policy project_members_select on project_members for select to authenticated
  using (public.is_founder_admin() or user_id = auth.uid() or public.is_project_member(project_id));

create policy project_members_write on project_members for insert to authenticated
  with check (public.is_founder_admin() or public.is_project_manager());

create policy project_members_delete on project_members for delete to authenticated
  using (public.is_founder_admin() or public.is_project_manager());

-- ============================================================ project_phases
-- 'member' para TODOS los roles con membresia (correccion sobre el spec
-- original: no se puede pintar un Planner agrupado por fases sin leerlas).
create policy project_phases_select on project_phases for select to authenticated
  using (public.is_founder_admin() or public.is_project_member(project_id));

create policy project_phases_write on project_phases for insert to authenticated
  with check (public.is_founder_admin() or (public.is_project_manager() and public.is_project_member(project_id)));

create policy project_phases_update on project_phases for update to authenticated
  using (public.is_founder_admin() or (public.is_project_manager() and public.is_project_member(project_id)))
  with check (public.is_founder_admin() or (public.is_project_manager() and public.is_project_member(project_id)));

create policy project_phases_delete on project_phases for delete to authenticated
  using (public.is_founder_admin() or (public.is_project_manager() and public.is_project_member(project_id)));

-- ============================================================ tasks
-- Lectura: cualquier miembro del proyecto. Escritura: PM/admin si es
-- miembro, o el propio asignado (alcance 'assignee' de COLLABORATOR).
create policy tasks_select on tasks for select to authenticated
  using (public.is_founder_admin() or public.is_project_member(project_id));

create policy tasks_write on tasks for insert to authenticated
  with check (public.is_founder_admin() or (public.is_project_manager() and public.is_project_member(project_id)));

create policy tasks_update on tasks for update to authenticated
  using (
    public.is_founder_admin()
    or (public.is_project_manager() and public.is_project_member(project_id))
    or assignee_id = auth.uid()
  )
  with check (
    public.is_founder_admin()
    or (public.is_project_manager() and public.is_project_member(project_id))
    or assignee_id = auth.uid()
  );

-- ============================================================ meetings
-- meeting.create/update son 'all' para PROJECT_MANAGER en la matriz (una
-- reunion se agenda antes de que exista proyecto). meeting.read es 'member'
-- para la mayoria de roles; se añade el organizador y los asistentes porque
-- quien crea o asiste a una reunion debe poder verla, algo que la matriz no
-- contradice (no define alcance "organizador" pero tampoco lo prohibe).
create policy meetings_select on meetings for select to authenticated
  using (public.is_founder_admin() or public.is_meeting_related(id));

create policy meetings_write on meetings for insert to authenticated
  with check (public.is_founder_admin() or public.is_project_manager());

create policy meetings_update on meetings for update to authenticated
  using (public.is_founder_admin() or public.is_project_manager() or organizer_id = auth.uid())
  with check (public.is_founder_admin() or public.is_project_manager() or organizer_id = auth.uid());

-- ============================================================ meeting_attendees
create policy meeting_attendees_select on meeting_attendees for select to authenticated
  using (public.is_founder_admin() or public.is_meeting_related(meeting_id));

create policy meeting_attendees_write on meeting_attendees for insert to authenticated
  with check (public.is_founder_admin() or public.is_project_manager());

create policy meeting_attendees_delete on meeting_attendees for delete to authenticated
  using (public.is_founder_admin() or public.is_project_manager());
