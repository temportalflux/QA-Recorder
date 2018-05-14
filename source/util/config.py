
import json
from collections import deque

class Config:

	def __init__(self, path):
		self.path = path
		self.data = {}

	def loadJson(self, filePath):
		data = {}
		with open(filePath) as file:
			data = json.loads(file.read())
		return data

	def load(self):
		self.data = self.loadJson(self.path)

	def getActiveConfigAtPath(self, path):
		obj = self.data
		path = deque(path)
		while path:
			obj = obj[path.popleft()]
		return obj

	def hasChanges(self, other):
		return self.data != other.data

	def save(self):
		with open(self.path, 'w') as configFile:
			configFile.write(json.dumps(self.data, indent='\t', sort_keys=True))

	def reload(self):
		self.load()
