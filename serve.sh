# ENTRY=$0
if [ -z "$1" ]; then
    if [ -z "$ENTRY" ]; then
        echo "Usage: ./serve.sh <entry>"
        exit 1
    else
        echo "Using ENTRY: '$ENTRY'"
        pnpm serve
    fi
else
    ENTRY=$1
    echo "./serve.sh '$1'" >>serve.sh.log
    export ENTRY
    pnpm serve -- --no-open
fi
