import os
import subprocess
import datetime
import logging
import sys
import json

logging.basicConfig(
    level=logging.INFO,
    format='%(levelname)7s: %(message)s',
    stream=sys.stderr,
)
logger = logging.getLogger('')

class GitControl:

	def __init__(self, logger):
		self.logger = logger

	def run_command_shell(self, cmd):
		return subprocess.call(cmd, shell=True)

	def run_command_shell_response(self, cmd):
		result = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE).stdout.read()
		result = result.decode().strip()
		return result

	def clonePull(self, url, branch, dirFullPath):
		result = None
		if os.path.exists(dirFullPath) and os.path.isdir(dirFullPath):
			self.logger.info("Pulling {}/{} to {}".format(url, branch, dirFullPath))
			os.chdir(dirFullPath)
			result = self.run_command_shell("git pull")
		else:
			self.logger.info("Cloning {}/{} to {}".format(url, branch, dirFullPath))
			result = self.run_command_shell('git clone -b {} "{}" {}'.format(branch, url, dirFullPath))
			os.chdir(dirFullPath)
		return result

	def addAll(self):
		self.logger.info("Adding files")
		return self.run_command_shell('git add -A')

	def commit(self, message):
		self.logger.info("Commiting files as '{}'".format(message))
		return self.run_command_shell('git commit -m "{}"'.format(message))

	def push(self, branch):
		self.logger.info("Pushing to origin/{}".format(branch))
		return self.run_command_shell('git push -u origin {}'.format(branch))

	def writeData(self):
		self.logger.info("Writing random data")
		return self.run_command_shell('echo "temporary data" > "{}.txt"'.format(datetime.datetime.now().strftime("%m-%d-%Y-%H-%M-%S")))

	def loadJson(self, filePath):
		data = {}
		with open(filePath) as file:
			data = json.loads(file.read())
		return data

	def commitFiles(self):

		# ignored in repo for security reasons
		settings = self.loadJson('git.json')

		gitUrl = 'github.com/{}/{}'.format(
			settings['user'],
			settings['repository']
		)
		url = 'https://{}:{}@{}'.format(
			settings['committer'],
			'{}'.format(settings['password']),
			gitUrl
		)

		dirRoot = os.getcwd()
		dirFullPath = os.path.join(dirRoot, settings['directory'].replace('/', '\\'))

		self.clonePull(url, settings['branch'], dirFullPath)

		self.writeData()

		self.addAll()
		self.commit('add footage')
		self.push(settings['branch'])

		commitSha = self.run_command_shell_response('git rev-parse --verify HEAD')
		commitUrl = '{}/blob/{}'.format(gitUrl, commitSha)

		os.chdir(dirRoot)

		return commitUrl

logger.info(GitControl(logger).commitFiles())
