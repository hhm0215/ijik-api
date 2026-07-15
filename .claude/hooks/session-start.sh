#!/usr/bin/env bash
# SessionStart: Mac/Windows 작업 머신에서 origin/main보다 오래된 코드로 시작하지 않게 한다.
# 오프라인 또는 원격 접근 실패는 작업 자체를 막지 않는다.
git fetch --quiet origin main 2>/dev/null || exit 0
behind=$(git rev-list --count HEAD..origin/main 2>/dev/null) || exit 0
ahead=$(git rev-list --count origin/main..HEAD 2>/dev/null) || exit 0

if [ "${behind:-0}" -gt 0 ]; then
  msg="로컬이 origin/main보다 ${behind}커밋 뒤처짐"
  if [ "${ahead:-0}" -gt 0 ]; then
    msg="$msg (로컬 전용 커밋 ${ahead}개 있음 — 갈라짐)"
  fi
  printf '{"systemMessage":"⚠ %s — 동기화 후 작업","hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"%s. 작업 시작 전 원격 변경을 안전하게 반영할 것."}}\n' "$msg" "$msg"
fi

exit 0
