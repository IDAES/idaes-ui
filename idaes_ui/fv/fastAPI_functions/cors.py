from fastapi.middleware.cors import CORSMiddleware


def enable_fastapi_cors(app):
    """Help fastapi app assign allowed origins
    Args:
        app: the class enables fastAPI
    """
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # allowed url list
        allow_credentials=True,  # support cookies
        allow_methods=["*"],  # allowed methord
        allow_headers=["*"],  # allowed header
    )
