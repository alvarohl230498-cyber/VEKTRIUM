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

# fnm expone Node 22 mediante un symlink "multishell" temporal. Bash lo sabe
# ejecutar bien (exec POSIX), pero procesos nativos de Windows spawneados por
# pnpm/npm (via cmd.exe) no siempre resuelven ejecutables a traves de ese
# symlink, y caen de vuelta al Node 18 del sistema. Para que `pnpm build`,
# `pnpm dev`, etc. tambien usen Node 22, apuntamos ademas la variable nativa
# de Windows "Path" al directorio real (no symlink) de la instalacion.
NODE_BIN_DIR="$(dirname "$(command -v node)")"
if [ -L "$NODE_BIN_DIR" ]; then
  REAL_NODE_DIR="$(cd "$NODE_BIN_DIR" && pwd -P)"
else
  REAL_NODE_DIR="$NODE_BIN_DIR"
fi
export PATH="$REAL_NODE_DIR:$PATH"
if command -v cygpath >/dev/null 2>&1; then
  export Path="$(cygpath -wp "$PATH")"
fi

echo "Node $(node --version) · pnpm $(pnpm --version)"
