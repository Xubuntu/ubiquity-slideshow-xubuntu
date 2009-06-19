#!/usr/bin/python
'''
Simple program to test the slideshow using a real webkit.WebView widget.
'''

import os, sys
import gtk
import webkit

base_directory = os.path.dirname (sys.argv[0])

gtk.threads_init()

slideshow_window = gtk.Window()
slideshow_window.set_title("Ubiquity Slideshow with Webkit")
slideshow_window.connect('destroy',gtk.main_quit)

slideshow_container = gtk.VBox()
slideshow_window.add(slideshow_container)


slideshow_webview = webkit.WebView()
settings = slideshow_webview.get_settings()
settings.set_property("enable-developer-extras", True)
#TODO: Disable right click menus and resond to the user pressing links

#TODO: Parse a configuration file to get the following information
slideshow_webview.open( os.path.join(base_directory, "slides", "Slideshow.html"))
slideshow_webview.set_size_request(700,420)

slideshow_container.add(slideshow_webview)

slideshow_window.show_all()

gtk.main()