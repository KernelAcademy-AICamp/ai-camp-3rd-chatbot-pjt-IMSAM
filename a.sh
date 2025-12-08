#!/usr/bin/env bash
# ============================================================
#  zlib + Base64 Prompt Compressor for Claude / LLM
#  -----------------------------------------------
#  - UTF-8 텍스트를 zlib(deflate)로 압축 후 Base64로 인코딩
#  - 역으로 Base64 → zlib 해제 → UTF-8 디코딩도 지원
#  - Claude / GPT / DeepSeek 등 LLM 프롬프트 최적화용
#
#  사용법:
#    1) 압축(인코딩)
#       ./prompt_zlib_b64.sh encode input.txt
#       cat input.txt | ./prompt_zlib_b64.sh encode
#
#    2) 복원(디코딩)
#       ./prompt_zlib_b64.sh decode encoded.txt
#       echo "eNqL..." | ./prompt_zlib_b64.sh decode
#
#  의존성:
#    - bash
#    - python3 (표준 라이브러리 zlib, base64 사용)
#
#  작성자: YOU (최고 개발자 오너 버전 😎)
# ============================================================

set -euo pipefail

MODE="${1:-}"
FILE="${2:-}"

usage() {
  cat << 'EOF'
사용법:
  압축(인코딩):
    ./prompt_zlib_b64.sh encode input.txt
    cat input.txt | ./prompt_zlib_b64.sh encode

  복원(디코딩):
    ./prompt_zlib_b64.sh decode encoded.txt
    echo "eNqL..." | ./prompt_zlib_b64.sh decode
EOF
}

# -----------------------------
# 0. python3 체크
# -----------------------------
if ! command -v python3 >/dev/null 2>&1; then
  echo "❌ python3 명령을 찾을 수 없습니다. python3를 설치해 주세요." >&2
  exit 1
fi

if [[ -z "$MODE" ]]; then
  echo "❌ 모드(encode | decode)를 지정해 주세요."
  usage
  exit 1
fi

# -----------------------------
# 1. 입력 데이터 가져오기 (파일 또는 stdin)
# -----------------------------
read_input() {
  if [[ -n "$FILE" ]]; then
    if [[ ! -f "$FILE" ]]; then
      echo "❌ 파일을 찾을 수 없습니다: $FILE" >&2
      exit 1
    fi
    cat "$FILE"
  else
    # stdin에서 읽기
    cat
  fi
}

# -----------------------------
# 2. encode: UTF-8 → zlib → Base64
# -----------------------------
encode() {
  read_input | python3 - "$@" << 'PY'
import sys
import zlib
import base64

data = sys.stdin.read()
if not data:
  # 빈 입력은 그냥 종료
  sys.exit(0)

raw = data.encode("utf-8")
compressed = zlib.compress(raw, level=9)  # 최대 압축
b64 = base64.b64encode(compressed).decode("ascii")
print(b64)
PY
}

# -----------------------------
# 3. decode: Base64 → zlib → UTF-8
# -----------------------------
decode() {
  read_input | python3 - "$@" << 'PY'
import sys
import zlib
import base64

data = sys.stdin.read().strip()
if not data:
  sys.exit(0)

try:
  compressed = base64.b64decode(data)
  raw = zlib.decompress(compressed)
  text = raw.decode("utf-8")
  print(text)
except Exception as e:
  sys.stderr.write(f"❌ 디코딩/디컴프레션 실패: {e}\n")
  sys.exit(1)
PY
}

case "$MODE" in
  encode)
    encode
    ;;
  decode)
    decode
    ;;
  *)
    echo "❌ 알 수 없는 모드: $MODE (encode | decode 중 선택)"
    usage
    exit 1
    ;;
esac
