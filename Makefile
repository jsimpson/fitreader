.PHONY: test lint

lint:
	deno fmt --check
	deno lint --unstable

test:
	deno test --allow-read
