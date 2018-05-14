import asyncio
import os

from util.pathObject import PathObject
from pathlib import Path

import obswsrc
from obswsrc.requests import ResponseStatus, SetRecordingFolderRequest, SetCurrentProfileRequest, SetCurrentSceneCollectionRequest, SetCurrentSceneRequest, StartRecordingRequest, StopRecordingRequest, StartStreamingRequest, StopStreamingRequest
from obswsrc.types import Stream, StreamSettings

class OBSControl:

	def __init__(self, logger, obsws):
		self.logger = logger
		self.obsws = obsws
		self.shouldRecord = False
		self.shouldStream = False
		self.stream = None

	async def setup(self, obsData, pathToOutputDir):
		
		obsSettings = obsData['settings']

		if "profile" in obsSettings:
			await self.sendProfile(PathObject(obsSettings["profile"]))
		if "scene-collection" in obsSettings:
			await self.sendSceneCollection(PathObject(obsSettings["scene-collection"]))
		if "scene" in obsSettings:
			await self.sendCurrentScene(obsSettings["scene"])

		if "recording" in obsData:
			self.shouldRecord = obsData["recording"]['active']
			await self.sendOutputPath(str(pathToOutputDir))

		if "streaming" in obsData:
			self.shouldStream = obsData["streaming"]['active']
			self.setSettingsStream(obsData["streaming"])

	async def makeRequest(self, request, success, failure):
		#self.logger.info(request)

		response = await self.obsws.require(request)

		#self.logger.info(response)

		#succeeded = "{}".format(response.status) == 'ResponseStatus.OK'
		succeeded = response.status == ResponseStatus.OK

		# Check if everything is OK
		if succeeded:
			self.logger.info(success)
		else:
			self.logger.info('{} Reason: {}'.format(failure, response.error))

		return succeeded

	async def sendOutputPath(self, path):
		success = await self.makeRequest(
			#obswsrc.requests['SetRecordingFolderRequest'](,
			SetRecordingFolderRequest(
				rec_folder=path
			),
			"Set recording folder to {}".format(path),
			"Couldn't set recording folder!"
		)

	async def sendProfile(self, profilePathObject):

		profileName = profilePathObject.getLibPath().name

		self.logger.info('Setting profile to {}'.format(profileName))

		success = await self.makeRequest(
			#obswsrc.requests['SetCurrentProfileRequest'](
			SetCurrentProfileRequest(
				profile_name=profileName
			),
			"Set current profile to {}".format(profileName),
			"Couldn't set current profile!"
		)

	async def sendSceneCollection(self, sceneCollectionPathObject):
		sceneCollectionName = sceneCollectionPathObject.getLibPath().stem
		success = await self.makeRequest(
			#obswsrc.requests['SetCurrentSceneCollectionRequest'](
			SetCurrentSceneCollectionRequest(
				sc_name=sceneCollectionName
			),
			"Set current scene collection to {}".format(sceneCollectionName),
			"Couldn't set current scene collection!"
		)

	async def sendCurrentScene(self, scene):
		success = await self.makeRequest(
			#obswsrc.requests['SetCurrentSceneRequest'](
			SetCurrentSceneRequest(
				scene_name=scene
			),
			"Set current scene to {}".format(scene),
			"Couldn't set current scene!"
		)

	def setSettingsStream(self, stream):
		stream_settings = StreamSettings(#obswsrc.types['StreamSettings'](
			server = "",
			key = "",
			use_auth = False,
			username = "",
			password = ""
		)
		if "server" in stream:
			stream_settings.server = stream["server"]
		if "key" in stream:
			stream_settings.key = stream["key"]
		if "authentiation" in stream:
			authentiation = stream["authentiation"]
			if "enabled" in authentiation:
				stream_settings.use_auth = authentiation["enabled"]
			if "username" in authentiation:
				stream_settings.username = authentiation["username"]
			if "password" in authentiation:
				stream_settings.password = authentiation["password"]
		self.stream = Stream(#obswsrc.types['Stream'](
			settings = stream_settings,
			type = "rtmp_custom",
		)

	async def tryToggleRecording(self, start):
		if not self.shouldRecord:
			return

		if start:
			await self.startRecording()
		else:
			await self.stopRecording()

	async def startRecording(self):
		success = await self.makeRequest(
			#obswsrc.requests['StartRecordingRequest'](),
			StartRecordingRequest(),
			"Recording has started.",
			"Couldn't start the recording!"
		)

	async def stopRecording(self):
		success = await self.makeRequest(
			#obswsrc.requests['StopRecordingRequest'](),
			StopRecordingRequest(),
			"Recording has stopped.",
			"Couldn't stop the recording!"
		)

	async def tryToggleStreaming(self, start):
		if not self.shouldStream:
			return

		if start:
			await self.startStreaming()
		else:
			await self.stopStreaming()

	async def startStreaming(self):
		if self.stream is None:
			request = StartStreamingRequest()#obswsrc.requests['StartStreamingRequest']()
		else:
			request = StartStreamingRequest(#obswsrc.requests['StartStreamingRequest'](
				stream = self.stream
			)

		success = await self.makeRequest(
			request,
			"Streaming has started.",
			"Couldn't start the stream!"
		)

	async def stopStreaming(self):
		success = await self.makeRequest(
			#obswsrc.requests['StopStreamingRequest'](),
			StopStreamingRequest(),
			"Streaming has stopped.",
			"Couldn't stop the stream!"
		)
