import { useState } from "react"
import { FiDownload } from "react-icons/fi"
import ImageViewer from "../modal/ImageViewer"
import LinkifyText from "../linkify/Linkify"

const MessageContent = ({ message, ref, isPhoto }) => {
    const [imageDialog, setImageDialog] = useState()

    return (
        <>
            {message.meta.file_type ? (isPhoto ?
                <img
                    src={message.meta.file_url}
                    style={{height: '100%'}}
                    onClick={() => setImageDialog(message.meta.file_url)}
                />
            :
                <div className="file-message-content">
                    <div className="file-message-icon">
                        <div className="file-message-overlay">
                            <a href={message.meta.file_url}>
                                <FiDownload size={26}/>
                            </a>
                        </div>
                        <span className="file-icon-text">
                            {message.message.split('.').at(-1)}
                        </span>
                    </div>
                    <span className="text">{message.message}</span>
                </div>
            ) :
                <span className="text" ref={ref}>
                    <LinkifyText text={message.message}/>
                </span>
            }
            <ImageViewer src={imageDialog} onClose={() => setImageDialog()}/>
        </>
    )
}

export default MessageContent