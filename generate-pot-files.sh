#!/bin/sh
set -e

mkpo ()
{
	mkdir -p "po/$1"
	
	for slide in slideshows/$1/slides/*.html; do
		slidename="$(basename $slide)"
		[ "$slidename" = "index.html" ] && continue
		mkdir -p "po/$1/.tmp"
		html2po -P $slide -o "po/$1/.tmp/$slidename.pot"
	done
	
	msgcat po/$1/.tmp/*.pot > "po/$1/slideshow-$1.pot"
	rm -r "po/$1/.tmp"
}

mkpo "ubuntu"
mkpo "ubuntu-upgrade"
mkpo "kubuntu"
mkpo "xubuntu"
