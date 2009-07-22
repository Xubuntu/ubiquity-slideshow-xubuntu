#!/usr/bin/python
'''
Simple program to test the slideshow using a real webkit.WebView widget.

Please excuse its horrifying ugliness.
'''

import os, sys
import gtk
import gobject
import webkit

base_directory = os.path.dirname (sys.argv[0])

gtk.gdk.threads_init()

slideshow_window = gtk.Window()
slideshow_window.set_title("Ubiquity Slideshow with Webkit")
slideshow_window.connect('destroy',gtk.main_quit)

slideshow_container = gtk.VBox()
slideshow_window.add(slideshow_container)


slideshow_webview = webkit.WebView()
settings = slideshow_webview.get_settings()
try:
    settings.set_property("enable-developer-extras", True)
except TypeError:
    # Webkit in 9.04 does not support enable-developer-extras
    pass
#TODO: Disable right click menus and resond to the user pressing links

#TODO: Parse a configuration file to get the following information
slideshow_webview.open( os.path.abspath(os.path.join(base_directory, "slides", "index.html")))
slideshow_webview.set_size_request(700,420)

slideshow_container.add(slideshow_webview)

install_progressbar = gtk.ProgressBar()
install_progressbar.set_text("Pretending to install. Please wait...")
install_progressbar.set_fraction(0)

slideshow_container.add(install_progressbar)

#RGBA! Hooray!
colormap = slideshow_window.get_screen().get_rgba_colormap()
if colormap:
	print('We are RGBA`d!')
	gtk.widget_set_default_colormap(colormap)

slideshow_window.show_all()


def progress_increment(progressbar, fraction):
	new_fraction = progressbar.get_fraction() + fraction
	if new_fraction > 1:
		progressbar.set_fraction(1.0)
		install_progressbar.set_text("Finished pretending to install.")
		return False
	
	progressbar.set_fraction(new_fraction)
	install_progressbar.set_text("Pretending to install... %d%%" % (new_fraction * 100))
	return True

install_timer = gobject.timeout_add_seconds(2, progress_increment, install_progressbar, 0.01)

gtk.main()

gtk.widget_pop_colormap()
print('Cleaned up GTK colormap stuff')
