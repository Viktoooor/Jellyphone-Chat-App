import { useRef } from "react"
import { useStore } from "../../../store/store";
import {
    FiCornerUpLeft, FiCopy, FiTrash2,
    FiEdit, FiClock
} from "react-icons/fi";
import { RiCheckFill, RiCheckDoubleFill } from "react-icons/ri";
import { copyToClipboard } from "../../../tools/copyToClipboard";
import getTime from '../../../tools/getTime'
import MessageContent from "./MessageContent";

const Message = ({ 
    isSent, message, isGroup, handleOpenProfile
}) => {
    const wsSend = useStore(state => state.wsSend)
    const setContextMenu = useStore(state => state.setContextMenu)

    const messageRef = useRef()
    const longPressTimer = useRef();

    const setReplyConfig = useStore(state => state.setReplyConfig)
    const setNotification = useStore(state => state.setNotification)
    const setMessageInput = useStore(state => state.setMessageInput)

    const messageMenuItems = [
        {
            label: 'Reply', icon: <FiCornerUpLeft />,
            onClick: () => {
                setReplyConfig({
                    isOpen: true, message_id: message.id,
                    name: message.sender_name, message: message.message,
                    edit: false
                })
                setMessageInput('')
            }
        },
        {
            label: 'Copy Text', icon: <FiCopy />,
            onClick: () => {
                copyToClipboard(messageRef.current)

                setNotification("success", "Copied to clipboard")
            }
        },
        // debug
        // {
        //     label: 'Debug message', icon: <FiHelpCircle/>,
        //     onClick: () => console.log(message)
        // }
    ];
    if(isSent){
        messageMenuItems.push({
            label: 'Edit', icon: <FiEdit />,
            onClick: () => {
                setReplyConfig({
                    isOpen: true, message_id: message.id,
                    name: message.sender_name, message: message.message,
                    edit: true
                })
                setMessageInput(message.message)
            }
        })
        messageMenuItems.push({
            label: 'Delete Message', icon: <FiTrash2 />,
            onClick: () => {
                const request = {"message_id": message.id}
                wsSend("delete_message", request)
            }, type: 'destructive'
        })
    }

    const handleOpenContextMenu = (e, rightClick) => {
        // if user opened it using right click - don't show default context menu
        if(rightClick){
            e.preventDefault()
        }
        let x = (e.touches) ? e.touches[0].pageX : e.pageX
        let y = (e.touches) ? e.touches[0].pageY : e.pageY
        
        if(x + 220 > window.innerWidth){
            x = window.innerWidth-220;
        }
        if(y + 200 > window.innerHeight){
            y = window.innerHeight-200;
        }

        setContextMenu({
            isOpen: true,
            x: x-5,
            y: y-5,
            menuItems: messageMenuItems,
            fromMessage: true
        });
    };
    
    // open messages context menu on hold for 200ms
    const handleTouchStart = (e) => {
        clearTimeout(longPressTimer.current);
        
        longPressTimer.current = setTimeout(() => {
            handleOpenContextMenu(e, false);
        }, 200);
    };
    
    // if user isn't holding - cancel opening context menu
    const handleTouchEnd = () => {
        clearTimeout(longPressTimer.current);
    };

    const extraStyles = (message.meta.width && message.meta.height) ? {
        width: '100%',
        aspectRatio: message.meta.width/message.meta.height
    } : {}
    const isPhoto = message.meta.file_type === 'photo'

    return ( 
        <div
            className={
                `message ${isSent ? 'sent' : 'received'} ${(isPhoto) ? 'photo' : ''}`
            }
            onContextMenu={(e) => handleOpenContextMenu(e, true)}
            onTouchStart={(e) => handleTouchStart(e)}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchEnd}
            style={extraStyles}
        >
            {isGroup && !isSent && !isPhoto &&
            <div className="message-sender" onClick={handleOpenProfile}>
                {message.sender_name}
            </div>
            }
            {message.reply_name && 
            <div 
                className="reply-content message-reply-content"
                title={message.meta['reply_message']}
            >
                <h4>{message.reply_name}</h4>
                <p>{message.meta['reply_message']}</p>
            </div>
            }

            <MessageContent message={message} ref={messageRef} isPhoto={isPhoto}/>

            <div className={`message-footer ${(isPhoto) ? 'photo' : ''}`}>
                {message.meta.edited && <span className="edited-tag">edited</span>}
                <span>{getTime(message.send_time)}</span>
                {isSent && (message.meta['saved'] == false ?
                    <FiClock/>
                : message.meta['read'] ?
                    <RiCheckDoubleFill size={14}/>
                :
                    <RiCheckFill/>)
                }
            </div>
        </div>
    )
}

export default Message