#!/data/data/com.termux/files/usr/bin/bash
set -e
ROOT="$HOME/KinoAIStudioComplete"
ZIP="$HOME/storage/downloads/KinoAIStudio_V01_AI_CHAT_FIXED_FIXED.zip"
STAMP=$(date +%Y%m%d_%H%M%S)
BACKUP="$HOME/KinoAIStudio_backup_V01_$STAMP"
TMP="$HOME/.kino_v01_apply_$STAMP"

[ -f "$ZIP" ] || { echo "ZIP topilmadi: $ZIP"; exit 1; }
[ -d "$ROOT" ] || { echo "Project topilmadi: $ROOT"; exit 1; }

mkdir -p "$BACKUP" "$TMP"
cp -a "$ROOT/src" "$BACKUP/"
cp -a "$ROOT/server" "$BACKUP/" 2>/dev/null || true
cp -a "$ROOT/package.json" "$BACKUP/"
cp -a "$ROOT/package-lock.json" "$BACKUP/" 2>/dev/null || true

unzip -q -o "$ZIP" -d "$TMP"

for f in src/main.tsx src/styles.css src/core/ruleEngine.ts src/engine3d/Professional3DPreview.tsx; do
  [ -f "$TMP/$f" ] || { echo "FIXED ZIP buzilgan: $f"; exit 1; }
done

cp -a "$TMP/src/main.tsx" "$ROOT/src/main.tsx"
cp -a "$TMP/src/styles.css" "$ROOT/src/styles.css"
cp -a "$TMP/src/core/ruleEngine.ts" "$ROOT/src/core/ruleEngine.ts"
cp -a "$TMP/src/engine3d" "$ROOT/src/"
rm -rf "$TMP"

cd "$ROOT"

ok=0
for i in 1 2 3; do
  echo "BUILD urinish $i/3..."
  if npm run build; then ok=1; break; fi
  sleep 2
done

[ "$ok" = 1 ] || {
  echo "BUILD o'tmadi. Backup: $BACKUP"
  exit 1
}

if [ -d android ]; then
  npx cap sync android || true
fi

pkill -f "vite.*KinoAIStudioComplete" 2>/dev/null || true
nohup npm run dev -- --host 0.0.0.0 > "$ROOT/kino_v01_dev.log" 2>&1 &
sleep 3

IP=$(ip route get 1.1.1.1 2>/dev/null | awk '{print $7;exit}')
[ -n "$IP" ] || IP="127.0.0.1"

echo "http://$IP:5173/"
am start -a android.intent.action.VIEW -d "http://$IP:5173/" com.android.chrome >/dev/null 2>&1 || true
