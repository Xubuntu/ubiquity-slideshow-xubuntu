#!/bin/sh
set -e

mkpo ()
{
	slides="slides/$1/*.html"
	
	for slide in $slides; do
		slidename="$(basename $slide)"
		[ "$slidename" = "index.html" ] && continue
		mkdir -p "po/$1/$slidename"
		html2po -P $slide -o "po/$1/$slidename/template.pot"
	done
}

mkpo "ubuntu"
mkpo "kubuntu"

