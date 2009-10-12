#!/bin/sh
set -e
if [ $# -gt 0 ]; then
	slides="$@"
	echo "argument handled?"
else
	slides="slides/*.html"
fi
for slide in $slides; do
	slidename="$(basename $slide)"
	[ "$slidename" = "index.html" ] && continue
	mkdir -p "po/$slidename"
	html2po -P $slide -o "po/$slidename/template.pot"
done

