#!/bin/sh

cd `dirname $0`;
for icon in *.svg;
do

	iconpng='../slides/icons/'`basename $icon .svg`'.png';
	if [ -e $iconpng ];
		then rm $iconpng;
	fi;
done;