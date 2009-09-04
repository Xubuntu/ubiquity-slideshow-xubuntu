#!/usr/bin/python
'''
Simple program to test the slideshow using a real webkit.WebView widget.

Please excuse its horrifying ugliness.
'''

import os, sys
import gtk
import gobject
import ConfigParser
import webkit

base_directory = os.path.dirname (sys.argv[0])
slideshow_path = os.path.abspath(base_directory)

slideshow_config = ConfigParser.ConfigParser()
slideshow_config.read(os.path.join(slideshow_path,'slideshow.conf'))


gtk.gdk.threads_init()

slideshow_window = gtk.Window()
slideshow_window.set_title("Ubiquity Slideshow with Webkit")
slideshow_window.connect('destroy',gtk.main_quit)
#Setting up rgba colourmap because we can :)
#colormap = slideshow_window.get_screen().get_rgba_colormap()
#if colormap:
#	print('We are RGBA`d!')
#	gtk.widget_set_default_colormap(colormap)

slideshow_window_align = gtk.Alignment()
slideshow_window_align.set_padding(8,8,8,8)
#Note there's probably a convention for padding that I'm forgetting here
slideshow_window.add(slideshow_window_align)

slideshow_container = gtk.VBox()
slideshow_container.set_spacing(8)
slideshow_window_align.add(slideshow_container)


slideshow_webview = webkit.WebView()

config_width = int(slideshow_config.get('Slideshow','width'))
config_height = int(slideshow_config.get('Slideshow','height'))
slideshow_webview.set_size_request(config_width,config_height)

# settings = slideshow_webview.get_settings()
#uncomment if we need to change settings

#TODO: Disable right click menus and resond to the user pressing links

slideshow_webview.open( os.path.join(slideshow_path, "slides", "index.html"))


install_progressbar = gtk.ProgressBar()
install_progressbar.set_size_request(-1,30)
install_progressbar.set_text("Pretending to install. Please wait...")
install_progressbar.set_fraction(0)


slideshow_container.add(install_progressbar)
slideshow_container.add(slideshow_webview)


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

#gtk.widget_pop_colormap()
#print('Cleaned up GTK colormap stuff')
