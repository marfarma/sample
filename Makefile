test:
	./node_modules/.bin/browserify test/test-mocha.js --debug > test/test.bundle.js
	./node_modules/.bin/mocha-phantomjs -s localToRemoteUrlAccessEnabled=true -s webSecurityEnabled=false test/runner-cli.html
	rm test/test.bundle.js
.PHONY: test