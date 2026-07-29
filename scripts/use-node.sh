#!/usr/bin/env bash
# Activa Node 22 en la shell actual sin tocar el Node global del sistema.
#
# Uso:  source scripts/use-node.sh
#
# El Node del sistema es v18.17.0 y lo usan otros proyectos del usuario.
# Este repo fija su version en .node-version y la resuelve con fnm.

export PATH="$PATH:/c/Users/alvar/AppData/Local/Microsoft/WinGet/Links"

if ! command -v fnm >/dev/null 2>&1; then
  echo "ERROR: fnm no esta en PATH. Instalar con: winget install Schniz.fnm" >&2
  return 1 2>/dev/null || exit 1
fi

eval "$(fnm env --shell bash)"
fnm use 22 >/dev/null

echo "Node $(node --version) · pnpm $(pnpm --version)"
