import { useState } from "react"
import ChatList from '../Menus/ChatList'
import Menu from '../Menus/Menu';
import Contacts from '../Menus/Contacts';
import ContactRequests from '../Menus/ContactRequests';
import Profile from '../Menus/Profile';
import EditProfile from '../Menus/EditProfile';
import ContactRequestProfile from "../Menus/ContactRequestProfile";
import { FiArrowLeft } from "react-icons/fi";
import { useStore } from "../../store/store";
import CreateGroupChat from "../Menus/CreateGroupChat";

const Sidebar = ({ visible, socketReady }) => {
	const user = useStore(state => state.user)

	const [currentMenu, setCurrentMenu] = useState('chat')
	const [selectedContactRequest, setSelectedContactRequest] = useState()

	const toggleMenu = () => {
		if(currentMenu === 'chat'){
			setCurrentMenu('menu')
		}else{
			setCurrentMenu('chat')
		}
	}

	const display = {
		'chat': <ChatList 
					changeMenu={setCurrentMenu}
				/>,
		'menu': <Menu changeMenu={setCurrentMenu}/>,
		'profile': <Profile changeMenu={setCurrentMenu}/>,
		'editProfile': <EditProfile/>,
		'contacts': <Contacts changeMenu={setCurrentMenu}/>,
		'contactRequestsIn': <ContactRequests 
								setSelected={setSelectedContactRequest}
								changeMenu={setCurrentMenu}
								type={'ingoing'}
							/>,
		'contactRequestsOut': <ContactRequests 
								setSelected={setSelectedContactRequest}
								changeMenu={setCurrentMenu}
								type={'outgoing'}
							/>,
		'contactRequestProfile': <ContactRequestProfile 
									selected={selectedContactRequest}
									changeMenu={setCurrentMenu}
								/>,
		'createChat': <CreateGroupChat changeMenu={setCurrentMenu}/>,
		'': null
	}

	// arrow that returns user to previous menu
	const handleArrow = () => {
		if(currentMenu === 'menu' || currentMenu === 'createChat'){
			setCurrentMenu('chat')
		}else if(currentMenu === 'editProfile'){
			setCurrentMenu('profile')
		}else if(currentMenu === 'contactRequestProfile'){
			setSelectedContactRequest()
			setCurrentMenu('contactRequestsIn')
		}else{
			setCurrentMenu('menu')
		}
	}

	const containerClass = (visible === 'sidebar') ? 'visible' : ''
	const arrowClass = (currentMenu != 'chat') ? 'visible' : ''

	return (
		<div className={`container sidebar ${containerClass}`}>
			<div className='user-container'>
				<button 
					className={`header-arrow ${arrowClass}`}
					onClick={handleArrow}
				>
					<FiArrowLeft/>
				</button>
				<div className="user-profile" onClick={toggleMenu}>
					<img src={user.picture} alt="User" />
					<span>{user.first_name}</span>
				</div>
			</div>
			{socketReady && display[currentMenu]}
		</div>
	);
}

export default Sidebar