# Makefile for ubiquity-slideshow-ubuntu

SOURCE=.
BUILD=build
SOURCESLIDES=$(SOURCE)/slideshows

all: clean build_ubuntu build_kubuntu build_xubuntu build_ubuntu-upgrade

build_init:
	mkdir -p $(BUILD)

build_ubuntu: build_init
	cp -rL $(SOURCESLIDES)/ubuntu $(BUILD)/ubuntu
	icons-source/generate-pngs.sh ubuntu $(BUILD)/ubuntu/slides/icons
	./generate-local-slides.sh ubuntu

build_ubuntu-upgrade: build_init
	cp -rL $(SOURCESLIDES)/ubuntu-upgrade $(BUILD)/ubuntu-upgrade
	#icons-source/generate-pngs.sh ubuntu-upgrade $(BUILD)/ubuntu-upgrade/slides/icons
	./generate-local-slides.sh ubuntu-upgrade

build_kubuntu: build_init
	cp -rL $(SOURCESLIDES)/kubuntu $(BUILD)/kubuntu
	icons-source/generate-pngs.sh kubuntu $(BUILD)/kubuntu/slides/icons
	./generate-local-slides.sh kubuntu

build_xubuntu: build_init
	cp -rL $(SOURCESLIDES)/xubuntu $(BUILD)/xubuntu
	#icons-source/generate-pngs.sh xubuntu $(BUILD)/xubuntu/slides/icons
	./generate-local-slides.sh xubuntu

.PHONY : clean

clean:
	-rm -rf $(BUILD)
