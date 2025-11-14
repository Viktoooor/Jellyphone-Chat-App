from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    CLIENT_URL: str

    DB_URI: str
    
    JWT_SECRET: str

    SMTP_HOST: str
    SMTP_PORT: int
    SMTP_NAME: str
    SMTP_PASSWORD: str

    KEY: str

    AWS_ACCESS_KEY: str
    AWS_SECRET_KEY: str
    S3_REGION: str
    S3_BUCKET_NAME: str

    VAPID_PUBLIC_KEY: str
    VAPID_PRIVATE_KEY: str

    OAUTH_CLIENT_ID: str
    OAUTH_CLIENT_SECRET: str

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()