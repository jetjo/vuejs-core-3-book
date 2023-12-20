# ENTRY=$0
ENTRY=$1
echo "./build.sh '$1'" >> build.sh.log
export ENTRY && pnpm build
