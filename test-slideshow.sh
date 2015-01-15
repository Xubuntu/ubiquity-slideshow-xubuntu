#!/bin/bash

TITLE="Slideshow tester"

SOURCE=.
BUILD=$SOURCE/build
SOURCESLIDES=$SOURCE/slideshows

slideshow=$1
if [ -z "$slideshow" ]
	then
		slideshows=""
		for show in $SOURCESLIDES/*; do
			showname=$(basename $show)
			#oddly placed files we need to ignore
			[ $showname = "link-core" ] && continue
			#if we're still going, add this slideshow to the list
			select=FALSE
			[ $showname = "ubuntu" ] && select=TRUE
			slideshows="$slideshows $select $showname"
		done
		slideshow=$(zenity --list --radiolist --column="Pick" --column="Slideshow" $slideshows --title="$TITLE" --text="Choose a slideshow to test")
		[ "$slideshow" = "" ] | [ "$slideshow" = "(null)" ] && exit
fi

language=$2
if [ -n "$language" ]
	then
		make test.$slideshow.$language
	else
		make clean
		make test.$slideshow
fi

