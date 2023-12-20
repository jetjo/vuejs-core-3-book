# ENTRY=$0
if [ -z "$1" ]; then
    if [ -z "$ENTRY" ]; then
        echo "Usage: ./build.sh <entry>"
        exit 1
    else
        echo "Using ENTRY: '$ENTRY'"
        pnpm build
    fi
else
    ENTRY=$1
    echo "./build.sh '$1'" >>build.sh.log
    export ENTRY && pnpm build
fi
