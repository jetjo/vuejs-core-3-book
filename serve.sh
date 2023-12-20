# ENTRY=$0
ENTRY=$1
echo "./serve.sh '$1'" >> serve.sh.log
export ENTRY && pnpm serve
