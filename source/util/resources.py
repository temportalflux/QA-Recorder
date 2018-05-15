
import logging
from pathlib import Path

from PyQt5.QtCore import *
from PyQt5.QtMultimedia import *
from PyQt5.QtMultimediaWidgets import *
from PyQt5.QtWidgets import *
from PyQt5.QtWidgets import *
from PyQt5.QtGui import *

class Resources:

	def __init__(self, absolutePath):
		self.logger = logging.getLogger('Resources')
		self.path = Path(absolutePath)

	def getResource(self, subpath):
		resourcePath = self.path.joinpath(subpath)
		if not resourcePath.exists():
			self.logger.warn('Resource {} does not exist'.format(subpath))
		return str(resourcePath)

	def getIconPNG(self, name):
		return self.getResource('icons/{}.png'.format(name))

	def getQIcon(self, name):
		return QIcon(self.getIconPNG(name))

