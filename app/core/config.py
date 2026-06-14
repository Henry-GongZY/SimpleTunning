"""Application configuration for SimpleTunning backend."""

import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    mode: str = "local"  # "local" or "cloud"

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    # Shared memory (local mode only)
    use_shm: bool = True
    shm_path: str = "/tmp/simpletunning_shm"

    # Engine
    engine_lib_path: str = "../engine/build/isp_engine"

    # Logging
    log_level: str = "INFO"

    class Config:
        env_prefix = "ST_"


settings = Settings()
