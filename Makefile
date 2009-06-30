# Makefile for ubiquity-slideshow-ubuntu

SOURCE=.
BASE=build

all: translation

translation: clean
	for slide in `ls po`; do \
		for locale in `ls po/$$slide/*.po`; do \
			newslides=$(BASE)/slides.`basename $$locale .po`; \
			if ! test -e $$newslides; \
			then \
				mkdir -p $$newslides; \
			fi; \
			if test -e $$newslides/$$slide; \
			then \
				rm -f $$newslides/$$slide; \
			fi; \
			po2html -i $$locale -t $(SOURCE)/slides/$$slide -o $$newslides/$$slide; \
		done; \
	done;

clean:
	rm -rf $(BASE)
