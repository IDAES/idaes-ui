from fastapi.middleware.cors import CORSMiddleware


def enable_fastapi_cors(app):
    """Help fastapi app assign allowed origins
    Args:
        app: the class enables fastAPI
    """
    origins = [
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,  # allowed url list
        allow_credentials=True,  # support cookies
        allow_methods=["*"],  # allowed methord
        allow_headers=["*"],  # allowed header
    )
