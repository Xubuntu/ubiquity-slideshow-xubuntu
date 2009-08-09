# Makefile for ubiquity-slideshow-ubuntu

SOURCE=.
SOURCESLIDES=$(SOURCE)/slides
BUILD=build

all: icons
	mkdir -p $(BUILD);
	cp -r $(SOURCESLIDES) $(BUILD)/slides;
	cp slideshow.conf $(BUILD)
	
	for slide in po/*; \
	do \
		slidename=`basename $$slide`; \
		for locale in $$slide/*.po; \
		do \
			if [ -e $$locale ]; \
			then \
				buildslides=$(BUILD)/slides.`basename $$locale .po`; \
				[ ! -e $$buildslides ] && mkdir -p $$buildslides; \
				[ -e $$buildslides/$$slidename ] && rm -f $$buildslides/$$slidename; \
				po2html -i $$locale -t $(SOURCESLIDES)/$$slidename -o $$buildslides/$$slidename; \
			fi; \
		done; \
	done;

icons:
	icons-source/generate-pngs.sh

.PHONY : clean clean-icons

clean-icons:
	icons-source/remove-pngs.sh

clean: clean-icons
	-rm -rf $(BUILD)
