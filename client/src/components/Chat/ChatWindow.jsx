import {
	FiArrowLeft, FiMoreVertical,
	FiEdit2, FiLogOut
} from "react-icons/fi";
import { selectChat, useStore } from "../../store/store";
import MessageList from "../UI/message/MessageList";
import MessageInput from "../UI/message/MessageInput";
import { useRef } from "react";

const ChatWindow = ({ onShowInfo, onOpenChats, visible }) => {
	const user = useStore(state => state.user) 
	const chat = useStore(selectChat)
	const contactStatus = useStore(state => {
        if(state.contactStatus && state.selectedChatId in state.contactStatus){
            return state.contactStatus[state.selectedChatId]
        }
        return 'offline'
    })

	const contextMenu = useStore(state => state.contextMenu)
	const setContextMenu = useStore(state => state.setContextMenu)

	const threeDotsRef = useRef()

	const setIsEdit = useStore(state => state.setIsGroupEdit)

	const handleLeaveGroup = useStore(state => state.handleLeaveGroup)
	
	const chatMenuItems = [
		{ 
			label: 'Edit', icon: <FiEdit2 />, 
			onClick: () => {
				onShowInfo()
				setIsEdit(true)
			}
		},
		{ 
			label: 'Leave group', icon: <FiLogOut />,
			onClick: () => {
				handleLeaveGroup(chat.chat_id)
			}, type: 'destructive'
		},
	]

	// debug
	// const [counter, setCounter] = useState(0)
	// const addMessage = useStore(state => state.addMessage)
	// const sendMessage = () => {
	// 	for(let i = counter; i<counter+50; i++){
	// 		const new_message = {
	// 			"id": i,
	// 			"type": "send", "chat_id": chat.chat_id,
	// 			"message": "MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM",
	// 			"meta": {
	// 				"sender_id": "user.id",
	// 				"read": false
	// 			},
	// 			"send_time": "2025-09-16 17:00:00.00"
	// 		}
	// 		setTimeout(() => {
	// 			addMessage(chat.chat_id, new_message)
	// 		}, 100)
	// 	}
	// 	setCounter(prev => prev+50)
    // }

	const handleOpenChatMenu = (e) => {
		e.stopPropagation()
		if(contextMenu.isOpen){
			setContextMenu({...contextMenu, isOpen: false})
		}else{
			const rect = threeDotsRef.current.getBoundingClientRect()
			setContextMenu({
				isOpen: true,
				x: rect.left-150,
				y: rect.bottom+10,
				menuItems: chatMenuItems,
				fromMessage: false
			})
		}
	}

	const containerClass = (visible == 'chat') ? 'visible' : ''

	if(!chat){
		return <div className="container"></div>
	}

	return (
		<div className={`container chat-window ${containerClass}`}>
			<div className="chat-header">
				<button className='header-arrow' onClick={onOpenChats}>
					<FiArrowLeft/>
				</button>
				<div 
					className='chat-header-info'
					title="Click for contact info"
					onClick={onShowInfo}
				>
					{(contactStatus != 'offline') && 
					<div className="online-status header"></div>
					}
					<img src={chat.info.picture}/>
					<div className="header-info-content">
						<h3>
							{chat.type == 'contact' ?
								chat.info.first_name
							:
								chat.info.name
							}
						</h3>
						{(contactStatus == 'typing') && <span>typing...</span>}
					</div>
				</div>
				{chat.type == 'group' && 
				<button 
					className="chat-menu-button" 
					onClick={handleOpenChatMenu}
					title="More options"
					ref={threeDotsRef}
				>
					<FiMoreVertical size={24}/>
				</button>
				}
			</div>
			{/* debug */}
			{/* <button 
				onClick={sendMessage}
				className="default-button blue-button"
			>
				Add debug message
			</button> */}

			<div className='messages-container'>
				<MessageList 
					user_id={user.id}
				/>
				<MessageInput 
					chat={chat}
				/>
			</div>
		</div>
	);
};

export default ChatWindow