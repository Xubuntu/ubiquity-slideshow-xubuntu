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

for slide in $PODIR/*;
do
	slidename=$(basename $slide);
	echo "directory['$slidename'] = new Object();" >> $BUILDSLIDES/directory.js;

	if which po2html; then
		for locale in $slide/*.po;
		do
			if [ -e $locale ]; then
				localename=$(basename $locale .po)
				localeslides=$BUILDSLIDES/loc.$(basename $locale .po)
				
				[ ! -e $localeslides ] && mkdir -p $localeslides
				[ -e $localeslides/$slidename ] && rm -f $localeslides/$slidename
				po2html --notidy --progress=names -i $locale -t $SOURCESLIDES/$slidename -o $localeslides/$slidename \
					&& echo "directory['$slidename']['$localename'] = true;" >> $BUILDSLIDES/directory.js;
			fi
		done
	else
		echo "\nError: po2html is not available.";
	fi;
done;