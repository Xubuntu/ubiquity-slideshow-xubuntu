#!/usr/bin/python
'''
Simple program to test the slideshow using a real webkit.WebView widget.

Please excuse its horrifying ugliness.
'''

import os, sys
import subprocess
import gtk
import gobject
import ConfigParser
import webkit


class SlideshowViewer(webkit.WebView):
	def __init__(self, path):
		self.path = path
		
		config = ConfigParser.ConfigParser()
		config.read(os.path.join(self.path,'slideshow.conf'))
		
		webkit.WebView.__init__(self)
		
		settings = self.get_settings()
		#settings.set_property("enable-default-context-menu", False)
		#TODO: enable-default-context-menu doesn't work yet but should land in the future. See <http://trac.webkit.org/changeset/52087>.
		settings.set_property("enable-universal-access-from-file-uris", True)
		
		config_width = int(config.get('Slideshow','width'))
		config_height = int(config.get('Slideshow','height'))
		self.set_size_request(config_width,config_height)
		
		self.open( os.path.join(self.path, "slides", "index.html"))
		
		self.connect('populate-popup', self.on_populate_popup) #TODO: remove this when the enable-default-context-menu setting reaches us
		self.connect('navigation-policy-decision-requested', self.on_navigate_decision)
		self.connect('navigation-requested', self.on_navigate)
		self.connect('new-window-policy-decision-requested', self.on_new_window_decision)
		self.connect('create-web-view', self.on_new_window)
	
	def new_browser_window(self, uri):
		subprocess.Popen(['xdg-open', uri], close_fds=True)
	
	def on_navigate_decision(self, view, frame, req, action, decision):
		reason = action.get_reason()
		print(reason)
		if reason == "link-clicked":
			decision.use()
			return False
		
		decision.ignore()
		return True
	
	def on_navigate(self, view, frame, req):
		uri = req.get_uri()
		print(uri)
		self.new_browser_window(uri)
		return True
	
	def on_new_window_decision(self, view, frame, req, action, decision):
		uri = req.get_uri()
		decision.ignore()
		self.new_browser_window(uri)
		return True
	
	def on_new_window(self, view, frame):
		return True
	
	def on_populate_popup(self, view, menu):
		for item in menu:
			item.destroy()



def progress_increment(progressbar, fraction):
	new_fraction = progressbar.get_fraction() + fraction
	if new_fraction > 1:
		progressbar.set_fraction(1.0)
		install_progressbar.set_text("Finished pretending to install.")
		return False
	
	progressbar.set_fraction(new_fraction)
	install_progressbar.set_text("Pretending to install... %d%%" % (new_fraction * 100))
	return True



base_directory = os.path.dirname (sys.argv[0])

gtk.gdk.threads_init()

slideshow_window = gtk.Window()
slideshow_window.set_title("Ubiquity Slideshow with Webkit")
slideshow_window.connect('destroy',gtk.main_quit)

slideshow_window_align = gtk.Alignment()
slideshow_window_align.set_padding(8,8,8,8)
#Note there's probably a convention for padding that I'm forgetting here
slideshow_window.add(slideshow_window_align)

slideshow_container = gtk.VBox()
slideshow_container.set_spacing(8)
slideshow_window_align.add(slideshow_container)


slideshow = SlideshowViewer(os.path.abspath(base_directory))


install_progressbar = gtk.ProgressBar()
install_progressbar.set_size_request(-1,30)
install_progressbar.set_text("Pretending to install. Please wait...")
install_progressbar.set_fraction(0)


slideshow_container.add(install_progressbar)
slideshow_container.add(slideshow)


slideshow_window.show_all()


install_timer = gobject.timeout_add_seconds(2, progress_increment, install_progressbar, 0.01)


gtk.main()
