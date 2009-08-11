#!/bin/sh

for slide in slides/*.html;
do
	slidename=`basename $slide`;
	mkdir -p "po/$slidename";
	html2po -P $slide -o "po/$slidename/template.pot";
done;