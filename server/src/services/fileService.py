from uuid import uuid4
from ..schemas.uploadUrl import FileMeta, RequestType
from fastapi import HTTPException, status
from ..s3 import s3_utils
import mimetypes

MEGABYTE = 1024*1024

class FileService:
    def generateUploadUrls(files: list[FileMeta], request_type: RequestType):
        if request_type != RequestType.CHAT:
            if len(files) != 1 or files[0].size > MEGABYTE:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid request"
                )
        
        upload_urls = {}
        for file in files:
            if file.client_id in upload_urls:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Client id is not unique"
                )
            
            if request_type != RequestType.CHAT and (not file.type.startswith('image/')):
                upload_urls[file.client_id] = {
                    'success': False,
                    'error': 'Cannot upload not an image file'
                }
                continue
            
            extension = mimetypes.guess_extension(file.type, strict=True)
            if extension is None:
                upload_urls[file.client_id] = {
                    'success': False,
                    'error': 'Unsupported MIME'
                }
                continue
            
            file_id = str(uuid4()) + extension
            upload_url = s3_utils.generate_upload_url(
                file_id, request_type, file.size
            )
            upload_urls[file.client_id] = {
                'success': True,
                'upload_url': upload_url,
                'file_id': file_id
            }
        
        return upload_urls