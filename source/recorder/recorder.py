import os
import json
import asyncio
import logging
import sys
import argparse
import subprocess
import obswsrc
from datetime import datetime
from pathlib import Path
import shutil

from recorder.taskManager import TaskManager
from recorder.obsControl import OBSControl
from recorder.applicationController import ApplicationController
from util.pathObject import PathObject

class Recorder:

	def __init__(self, activeConfig):
		self.logger = logging.getLogger('')
		self.dirHome = os.getcwd()

		self.configData = activeConfig.data
		
		self.taskManager = TaskManager(self.logger)

		self.obs = ApplicationController(self.logger, 'OBS Studio', self.configData["obs"]["executable"])
		self.targetApplication = self.createTargetApplication()

		# We will output logging to sys.stdout, as many events might raise errors
		# on creation (that's because protocol.json is not perfect) - such errors
		# are logged by obs-ws-rc automatically, we just need to see them
		obswsrc.logs.logger.setLevel(logging.ERROR)
		obswsrc.logs.logger.addHandler(logging.StreamHandler(stream=sys.stdout))

	def run(self):
		self.taskManager.runUntilComplete(self.runAndWait())
		self.taskManager.destroy()

	def runUntilComplete(self):
		self.taskManager.runUntilComplete(self.runAndWait())

	def destroy(self):
		self.taskManager.destroy()

	async def runAndWait(self):
		self.logger.info("Running...")

		self.deleteObsSettings()
		self.copyObsSettings()

		pathToOutputDir = self.createOutputDirectory()

		await self.obs.open(False)

		async with obswsrc.OBSWS('localhost', 4444, 'password') as obsws:
			
			controller = OBSControl(self.logger, obsws)

			await controller.setup(self.configData["obs"], pathToOutputDir)

			#await asyncio.sleep(500)

			await self.targetApplication.open(True)

			# try to start recording, settings permitting
			await controller.tryToggleRecording(start=True)

			# try to start streaming, settings permitting
			await controller.tryToggleStreaming(start=True)

			await self.targetApplication.waitUntilClosed()

			# try to start streaming, settings permitting
			await controller.tryToggleStreaming(start=False)

			# try to stop recording, settings permitting
			await controller.tryToggleRecording(start=False)

		self.obs.close()
		self.deleteObsSettings()

	def copyObsSettings(self):
		obsSettings = self.configData['obs']['settings']
		self.copyObsProfile(PathObject(obsSettings["profile"]))
		self.copyObsSceneCollection(PathObject(obsSettings["scene-collection"]))

	def copyObsProfile(self, sourcePathObject):
		source, destination = self.getObsProfilesLocation(sourcePathObject)
		self.logger.info('Copying profile path {} to {}'.format(source, destination))
		shutil.copytree(str(source), str(destination))

	def copyObsSceneCollection(self, sourcePathObject):
		source, destination = self.getObsSceneCollectionsLocation(sourcePathObject)
		self.logger.info('Copying scene-collection path {} to {}'.format(source, destination))
		shutil.copy(str(source), str(destination))

	def deleteObsSettings(self):
		obsSettings = self.configData['obs']['settings']
		self.deleteObsProfile(PathObject(obsSettings["profile"]))
		self.deleteObsSceneCollection(PathObject(obsSettings["scene-collection"]))

	def deleteObsProfile(self, sourcePathObject):
		source, destination = self.getObsProfilesLocation(sourcePathObject)
		if destination.exists():
			self.logger.info('Deleting profile at {}'.format(destination))
			shutil.rmtree(str(destination))

	def deleteObsSceneCollection(self, sourcePathObject):
		source, destination = self.getObsSceneCollectionsLocation(sourcePathObject)
		if destination.exists():
			self.logger.info('Deleting scene-collection at {}'.format(destination))
			os.remove(str(destination))

	def getObsProfilesLocation(self, sourcePathObject):
		source = Path(sourcePathObject.getPathAbsoluteWithFile())
		profileName = sourcePathObject.getLibPath().name
		destination = Path(os.getenv('APPDATA'))
		destination = destination.joinpath('obs-studio/basic/profiles/')
		destination = destination.joinpath(profileName)
		return source, destination

	def getObsSceneCollectionsLocation(self, sourcePathObject):
		source = Path(sourcePathObject.getPathAbsoluteWithFile())
		fileName = sourcePathObject.getLibPath().name
		destination = Path(os.getenv('APPDATA'))
		destination = destination.joinpath('obs-studio/basic/scenes/')
		destination = destination.joinpath(fileName)
		return source, destination

	def createOutputDirectory(self):
		# created per recorder run because settings could change after app launch
		outputDirPath = PathObject(self.configData['obs']['recording']['output-path']).getLibPath()

		subDirectory = '{} {}'.format(
			self.configData['target']['name'],
			datetime.now().strftime('%Y-%m-%d %H-%M-%S')
		)
		outputDirPath = outputDirPath.joinpath(subDirectory)

		#logging.getLogger('').info(outputDirPath)
		outputDirPath.mkdir(exist_ok=True, parents=True)

		return outputDirPath

	def createTargetApplication(self):
		targetAppSettings = self.configData['target']
		return ApplicationController(self.logger, targetAppSettings['name'], targetAppSettings)

	def getProfile(self):
		return self.configData['obs']['settings']['profile']

	def setProfile(self, path):
		self.configData['obs']['settings']['profile'] = path

def runRecorder():
	logging.basicConfig(
		level=logging.INFO,
		format='%(levelname)7s: %(message)s',
		stream=sys.stderr,
	)
	Recorder().run()
	input("Press Enter to continue...")
