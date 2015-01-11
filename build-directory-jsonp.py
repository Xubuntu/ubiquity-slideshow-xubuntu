#!/usr/bin/python

import os
import sys
import subprocess
import json

if len(sys.argv) == 2:
    l10n_path = sys.argv[1]
else:
    sys.exit("Usage: %s <l10n_path>" % sys.argv[0])

if not subprocess.call(["which", "po4a-translate"],
                       stdout=subprocess.PIPE, stderr=subprocess.PIPE) == 0:
    sys.exit("Error: po4a is not available.")


def get_subdirs(root):
    for fname in os.listdir(root):
        fpath = os.path.join(root, fname)
        if os.path.isdir(fpath):
            yield fname, fpath

directory = {}

for locale_name, locale_path in get_subdirs(l10n_path):
    directory[locale_name] = {
        'slides' : [slide for slide in os.listdir(locale_path)],
        'media' : []
    }
    directory[locale_name]['slides'].sort()

content = json.dumps(directory)
sys.stdout.write('ubiquitySlideshowDirectoryCb(')
sys.stdout.write(content)
sys.stdout.write(');\n')
