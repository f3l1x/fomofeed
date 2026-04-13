.PHONY: install clean generate generate-full debug serve test lint typecheck fmt ci

# Setup
install:
	bun install

clean:
	rm -rf feeds/ cache/

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
ci: install generate test
