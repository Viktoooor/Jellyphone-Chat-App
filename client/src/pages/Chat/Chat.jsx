import Sidebar from '../../components/Chat/Sidebar';
import ChatWindow from '../../components/Chat/ChatWindow';
import InfoPanel from '../../components/Chat/InfoPanel';
import Notification from '../../components/UI/notification/Notification';
import ContextMenu from '../../components/UI/contextMenu/ContextMenu';
import { useStore } from '../../store/store';
import { useSearchParams } from 'react-router-dom'
import { useCallback, useEffect } from 'react';
import { useSocket } from '../../hooks/useSocket';
import './chat.css'

const ChatApp = () => {
	document.title = "Chat"
	const { ready, status } = useSocket()

	const selectedChatId = useStore(state => state.selectedChatId)
	const visible = useStore(state => state.visible)
	const setVisible = useStore(state => state.setVisible)

	const setSelectedChatId = useStore(state => state.setSelectedChatId)
	const [searchParams, setSearchParams] = useSearchParams()

	// chat handles
	const handleOpenInfo = useCallback(() => {
		setVisible('info')
	}, []);

	// only for mobile to return from chat to chat list
	const handleOpenChats = useCallback((e) => {
		e.stopPropagation()
		setSearchParams()
		setVisible('sidebar')
	}, [])

	// contact/group info's x button
	const handleCloseInfo = useCallback(() => {
		setVisible('chat')
	}, [])

	useEffect(() => {
		if(selectedChatId && searchParams.get('c') != selectedChatId){
			setSearchParams({'c': selectedChatId})
		}
	}, [selectedChatId])

	useEffect(() => {
		if(searchParams.get('c') && searchParams.get('c') != selectedChatId){
			setSelectedChatId(searchParams.get('c'))
			setVisible('chat')
		}else if(!searchParams.get('c')){
			setSelectedChatId()
			setVisible('sidebar')
		}
	}, [searchParams])

	return (
		<div className={`app-container ${visible}-visible`}>
			<Sidebar
				visible={visible} socketReady={status}
			/>
			<ChatWindow 
				onShowInfo={handleOpenInfo}
				onOpenChats={handleOpenChats}
				visible={visible}
			/>
			<InfoPanel
				visible={visible}
				onCloseInfo={handleCloseInfo}
			/>

			<Notification/>
			<ContextMenu/>
		</div>
	);
}

export default ChatApp;