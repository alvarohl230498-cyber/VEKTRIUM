-- Fase "actual" de cada proyecto para el tablero de /os/proyectos (vista
-- Tablero): el equipo la mueve a mano, sin relacion con el avance calculado
-- por tareas. Backfill: cada proyecto existente queda en su fase de menor
-- order (todo proyecto ya tiene sus 9 fases desde que se creo).
alter table projects add column current_phase_id uuid references project_phases(id) on delete set null;

create index projects_current_phase_id_idx on projects (current_phase_id);

update projects p
set current_phase_id = (
  select pp.id from project_phases pp
  where pp.project_id = p.id
  order by pp.order asc
  limit 1
)
where p.current_phase_id is null;
