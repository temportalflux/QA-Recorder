
import os
from pathlib import Path
import logging

class PathObject:

	def __init__(self, target):
		# self.target is
		#{
		#	"absolute": false,
		#	"path": "some/relative/path/"
		#	"file": "theexecutable.exe"
		#}
		self.target = target

	def isAbsolute(self):
		return self.target['absolute']

	def setAbsolute(self, isAbsolute):
		absPath = self.getPathAbsoluteWithFile()
		self.target['absolute'] = isAbsolute
		self.setAbsolutePath(absPath)

	def getPathRaw(self):
		return self.target['path']

	def setPathRaw(self, raw):
		self.target['path'] = raw

	def getFile(self):
		return self.target['file']

	def setFile(self, filename):
		self.target['file'] = filename

	def getPathAbsolute(self):
		if self.isAbsolute():
			return self.getPathRaw()
		else:
			return os.path.join(os.getcwd(), self.getPathRaw())

	def getPathAbsoluteWithFile(self):
		return os.path.join(self.getPathAbsolute(), self.getFile())

	def getPathRelative(self):
		if not self.isAbsolute():
			return self.getPathRaw()
		else:
			return os.path.commonpath([os.getcwd(), self.getPathRaw()])

	def getPathRelativeWithFile(self):
		return os.path.join(self.getPathRelative(), self.getFile())

	def isValid(self):
		#return is_pathname_valid(path)
		return os.path.exists(self.getPathAbsoluteWithFile())

	def setAbsolutePath(self, absolutePath):
		pathObj = Path(absolutePath)

		filename = ''
		if pathObj.suffix != '':
			filename = pathObj.name
			pathObj = pathObj.parent

		if self.isAbsolute():
			self.setPathRaw(str(pathObj))
		else:
			self.setPathRaw(str(pathObj.relative_to(os.getcwd())))
		self.setFile(filename)
