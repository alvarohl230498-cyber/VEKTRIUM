import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    // src/db/admin/client.ts y src/data/supabase/store.ts empiezan con
    // `import 'server-only'`, cuyo package.json solo resuelve al modulo
    // vacio bajo la condicion de exports "react-server" (la que activa el
    // bundler de Next.js en build). Sin declarar esta condicion aqui, Vite
    // cae al export por defecto (el que lanza), y ningun test que importe
    // (aunque sea transitivamente) esos modulos podria cargar. Ningun test
    // de este repo renderiza React ni importa next/server, asi que ampliar
    // las condiciones de resolucion no tiene otro efecto observable.
    conditions: ['react-server'],
  },
  // Vitest ejecuta los tests de entorno "node" a traves del resolvedor SSR
  // de Vite, que tiene su PROPIA lista de condiciones (separada de
  // resolve.conditions de arriba, que solo aplica al build de cliente).
  ssr: {
    resolve: {
      conditions: ['react-server'],
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/e2e/**'],
  },
})
