.PHONY: test lint

lint:
	deno fmt --check *.ts
	deno lint --unstable *.ts

test:
	deno test --allow-read
