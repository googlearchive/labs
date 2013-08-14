#!/bin/sh
node ../../vulcanize/vulcan.js -v --csp -i dev.html -o imports.html
mv index-vulcanized.html app.html
