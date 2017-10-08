# Makefile for ubiquity-slideshow-ubuntu

SLIDESHOWS = \
	ubuntu \
	kubuntu \
	xubuntu \
	lubuntu \
	edubuntu \
	ubuntustudio \
	ubuntu-budgie \
	ubuntukylin \
	ubuntu-mate \
	oem-config-ubuntu \
	oem-config-ubuntu-mate \
	oem-config-ubuntu-budgie

SOURCE ?= .
SOURCESLIDES ?= $(SOURCE)/slideshows
BUILD ?= $(SOURCE)/build

PO4A_FLAGS = -M UTF-8 -f xhtml -o attributes="data-translate"


find-slides = $(filter-out %/index.html,$(wildcard $1/*.html))
find-slidenames = $(notdir $(call find-slides,$(SOURCESLIDES)/$1/slides))
find-locales = $(basename $(notdir $(wildcard po/$1/*.po)))


.PHONY: all
all: build.slideshows

.PHONY: pot

.PHONY: clean
clean:
	-rm -rf $(_ALL_TMP_DIRS) $(BUILD)

.PHONY: test
test: build
	./test-slideshow.sh

$(BUILD):
	mkdir -p $(BUILD)

.PHONY: build.slideshows


define MAKE-SLIDESHOW

# Per-slideshow build

_SOURCE_FILES_$(1) := $$(shell find -L $(SOURCESLIDES)/$(1) -type f)
_BUILD_FILES_$(1) := $$(patsubst $(SOURCESLIDES)/%,$(BUILD)/%,$$(_SOURCE_FILES_$(1)))

_ALL_TMP_DIRS += $(BUILD)/$1
build.slideshows: build.$1

.PHONY: build.$1
build.$1: build.base.$1 build.l10n.$1

.PHONY: build.base.$1
build.base.$1: $$(_BUILD_FILES_$(1))

.PHONY: build.l10n.$1
build.l10n.$1: build.base.$1
	./build-directory-jsonp.py $(BUILD)/$1/slides/l10n > $(BUILD)/$1/slides/directory.jsonp

# Per-slideshow pot file creation

_ALL_TMP_DIRS += po/$1/.tmp
pot: po/$1/slideshow-$1.pot

po/$1/slideshow-$1.pot: $(addsuffix .pot,$(addprefix po/$1/.tmp/,$(call find-slidenames,$1)))
	msgcat -F $$^ > $$@

po/$1/.tmp/%.pot: $(SOURCESLIDES)/$1/slides/% | po/$1/.tmp
	po4a-updatepo $(PO4A_FLAGS) -m $$^ -p $$@

po/$1/.tmp:
	mkdir -p po/$1/.tmp

# Per-slideshow test scripts

.PHONY: $(SLIDESHOWS)
$(SLIDESHOWS): %: build.%

.PHONY: test.$1
test.$1: build.base.$1
	./Slideshow.py --path="$(BUILD)/$1" --controls

$(foreach p,$(call find-locales,$1),$(eval $(call MAKE-SLIDESHOW-LOCALE,$1,$p)))

endef


define MAKE-SLIDESHOW-LOCALE

# Per-locale per-slideshow build
# By creating a different target for each locale, parallel build works as expected.

build.l10n.$1: build.l10n.$1.$2

.PHONY: build.l10n.$1.$2
build.l10n.$1.$2: $(addprefix $(BUILD)/$1/slides/l10n/$2/,$(call find-slidenames,$1))
	rmdir --ignore-fail-on-non-empty $(BUILD)/$1/slides/l10n/$2

$(BUILD)/$1/slides/l10n/$2/%: $(SOURCESLIDES)/$1/slides/% po/$1/$2.po | $(BUILD)/$1/slides/l10n/$2
	po4a-translate $(PO4A_FLAGS) --keep=1 --master=$$< --po=po/$1/$2.po --localized=$$@

$(BUILD)/$1/slides/l10n/$2:
	# translate all slides inside this locale
	mkdir -p $$@

# Per-locale per-slideshow test scripts

test.$1.$2: build.base.$1 build.l10n.$1.$2
	./build-directory-jsonp.py $(BUILD)/$1/slides/l10n > $(BUILD)/$1/slides/directory.jsonp
	./Slideshow.py --path="$(BUILD)/$1" --controls --locale=$2

test.$1.$2.rtl: build.base.$1 build.l10n.$1.$2
	./build-directory-jsonp.py $(BUILD)/$1/slides/l10n > $(BUILD)/$1/slides/directory.jsonp
	./Slideshow.py --path="$(BUILD)/$1" --controls --locale=$2 --rtl

endef


$(foreach s,$(SLIDESHOWS),$(eval $(call MAKE-SLIDESHOW,$s)))


$(BUILD)/%: $(SOURCESLIDES)/% | $(BUILD)
	mkdir -p $(@D)
	cp $^ $@

$(BUILD)/%.js: $(SOURCESLIDES)/%.js | $(BUILD)
	mkdir -p $(@D)
	cp $^ $@
