#!/bin/bash

distro=$1
if [ -z $distro ]; then
	echo "Usage: $0 <distro>"
	exit -1
fi

SOURCE=.
BUILD=build
	
PODIR=$SOURCE/po/$distro
BUILDSLIDES=$BUILD/$distro/slides

echo "directory = new Object();" >> $BUILDSLIDES/directory.js;

for slide in $BUILDSLIDES/*.html; do
	newslide="$slide.new";
	mv $slide $newslide;
	#htmlclean removes all comments and whitespace, leaves behind *.bak
	#htmlclean $newslide && rm "$newslide.bak";
	#run po2html on source slides for consistent formatting
	po2html --notidy --progress=none -i po/null.po -t $newslide -o $slide;
	rm $newslide;
done;

if which po2html; then
	for locale in $PODIR/*.po; do
		if [ -e $locale ]; then
			localename=$(basename $locale .po);
			localeslides=$BUILDSLIDES/loc.$localename;
			
			echo "directory['$localename'] = new Object();" >> $BUILDSLIDES/directory.js;
			echo "Found locale: $locale";
			
			for slide in $BUILDSLIDES/*.html; do
				slidename=$(basename $slide);
				[ $slidename = "index.html" ] && continue;
				
				outputslide="$localeslides/$slidename";
				[ -e $outputslide ] && rm -f $outputslide;
				[ ! -e $localeslides ] && mkdir -p $localeslides;
				
				po2html --notidy --progress=names -i $locale -t $slide -o $outputslide;
				cmp $slide $outputslide;
				if [ $? -eq 0 ]; then
					#remove new slide if it's the same as the default
					rm $outputslide;
					rmdir $localeslides; #will only succeed if dir is empty
					echo "$slide was not translated for $locale";
				else
					echo "directory['$localename']['$slidename'] = true;" >> $BUILDSLIDES/directory.js;
					echo "$slide was translated for $locale locale";
				fi;
			done;
		fi;
	done;
else
	echo "\nError: po2html is not available.";
fi;
