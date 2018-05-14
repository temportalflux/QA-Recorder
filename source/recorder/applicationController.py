
import struct # used to look for archiecture bit (64 or 32)
import os
import asyncio

# Structure to handle launch an asynchronous application using architectyure settings.
# Currently limited to windows only
class ApplicationController:

	def __init__(self, logger, appName, settings):
		self.process = None
		self.logger = logger
		self.appName = appName
		# Format:
		# {
		#	"64": {
		#		"absolute": false,
		#		"path": "directories/under/cwd/",
		#		"file": "myapp.exe"
		#	},
		#	"32": {
		#		"absolute": false,
		#		"path": "directories/under/cwd/",
		#		"file": "myapp.exe"
		#	}
		# }
		# 32 bit is mandatory, 64 bit is optional
		self.settings = settings
		self.appLocation = None

	# Looks at the system architecture and python runnable
	# and determines which application settings provided are appropriate (64-bit or 32-bit).
	def getBitSettings(self):
		# is the python runnable (and therefore system) able to handle 64-bit application
		# https://stackoverflow.com/questions/2208828/detect-64bit-os-windows-in-python
		use64bit = struct.calcsize("P") == 8
		# default to 32-bit
		bitSetting = "32"
		# if this system is 64 bit and user defined a 64 bit application
		if use64bit and "64" in self.settings:
			# 64-bit is valid
			bitSetting = "64"
		# return the bit and the settings object
		return { 'bit': bitSetting, 'settings': self.settings[bitSetting]}

	# Determines the appropriate start directory path.
	# startDirObj:
	# {
	#	"absolute": false,
	#	"path": "directories/under/cwd/"
	# }
	def getStartDirectory(self, cwd, startDirObj):
		# get the default path
		subpath = startDirObj['path']
		# ensure correct path structure for windows
		# THIS MEANS THIS CLASS CAN ONLY BE USED FOR WINDOWS
		subpath = subpath.replace('/', '\\')
		# If the settings specify that the path is a relative path
		if not startDirObj['absolute']:
			# prepend the current working directory
			subpath = os.path.join(cwd, subpath)
		# return the correct absolute path
		return subpath

	# Determines the absolute path for the start directory and the executable
	def getAppLocation(self, cwd, bitSettings):
		# Get the absolute path for the start directory
		startDirectory = self.getStartDirectory(cwd, bitSettings)
		# Append the exe file
		application = os.path.join(startDirectory, bitSettings['file'])
		# retrun the two
		return { 'start-dir': startDirectory, 'file': application }

	def getAppAbsolute(self, forcedBitSetting):

		bitSettings = self.settings[forcedBitSetting]

		if 'default' in bitSettings and bitSettings['default']:
			return ''

		# Determine the absolute file locations of the start directory and the executable
		appLocation = self.getAppLocation(os.getcwd(), bitSettings)

		return os.path.join(appLocation['start-dir'], appLocation['file'])

	def setFromAbsolute32(self, absolutePath):
		pass

	def setFromAbsolute64(self, absolutePath):
		pass

	# Opens the application
	async def open(self, outputToConsole):
		# ensure there is no current process
		if self.process is not None:
			self.close()

		# Get the settings to run (32-bit or 64-bit)
		bitInfo = self.getBitSettings()
		bit = bitInfo['bit']
		bitSettings = bitInfo['settings']

		# Determine the absolute file locations of the start directory and the executable
		self.appLocation = self.getAppLocation(os.getcwd(), bitSettings)

		self.logger.info('Openning {} {}-bit'.format(self.appName, bit))

		#self.process = subprocess.Popen(application, cwd=startDirectory)
		outPipe = None
		if outputToConsole:
			outPipe = asyncio.subprocess.PIPE
		self.process = await asyncio.create_subprocess_exec(
			self.appLocation['file'],
			cwd = self.appLocation['start-dir'],
			# stdout must a pipe to be accessible as process.stdout
			stdout = outPipe
		)

		self.logger.info("Started: {} (pid = {})".format(self.appLocation['file'], self.process.pid))

	# Alternative to close - waits for the application to close itself
	# will halt the until process is finished
	async def waitUntilClosed(self):
		# Wait for the subprocess to finish
		stdout, stderr = await self.process.communicate()

		# Progress
		if self.process.returncode == 0:
			self.logger.info("Done: {} (pid = {})".format(self.appLocation['file'], self.process.pid))
		else:
			self.logger.info("Failed: {} (pid = {})".format(self.appLocation['file'], self.process.pid))

		# Result
		result = stdout.decode().strip()

		self.appLocation = None
		self.process = None

		# Return stdout
		return result

	# Forcefully closes the sub-application
	def close(self):
		self.logger.info('Closing {}'.format(self.appName))
		self.process.terminate()
		self.process = None
		self.appLocation = None
