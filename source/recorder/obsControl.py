import asyncio
import os

import obswsrc
#from obswsrc import OBSWS
#from obswsrc.requests import ResponseStatus, SetRecordingFolderRequest, SetCurrentProfileRequest, SetCurrentSceneCollectionRequest, SetCurrentSceneRequest, StartRecordingRequest, StopRecordingRequest, StartStreamingRequest, StopStreamingRequest
#from obswsrc.types import Stream, StreamSettings

class OBSControl:

	def __init__(self, logger, obsws):
		self.logger = logger
		self.obsws = obsws
		self.shouldRecord = False
		self.shouldStream = False
		self.stream = None

	async def setup(self, obsSettings):
		if "stream" in obsSettings:
			self.setSettingsStream(obsSettings["stream"])
		if "recording" in obsSettings:
			self.shouldRecord = obsSettings["recording"]
		if "streaming" in obsSettings:
			self.shouldStream = obsSettings["streaming"]
		if "output-path" in obsSettings:
			await self.sendOutputPath(obsSettings["output-path"])
		if "profile" in obsSettings:
			await self.sendProfile(obsSettings["profile"])
		if "scene-collection" in obsSettings:
			await self.sendSceneCollection(obsSettings["scene-collection"])
		if "scene" in obsSettings:
			await self.sendCurrentScene(obsSettings["scene"])

	async def makeRequest(self, request, success, failure):
		response = await self.obsws.require(request)

		succeeded = "{}".format(response.status) == 'ResponseStatus.OK'

		# Check if everything is OK
		if succeeded:
			self.logger.info(success)
		else:
			self.logger.info('{} Reason: {}'.format(failure, response.error))

		return succeeded

	async def sendOutputPath(self, path):
		success = await self.makeRequest(
			obswsrc.requests['SetRecordingFolderRequest'](rec_folder=path),
			"Set recording folder to {}".format(path),
			"Couldn't set recording folder!"
		)

	async def sendProfile(self, profilePathRelative):
		profilePath = os.path.join(os.getcwd(), profilePathRelative.replace("/","\\"))
		success = await self.makeRequest(
			obswsrc.requests['SetCurrentProfileRequest'](profile_name=profilePath),
			"Set current profile to {}".format(profilePath),
			"Couldn't set current profile!"
		)

	async def sendSceneCollection(self, sceneCollectionPathRelative):
		sceneCollectionPath = os.path.join(os.getcwd(), sceneCollectionPathRelative.replace("/","\\"))
		success = await self.makeRequest(
			obswsrc.requests['SetCurrentSceneCollectionRequest'](sc_name=sceneCollectionPath),
			"Set current scene collection to {}".format(sceneCollectionPath),
			"Couldn't set current scene collection!"
		)

	async def sendCurrentScene(self, scene):
		success = await self.makeRequest(
			obswsrc.requests['SetCurrentSceneRequest'](scene_name=scene),
			"Set current scene to {}".format(scene),
			"Couldn't set current scene!"
		)

	def setSettingsStream(self, stream):
		stream_settings = obswsrc.types['StreamSettings'](
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
		self.stream = obswsrc.types['Stream'](
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
			obswsrc.requests['StartRecordingRequest'](),
			"Recording has started.",
			"Couldn't start the recording!"
		)

	async def stopRecording(self):
		success = await self.makeRequest(
			obswsrc.requests['StopRecordingRequest'](),
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
			request = obswsrc.requests['StartStreamingRequest']()
		else:
			request = obswsrc.requests['StartStreamingRequest'](stream = self.stream)

		success = await self.makeRequest(
			request,
			"Streaming has started.",
			"Couldn't start the stream!"
		)

	async def stopStreaming(self):
		success = await self.makeRequest(
			obswsrc.requests['StopStreamingRequest'](),
			"Streaming has stopped.",
			"Couldn't stop the stream!"
		)
