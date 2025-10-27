import { useStore, selectJoinedChats } from "../../store/store";
import { memo, useState } from "react";
import { FiUserPlus, FiSearch, FiUsers } from "react-icons/fi";
import ChatItem from "../UI/chat/ChatItem";
import Button from "../UI/button/Button";
import AddContactModal from "../UI/modal/AddContact/AddContactModal";

const ChatList = memo(({ changeMenu }) => {
	const selectedChatId = useStore(state => state.selectedChatId)
	const onSelectChat = useStore(state => state.handleSelectChat)

    const chatList = useStore(selectJoinedChats)
    // just to make last messages change
    const messages = useStore(state => state.messages)
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [search, setSearch] = useState("")

    if(!chatList)
        return null
    
    const filteredChats = chatList.filter(chat => {
        if(chat.type == 'contact'){
            return chat.info.first_name.toLowerCase().includes(search.toLowerCase())
        }
        return chat.info.name.toLowerCase().includes(search.toLowerCase())
    });
    
    if(chatList.length == 0){
        return (
            <div className='contact-menu empty'>
                <h2 style={{textAlign: "center"}}>No contacts</h2>
                <Button
                    label={'Add contact'} icon={<FiUserPlus/>} type='primary'
                    full={true} customClass={'add-contact-button'}
                    onClick={() => setIsModalOpen(true)}
                />
                <AddContactModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    openRequests={() => changeMenu('contactRequestsOut')}
                />
            </div>
        )
    }

    return (
        <div className='contact-menu'>
            <div className="search-bar">
                <FiSearch />
                <input 
                    type="text" placeholder="Search" id="chat-search"
                    onChange={(e) => setSearch(e.target.value)} value={search}
                />
            </div>
            <div className="contact-list">
            {filteredChats.map((chat) => (
                <ChatItem 
                    key={chat.chat_id} lastMessage={chat.lastMessage}
                    chat={chat} onSelectChat={onSelectChat}
                    active={(chat.chat_id == selectedChatId)}
                />
            ))}
            </div>
            <div className="create-chat">
                <Button
                    label={'Create group chat'} icon={<FiUsers/>} type='primary'
                    full={true}
                    onClick={() => changeMenu('createChat')}
                />
            </div>
        </div>
    )
})

export default ChatList