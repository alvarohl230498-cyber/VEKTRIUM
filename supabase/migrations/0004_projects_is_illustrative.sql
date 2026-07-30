-- projects heredaba de Illustrative en src/data/types.ts pero la tabla no
-- tenia la columna. Detectado por la bateria de tests de RLS al sembrar
-- datos de prueba.
alter table projects add column is_illustrative boolean not null default false;
