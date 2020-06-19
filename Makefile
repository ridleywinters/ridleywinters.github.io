

clean:
	rm -rf node_modules

node_modules:
	npm install

ensure: node_modules

build: ensure
	npx sea build data .

publish:
	@echo "NOT YET IMPLEMENTED"

dev:
	@echo "NOT YET IMPLEMENTED"

publish: build
	bash $(MONOREPO_ROOT)/deploy/scripts/push-from-monorepo.sh \
		monorepo ridleywinters git@github.com:ridleywinters/ridleywinters.github.io