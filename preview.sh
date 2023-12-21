# ENTRY=$0
PUB_PATH=/assets/
export PUB_PATH
IS_WEBPACK_DEV_SERVER=
export IS_WEBPACK_DEV_SERVER

DISK_OUT_BASE_PATH=./dist
export DISK_OUT_BASE_PATH

if [ -z "$2" ]; then
    PORT=3001
else
    PORT=$2
fi

export PORT

# http_serve_opt=" $DISK_OUT_BASE_PATH -g -b"

if [ -z "$1" ]; then
    if [ -z "$ENTRY" ]; then
        echo "Usage: ./preview.sh <entry>"
        exit 1
    else
        echo "Using ENTRY: '$ENTRY'"
        pnpm build -- --watch &
        pnpm preview -- $DISK_OUT_BASE_PATH
    fi
else
    ENTRY=$1
    echo "./preview.sh '$1'" >>preview.sh.log
    export ENTRY
    pnpm build -- --watch &
    pnpm preview -- $DISK_OUT_BASE_PATH
fi
