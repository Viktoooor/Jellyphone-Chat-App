import { FiEdit, FiX } from "react-icons/fi";
import ContactInfo from "../Info/ContactInfo";
import GroupInfo from "../Info/GroupInfo";
import { selectChat, useStore } from "../../store/store";

const InfoPanel = ({ visible, onCloseInfo }) => {
    const chat = useStore(selectChat)
    
    const isEdit = useStore(state => state.isGroupEdit)
    const setIsEdit = useStore(state => state.setIsGroupEdit)

    if(!chat)
        return null
    
    const display = {
        'contact': <ContactInfo contact={chat.info} />,
        'group': <GroupInfo
                    group={chat.info}
                    selectedChatId={chat.chat_id}
                    isAdmin={chat.role == 'admin'}
                 />,
        '': null
    }

    const handleCloseInfo = () => {
        setIsEdit(false)
        onCloseInfo()
    }

    const containerClass = (visible == 'info') ? 'visible' : ''

    return (
        <div 
            className={`container contact-info-panel ${containerClass}`}
        >
            <div className="info-header">
                <button className='header-arrow visible' onClick={handleCloseInfo}>
                    <FiX/>
                </button>
                <h3>
                    {chat.type == 'group' ? "Group info" : "User info"}
                </h3>
                {chat.type == 'group' ?
                <button 
                    className='header-arrow visible'
                    onClick={() => setIsEdit(!isEdit)}
                >
                    <FiEdit/>
                </button>
                :
                <div style={{width: '44px'}}></div>
                }
            </div>
            {display[chat.type]}
        </div>
    );
};

export default InfoPanel