test:
	@node node_modules/lab/bin/lab
test-cov:
	@node node_modules/lab/bin/lab -t 100
test-cov-lcov:
	@node node_modules/lab/bin/lab -t 100 -r lcov -o coverage.lcov
test-cov-html:
	@node node_modules/lab/bin/lab -r html -o coverage.html

.PHONY: test test-cov test-cov-lcov test-cov-html