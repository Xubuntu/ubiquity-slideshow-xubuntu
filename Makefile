# Makefile for ubiquity-slideshow-ubuntu

SOURCE=.
BUILD=$(SOURCE)/build
SOURCESLIDES=$(SOURCE)/slideshows

all: clean build_ubuntu build_kubuntu build_xubuntu build_ubuntu-upgrade build_lubuntu translations

build_init:
	mkdir -p $(BUILD)

build_ubuntu: build_init
	cp -rL $(SOURCESLIDES)/ubuntu $(BUILD)

build_ubuntu-upgrade: build_init
	cp -rL $(SOURCESLIDES)/ubuntu-upgrade $(BUILD)

build_kubuntu: build_init
	cp -rL $(SOURCESLIDES)/kubuntu $(BUILD)

build_xubuntu: build_init
	cp -rL $(SOURCESLIDES)/xubuntu $(BUILD)

build_lubuntu: build_init
	cp -rL $(SOURCESLIDES)/lubuntu $(BUILD)

translations:
	./generate-local-slides.sh ubuntu
	./generate-local-slides.sh ubuntu-upgrade
	./generate-local-slides.sh kubuntu
	./generate-local-slides.sh xubuntu
	./generate-local-slides.sh lubuntu

.PHONY : clean

clean:
	-rm -rf $(BUILD)
