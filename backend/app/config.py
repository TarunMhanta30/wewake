"""Application settings, loaded from the environment (and .env)."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "wewake"
    debug: bool = True

    # File-based SQLite, relative to wherever the server is started.
    database_url: str = "sqlite:///./wewake.db"

    # "*" means allow all origins. Otherwise a comma-separated list.
    cors_origins: str = "*"

    @property
    def cors_origin_list(self) -> list[str]:
        if self.cors_origins.strip() == "*":
            return ["*"]
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
