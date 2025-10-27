

import boto3
from botocore.exceptions import ClientError
from fastapi import HTTPException
import logging
import os
from dotenv import load_dotenv

load_dotenv() 

AWS_ACCESS_KEY = os.getenv('AWS_ACCESS_KEY')
AWS_SECRET_KEY = os.getenv('AWS_SECRET_KEY')
S3_REGION = os.getenv('S3_REGION')
S3_BUCKET_NAME = os.getenv('S3_BUCKET_NAME')
URL_EXPIRATION_SECONDS = 3000

s3_client = boto3.client(
    's3', aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_KEY, region_name=S3_REGION
)

def generate_upload_url(file_name: str, folder: str, file_size: int):
    try:
        presigned_url = s3_client.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': S3_BUCKET_NAME,
                'Key': folder + '/' + file_name,
                'ContentLength': file_size
            },
            ExpiresIn=URL_EXPIRATION_SECONDS
        )
        
        return presigned_url
    except ClientError as e:
        logging.error(e)
        raise HTTPException(status_code=500, detail="Could not generate upload URL")

def generate_download_url(
        file_name: str, folder: str, expiration: int = URL_EXPIRATION_SECONDS):
    if file_name == 'default.png' and folder != 'chatPictures':
        return '/default.png'
    
    try:
        presigned_url = s3_client.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': S3_BUCKET_NAME,
                'Key': folder + '/' + file_name
            },
            ExpiresIn=expiration
        )

        return presigned_url
    except ClientError as e:
        if e.response['Error']['Code'] == 'NoSuchKey':
            presigned_url = s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': S3_BUCKET_NAME,
                    'Key': folder + '/default.png'
                },
                ExpiresIn=expiration
            )

            return presigned_url
        logging.error(e)
        raise HTTPException(status_code=500, detail="Could not generate URL")