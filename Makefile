# Makefile for ubiquity-slideshow-ubuntu

SOURCE=.
BUILD=build
SOURCESLIDES=$(SOURCE)/slides

all: clean icons build_ubuntu build_kubuntu build_xubuntu build_ubuntu-upgrade

build_init:
	mkdir -p $(BUILD)

build_ubuntu: build_init icons
	mkdir -p $(BUILD)/ubuntu/slides
	cp -r $(SOURCESLIDES)/ubuntu/* $(BUILD)/ubuntu/slides
	
	unlink $(BUILD)/ubuntu/slides/link
	mkdir -p $(BUILD)/ubuntu/slides/link
	cp -r $(SOURCESLIDES)/ubuntu/link/* $(BUILD)/ubuntu/slides/link
	
	cp slideshow.conf $(BUILD)/ubuntu
	./generate-local-slides.sh ubuntu

build_ubuntu-upgrade: build_init icons
	mkdir -p $(BUILD)/ubuntu-upgrade/slides
	cp -r $(SOURCESLIDES)/ubuntu-upgrade/* $(BUILD)/ubuntu-upgrade/slides
	
	unlink $(BUILD)/ubuntu-upgrade/slides/link
	mkdir -p $(BUILD)/ubuntu-upgrade/slides/link
	cp -r $(SOURCESLIDES)/ubuntu/link/* $(BUILD)/ubuntu-upgrade/slides/link
	
	cp slideshow.conf $(BUILD)/ubuntu-upgrade
	./generate-local-slides.sh ubuntu-upgrade

build_kubuntu: build_init icons
	mkdir -p $(BUILD)/kubuntu/slides
	cp -r $(SOURCESLIDES)/kubuntu/* $(BUILD)/kubuntu/slides
	
	unlink $(BUILD)/kubuntu/slides/link
	mkdir -p $(BUILD)/kubuntu/slides/link
	cp -r $(SOURCESLIDES)/kubuntu/link/* $(BUILD)/kubuntu/slides/link
	
	cp slideshow.conf $(BUILD)/kubuntu
	./generate-local-slides.sh kubuntu

build_xubuntu: build_init icons
	mkdir -p $(BUILD)/xubuntu/slides
	cp -r $(SOURCESLIDES)/xubuntu/* $(BUILD)/xubuntu/slides
	
	unlink $(BUILD)/xubuntu/slides/link
	mkdir -p $(BUILD)/xubuntu/slides/link
	cp -r $(SOURCESLIDES)/xubuntu/link/* $(BUILD)/xubuntu/slides/link
	
	cp slideshow.conf $(BUILD)/xubuntu
	./generate-local-slides.sh xubuntu

icons:
	icons-source/generate-pngs.sh

.PHONY : clean clean-icons

clean-icons:
	icons-source/remove-pngs.sh

clean: clean-icons
	-rm -rf $(BUILD)
