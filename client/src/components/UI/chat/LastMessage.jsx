import { RiCheckDoubleFill, RiCheckFill } from "react-icons/ri"
import getTime from "../../../tools/getTime"
import { useStore } from "../../../store/store"
import { FiClock } from "react-icons/fi"

const LastMessage = ({ chat }) => {
    const user = useStore(state => state.user)
    const lastMessage = chat.lastMessage

    if(!lastMessage)
        return null
    
    const isSent = user.id == lastMessage.meta.sender_id
    const isInfo = lastMessage.meta.type
    const isPhoto = lastMessage.meta.file_type === 'photo'
    const isFile = lastMessage.meta.file_type === 'file'

    return (
        <div className="last-message">
            <span>
                {!isInfo && (isSent ? 
                    'You: '
                : 
                    (chat.type == 'group' && `${lastMessage.sender_name}: `)
                )}
                {isPhoto && '📷 '}
                {isFile && '📎 '}
                {lastMessage.message}
            </span>
            {!isInfo && 
                <div className="last-message-meta">
                    <span>{getTime(lastMessage.send_time)}</span>
                    {isSent ? 
                        (lastMessage.meta['saved'] == false ?
                            <FiClock/>
                        : lastMessage.meta['read'] ?
                            <RiCheckDoubleFill size={14}/>
                        :
                            <RiCheckFill/>)
                    :
                        (!lastMessage.meta['read'] && <div className="unread-status"/>)
                    }
                </div>
            }
        </div>
    )
}

export default LastMessage