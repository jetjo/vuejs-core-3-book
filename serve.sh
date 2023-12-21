# ENTRY=$0
IS_WEBPACK_DEV_SERVER=true
export IS_WEBPACK_DEV_SERVER

if [ -z "$1" ]; then
    if [ -z "$ENTRY" ]; then
        echo "Usage: ./serve.sh <entry>"
        exit 1
    else
        echo "Using ENTRY: '$ENTRY'"
        pnpm serve -- --open
    fi
else
    ENTRY=$1
    echo "./serve.sh '$1'" >>serve.sh.log
    export ENTRY
    pnpm serve -- --open
fi
