# Makefile for ubiquity-slideshow-ubuntu

SOURCE=.
SOURCESLIDES=$(SOURCE)/slides
BUILD=build
BUILDSLIDES=$(BUILD)/slides

all: clean icons
	mkdir -p $(BUILDSLIDES);
	cp -r $(SOURCESLIDES)/* $(BUILDSLIDES);
	cp slideshow.conf $(BUILD);
	
	echo "var directory = new Object();" >> $(BUILDSLIDES)/directory.js;
	
	for slide in po/*; \
	do \
		slidename=`basename $$slide`; \
		echo "directory['$$slidename'] = new Object();" >> $(BUILDSLIDES)/directory.js; \
		for locale in $$slide/*.po; \
		do \
			if [ -e $$locale ]; \
			then \
				localename=`basename $$locale .po`; \
				localeslides=$(BUILDSLIDES)/loc.`basename $$locale .po`; \
				[ ! -e $$localeslides ] && mkdir -p $$localeslides;\
				[ -e $$localeslides/$$slidename ] && rm -f $$localeslides/$$slidename; \
				po2html --notidy -i $$locale -t $(SOURCESLIDES)/$$slidename -o $$localeslides/$$slidename; \
				echo "directory['$$slidename']['$$localename'] = true;" >> $(BUILDSLIDES)/directory.js; \
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
