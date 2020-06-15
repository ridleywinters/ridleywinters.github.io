.PHONY: build publish 

ensure:
	@[ -d "node_modules" ] || npm install

build: ensure
	npx webpack-cli \
		--mode production \
		--entry ./src/client.jsx \
		--output-public-path dist \
		--output-filename client.bundle.js	

build-database: ensure
	cd $(MONOREPO_ROOT)/source/node/cmd/sea && \
		npx babel-node src/build.js \
		build \
		$(MONOREPO_ROOT)/source/html/sites/ridleywinters.github.io/data/ridley  \
		$(MONOREPO_ROOT)/source/html/sites/ridleywinters.github.io/database.json 

publish: build
	bash $(MONOREPO_ROOT)/deploy/scripts/push-from-monorepo.sh \
		monorepo ridleywinters git@github.com:ridleywinters/ridleywinters.github.io

run: build
	npx http-server -c-1 .

clean:
	rm -rf .cache
	rm -rf .parcel-cache
	rm -rf node_modules

#
# Use a bash script since we want a single make command to run multiple
# background processes.
#
define DEV_SCRIPT
shutdown() {
    echo kill $(jobs -l |awk '$2 == "|" {print $1; next} {print $2}')
    kill $(jobs -l |awk '$2 == "|" {print $1; next} {print $2}')
    exit 0
}
trap "shutdown" SIGINT SIGTERM

make -C ${MONOREPO_ROOT}/source/node/cmd/sea build
npx nodemon --watch data --watch ${MONOREPO_ROOT}/source/node/cmd/sea/src --ext js,jsx,mdx --exec make build-database &

npx nodemon --watch data --watch data --ext js,jsx,mdx --exec make build-database &

sleep 1

npx webpack-dev-server \
		--mode development \
		--entry ./src/client.jsx \
		--output-public-path dist \
		--output-filename client.bundle.js &
wait
endef
export DEV_SCRIPT

dev:
	@bash -c "$$DEV_SCRIPT"


