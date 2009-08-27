#!/bin/sh
set -e
for slide in slides/*.html; do
	slidename="$(basename $slide)"
	[ "$slidename" = "index.html" ] && continue
	mkdir -p "po/$slidename"
	html2po -P $slide -o "po/$slidename/template.pot"
done
