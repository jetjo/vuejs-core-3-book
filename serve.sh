echo "arg1: $1"
echo "arg2: $2"
# ENTRY=$0

IS_WEBPACK_DEV_SERVER=true
export IS_WEBPACK_DEV_SERVER

if [ -z "$2" ]; then
    SERVE_OPT="--open" # 等号两边不能有空格,否则等号左边被当成了命令, 我草泥马
else
    SERVE_OPT="$2"
fi
# echo "SERVE_OPT: $SERVE_OPT"

if [ -z "$3" ]; then
    DEV_PORT=3002
else
    DEV_PORT="$3"
fi

export DEV_PORT

if [ -z "$1" ]; then
    if [ -z "$ENTRY" ]; then
        echo "Usage: ./serve.sh <entry>"
        exit 1
    else
        echo "Using ENTRY: '$ENTRY'"
        pnpm serve -- "$SERVE_OPT"
    fi
else
    ENTRY=$1
    echo "./serve.sh '$1' '$2' '$3'" >>serve.sh.log
    export ENTRY
    pnpm serve -- "$SERVE_OPT"
fi
