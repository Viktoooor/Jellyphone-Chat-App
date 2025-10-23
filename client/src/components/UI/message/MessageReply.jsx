import { FiCornerUpLeft, FiEdit, FiX } from "react-icons/fi";

const MessageReply = ({ replyConfig, onCloseReply }) => {
    return (
        <div className="message-reply">
            <div className="reply-icon">
                {replyConfig.edit ?
                <FiEdit size={26}/>
                :
                <FiCornerUpLeft size={26}/>
                }
            </div>
            <div className="reply-content">
                <h4>{replyConfig.name}</h4>
                <p>{replyConfig.message}</p>
            </div>
            <button 
                className="reply-icon" 
                onClick={onCloseReply}
            >
                <FiX size={26}/>
            </button>
        </div>
    )
}

export default MessageReply