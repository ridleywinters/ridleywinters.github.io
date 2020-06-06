set -x #echo on

shutdown() {
    echo kill 
    kill 
    exit 0
}
trap "shutdown" SIGINT SIGTERM

npx webpack-dev-server --mode development --entry ./src/client.jsx --output-filename client.bundle.js &
wait
