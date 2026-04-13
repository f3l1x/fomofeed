.PHONY: install clean generate generate-full debug serve test lint typecheck fmt ci web web-dev web-install

# Setup
install:
	bun install

web-install:
	cd web && bun install

clean:
	rm -rf feeds/ cache/ public/

# Feed Generation
generate:
ifdef FEED
	bun run src/cli.ts generate --feed=$(FEED)
else
	bun run src/cli.ts generate
endif

generate-full:
	bun run src/cli.ts generate --full

debug:
	bun run src/cli.ts debug --feed=$(FEED)

# Web
web:
	cd web && bun run build

web-dev:
	cd web && bun run dev

# Server
serve:
	bun run src/cli.ts serve $(if $(PORT),--port=$(PORT),)

# Development
test:
	bun test

lint:
	bun x eslint 'src/**/*.ts'

typecheck:
	bun x tsc --noEmit

fmt:
	bun x prettier --write 'src/**/*.ts' 'tests/**/*.ts'

# CI
ci: install web-install generate web test
