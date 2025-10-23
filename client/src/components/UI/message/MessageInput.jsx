import { useRef, memo } from "react";
import { FiCheck } from "react-icons/fi";
import { useStore } from "../../../store/store";
import MessageReply from "./MessageReply";
import useDebounce from "../../../hooks/useDebounce";
import FileInput from "../input/FileInput";
import { IoArrowUp } from "react-icons/io5";

const DELAY = 1000 // delay for sending 'typing... request'

const MessageInput = memo(({ chat }) => {
    const wsSend = useStore(state => state.wsSend)
    const sendMessage = useStore(state => state.sendMessage)
    const editMessage = useStore(state => state.handleEditMessage)

    const message = useStore(state => state.messageInput)
    const setMessage = useStore(state => state.setMessageInput)
    const isTyping = (message.length > 0)

    const replyConfig = useStore(state => state.replyConfig)
    const handleCloseReply = useStore(state => state.closeReply)
    
    const inputRef = useRef()

    const handleSendMessage = () => {
        // on mobile input doesn't jump after sending message
        const new_message = message
        setMessage('')
        if(inputRef)
            inputRef.current.select()
        
        if(replyConfig.edit == false){
            sendMessage(chat.chat_id, new_message)
        }else{
            editMessage(chat.chat_id, replyConfig.message_id, new_message)
        }
        handleCloseReply()
    }

    const handleChange = (e) => {
        setMessage(e.target.value)
    }

    useDebounce(isTyping, DELAY, () => {
        if(chat.type == 'contact'){
            const request = {
                'recipient_id': chat.info.user_id, 
                'chat_id': chat.chat_id, 'status': (isTyping) ? 'typing' : 'online'
            }
            wsSend('send_status', request)
        }
    })

    return (
        <div className="message-backdrop">
        <div className="message-composite">
            {replyConfig.isOpen && 
            <MessageReply 
                replyConfig={replyConfig} onCloseReply={handleCloseReply}
            />
            }

            <div className="message-input">
                <FileInput/>

                <input 
                    id="message-input"
                    type="text" placeholder="Message"
                    onChange={handleChange} value={message}
                    onKeyDown={(e) => {
                        (e.key == 'Enter') ? handleSendMessage() : null
                    }}
                    ref={inputRef}
                />

                <button onClick={handleSendMessage}>
                    {replyConfig.edit ?
                        <FiCheck size={26}/>
                    :
                        <IoArrowUp size={26}/>
                    }
                </button>
            </div>
        </div>
        </div>
    )
})

export default MessageInput