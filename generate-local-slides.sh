#!/bin/bash

distro=$1
if [ -z $distro ]; then
	echo "Usage: $0 <distro>"
	exit -1
fi

SOURCE=.
BUILD=build
	
PODIR=$SOURCE/po/$distro
SOURCESLIDES=$SOURCE/slides/$distro
BUILDSLIDES=$BUILD/$distro/slides

echo "directory = new Object();" >> $BUILDSLIDES/directory.js;

if which po2html; then
	for locale in $PODIR/*.po; do
		localename=$(basename $locale .po);
		localeslides=$BUILDSLIDES/loc.$localename;
		[ ! -e $localeslides ] && mkdir -p $localeslides;
		
		echo "directory['$localename'] = new Object();" >> $BUILDSLIDES/directory.js;
		
		for slide in $SOURCESLIDES/*.html; do
			slidename=$(basename $slide);
			outputslide="$localeslides/$slidename";
			echo "$slide";
			[ -e $outputslide ] && rm -f $outputslide;
			
			po2html --notidy --progress=names -i $locale -t $slide -o $outputslide \
			&& if [ `diff $slide $outputslide` = ""]; then
				rm $outputslide;
				rmdir $localeslides;
			else
				echo "directory['$localename']['$slidename'] = true;" >> $BUILDSLIDES/directory.js;
			fi;
		done;
	done;
else
	echo "\nError: po2html is not available.";
fi;
