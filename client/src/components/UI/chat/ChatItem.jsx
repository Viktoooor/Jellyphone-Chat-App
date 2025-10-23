import { useStore } from "../../../store/store"
import LastMessage from "./LastMessage"

const ChatItem = ({ chat, active, onSelectChat }) => {
    const status = useStore(state => {
        if(state.contactStatus && chat.chat_id in state.contactStatus){
            return state.contactStatus[chat.chat_id]
        }
        return 'offline'
    })
    
    return (
        <div
            className={
                `contact-item ${(active) ? 'active' : ''}`
            }
            onClick={() => onSelectChat(chat, false)}
        >
            <img src={chat.info.picture}/>
            {(status != 'offline') && <div className="online-status"></div>}
            <div className='contact-item-info'>
                <h3>
                    {chat.type == 'contact' ?
                        chat.info.first_name
                    :
                        chat.info.name
                    }
                </h3>
                {(status == 'typing') ?
                    <span>typing...</span>
                :
                    <LastMessage 
                        chat={chat}
                    />
                }
            </div>
        </div>
    )
}

export default ChatItem