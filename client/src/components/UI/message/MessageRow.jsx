import { useState } from "react";
import { useStore } from "../../../store/store";
import Message from "./Message";
import { selectChat } from "../../../store/store";

const MessageRow = ({ message, isSent }) => {
    const chat = useStore(selectChat)
    const selectChatId = useStore(state => state.handleSelectChat)
    const [startX, setStartX] = useState(null);
    const [swipeX, setSwipeX] = useState(0);
    const [isSwiping, setIsSwiping] = useState(false);

    const setReplyConfig = useStore(state => state.setReplyConfig)
    const setMessageInput = useStore(state => state.setMessageInput)

    const handleStart = (e) => {
        setStartX(e.touches[0].clientX);
        setIsSwiping(true);
    };

    const handleTouchMove = (e) => {
        if(startX === null)
            return;

        const currentX = e.touches[0].clientX;
        let deltaX = currentX - startX;

        deltaX = Math.min(0, deltaX);
        deltaX = Math.max(deltaX, -80);

        setSwipeX(deltaX);
    };

    const handleEnd = () => {
        if(Math.abs(swipeX) > 60){
            setReplyConfig({
                isOpen: true, message_id: message.id, edit: false,
                name: message.sender_name, message: message.message
            })
            setMessageInput('')
        }
        
        setIsSwiping(false);
        setSwipeX(0);
        setStartX(null);
    };
    
    let sender = null
    if(chat.type == 'group' && !isSent){
        sender = chat.info.members.find(
            c => c.user_id == message.meta.sender_id
        )
    }

    const contacts = useStore(state => state.contacts)
    const handleOpenProfile = () => {
        if(sender){
            let chat_id = Object.keys(contacts).find(
                key => contacts[key].user_id == sender.user_id
            )
            selectChatId({"chat_id": chat_id}, true)
        }
    }

    return (
        <div 
            className={`message-row ${isSwiping ? 'swiping' : ''}`}
            onTouchStart={handleStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleEnd}
            style={{ transform: `translateX(${swipeX}px)` }}
        >
            {sender &&
                <div className="message-pfp" onClick={handleOpenProfile}>
                    <img src={sender.picture}/>
                </div>
            }
            <Message 
                message={message}
                isSent={isSent}
                isGroup={chat.type == 'group'}
                handleOpenProfile={handleOpenProfile}
            />
        </div>
    )
}

export default MessageRow