import '../style.css'
import { FiX } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import UploadProgressIndicator from './UploadProgressIndicator';
import Modal from '../Modal';

const FileViewerModal = ({ isOpen, onClose, files, onDeleteFile, onStartUploads,
	onCancelUpload, }) => {
    const [loading, setLoading] = useState(false)

    const handleSend = async () => {
        setLoading(true)
        await onStartUploads()
	}

    useEffect(() => {
        if(isOpen)
            setLoading(false)
    }, [isOpen])

    if(!isOpen)
        return null

    return (
        <Modal
            header='Files' onClose={onClose} onBackropClick={onClose}
            submitLabel='Send' onSubmit={handleSend} loading={loading}
        >
            <div className="file-grid">
                {files.map((file) => (
                    <div key={file.id} className="file-tile">
                        {file.uploadStatus !== 'pending' && file.uploadStatus !== 'success' && (
                            <div className="tile-overlay">
                                <UploadProgressIndicator
                                    status={file.uploadStatus}
                                    progress={file.progress}
                                    onCancel={() => onCancelUpload(file.id)}
                                />
                            </div>
                        )}
                        {file.uploadStatus === 'success' && (
                            <div className="tile-overlay success-overlay">
                                <UploadProgressIndicator status="success" />
                            </div>
                        )}
                        {file.uploadStatus == 'pending' &&
                            <div
                                className="delete-icon"
                                onClick={() => onDeleteFile(file.id)}
                            >
                                <FiX/>
                            </div>
                        }
                        
                        {file.type === 'photo' ? 
                            <img 
                                src={file.previewUrl} alt={file.name}
                                className="file-preview"
                            />
                        :
                            <div className='file-icon-wrapper'>
                                <div className="file-icon-placeholder">
                                    <span className="file-icon-text">
                                        {file.name.split('.').at(-1)}
                                    </span>
                                </div>
                            </div>
                        }
                        
                        <span className="file-name" title={file.name}>
                            {file.name}
                        </span>
                    </div>
                ))}
            </div>
        </Modal>
    )
}

export default FileViewerModal