.PHONY: build publish 

ensure:
	@[ -d "node_modules" ] || npm install

build: ensure
	npx babel-node build.js
	npx parcel build src/client.jsx
	sed -i -E "s/URL=\/client.js.map/URL=\/dist\/client.js.map/" dist/client.js

publish: build
	bash $(MONOREPO_ROOT)/deploy/scripts/push-from-monorepo.sh \
		monorepo ridleywinters git@github.com:ridleywinters/ridleywinters.github.io

dev:
	npx nodemon --watch src --ext js,jsx --exec make run

run: build
	npx http-server -c-1 .

clean:
	rm -rf .cache
	rm -rf .parcel-cache
	rm -rf node_modules