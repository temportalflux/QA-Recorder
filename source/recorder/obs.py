
from applicationController import ApplicationController

class OBS(ApplicationController):

	def __init__(self, logger, settings):
		ApplicationController.__init__(self, logger, 'OBS Studio', settings)
