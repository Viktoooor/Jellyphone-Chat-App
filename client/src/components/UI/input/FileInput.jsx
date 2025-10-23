import { useRef, memo, useState } from "react"
import { MdAttachFile } from "react-icons/md"
import { FiLoader } from "react-icons/fi"
import FileViewerModal from "../modal/FileViewer/FileViewerModal"
import $api from "../../../http"
import { useStore } from "../../../store/store"
import axios from 'axios';
import compressImage from "../../../tools/compressImage"
import { toDataURL } from '../../../tools/toDataUrl';
import dataURItoBlob from '../../../tools/dataURItoBlob';
import sleep from "../../../tools/sleep"

const FileInput = memo(() => {
    const [isModalOpen, setIsModalOpen] = useState(false)
	const [files, setFiles] = useState([])
	const [loading, setLoading] = useState(false)
	const fileInputRef = useRef()

	const handleFileChange = async (event) => {
		const selectedFiles = event.target.files;
		if(!selectedFiles)
			return
		
		setLoading(true)
		const newFilesPromises = Array.from(selectedFiles).map(async (file, index) => {
			const isPhoto = file.type.startsWith('image/');
			let previewUrl = '';
			let width = null;
			let height = null;
			let fileBlob;

			if(isPhoto){
				if(file.type != 'image/gif'){
					const res = await compressImage(file);
					previewUrl = res.blob
					width = res.width
					height = res.height
					fileBlob = dataURItoBlob(previewUrl)
				}else{
					previewUrl = await toDataURL(file)
				}
			}

			return {
				id: Date.now() + index,
				name: file.name,
				previewUrl: previewUrl,
				type: isPhoto ? 'photo' : 'file',
				width: width,
				height: height,
				fileObject: (fileBlob) ? fileBlob : file,
				// 'pending', 'uploading', 'success', 'error', 'cancelled'
				uploadStatus: 'pending',
				progress: 0,
				abortController: null
			};
		});

		const newFiles = await Promise.all(newFilesPromises);

		setFiles(newFiles);
		event.target.value = null
		setIsModalOpen(true)
		setLoading(false)
    }

	const handleFileDelete = (fileIdToDelete) => {
		setFiles((prevFiles) => prevFiles.filter((file) => 
			file.id !== fileIdToDelete
		));
	};

	const handleCloseModal = () => {
		files.forEach(file => {
			if(file.uploadStatus === 'uploading' && file.abortController){
				file.abortController.cancel()
			}
		})
		setFiles([])
		setIsModalOpen(false)
	}

	const updateFileState = (id, updates) => {
		setFiles(prevFiles => 
			prevFiles.map(file => 
				file.id === id ? { ...file, ...updates } : file
			)
		);
	};

  	const uploadFile = async (fileToUpload, upload_url) => {
		const { id, fileObject } = fileToUpload;
		const cancelTokenSource = axios.CancelToken.source();
		updateFileState(
			id, { uploadStatus: 'uploading', abortController: cancelTokenSource }
		);

		try{
			const onUploadProgress = (progressEvent) => {
				const percentCompleted = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                );
				updateFileState(id, { progress: percentCompleted });
			};

			await $api.put(
				upload_url,
				fileObject,
				{
					onUploadProgress: onUploadProgress,
					cancelToken: cancelTokenSource.token
				}
			);
		
			updateFileState(id, { uploadStatus: 'success', progress: 100 });

            return true
		}catch(e){
			if(axios.isCancel(e)){
				updateFileState(id, { uploadStatus: 'cancelled' });
			}else{
				console.error(e)
				updateFileState(id, { uploadStatus: 'error' });
			}
		}
	};

	const sendFile = useStore(state => state.sendFile)
	const selectedChatId = useStore(state => state.selectedChatId)
	const setNotification = useStore(state => state.setNotification)

	const handleStartUploads = async () => {
		try{
			const res = await $api.post('/user/generateUploadUrls', {
				'request_type': 'chatPictures',
				'files': files.map(file => ({
					'client_id': file.id.toString(),
					'type': file.fileObject.type,
					'size': file.fileObject.size
				}))
			})
			const uploadUrls = res.data.upload_urls
			files.forEach(async (file) => {
				if(!(file.id in uploadUrls) || file.uploadStatus !== 'pending')
					return

				if(uploadUrls[file.id].success){
					const { file_id, upload_url} = uploadUrls[file.id]
					const res = await uploadFile(file, upload_url);

					if(res == true)
						await sendFile(selectedChatId, file_id, file)
				}else{
					setNotification('error', uploadUrls[file.id].error)
					await sleep(1000)
				}
			});
		}catch(e){
			setNotification('error', 'Unexpected error')
		}
	};

	const handleCancelUpload = (id) => {
		const fileToCancel = files.find(file => file.id === id);
		if(fileToCancel && fileToCancel.abortController){
			fileToCancel.abortController.cancel();
		}
	};

    return (
        <>
            <button 
                onClick={() => fileInputRef.current.click()}
            >
                {loading ? 
                    <FiLoader size={18} className='loading'/>
                :
                    <>
                        <MdAttachFile size={26}/>
                        <input 
                            type='file' id="message-file" hidden ref={fileInputRef}
                            accept='*' onChange={handleFileChange} multiple
                        />
                    </>
                }
            </button>
            <FileViewerModal
				isOpen={isModalOpen} onClose={handleCloseModal}
				files={files} onDeleteFile={handleFileDelete}
				onStartUploads={handleStartUploads}
				onCancelUpload={handleCancelUpload}
			/>
        </>
    )
})

export default FileInput