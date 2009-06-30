# Makefile for ubiquity-slideshow-ubuntu

SOURCE=.
BASE=build/

all: clean translation

translation:
	for slide in `ls po`; do \
		for translation in `ls po/$$slide/*.po`; do \
			langname=`basename $$translation .po`; \
			mkdir -p $(BASE)/slides.$$langname; \
			po2html -i $$translation -t $(SOURCE)/slides/$$slide -o $(BASE)/slides.$$langname/$$slide; \
		done; \
	done;

clean:
	rm -rf $(BASE);
