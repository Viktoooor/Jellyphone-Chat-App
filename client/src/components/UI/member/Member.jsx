import { FiUser, FiUserX } from "react-icons/fi";
import { useStore } from "../../../store/store"

const Member = ({ member, user, isAdmin }) => {
    const setContextMenu = useStore(state => state.setContextMenu)
    const contacts = useStore(state => state.contacts)
    const setNotification = useStore(state => state.setNotification)
    const selectedChatId = useStore(state => state.selectedChatId)
    const handleSelectChat = useStore(state => state.handleSelectChat)
    const handleRemoveMember = useStore(state => state.handleRemoveMember)

    const handleSelect = () => {
        const chat_id = Object.keys(contacts).find(key => {
            return contacts[key].user_id === member.user_id
        })
        if(chat_id){
            handleSelectChat({'chat_id': chat_id}, true)
        }else{
            setNotification('info', "You don't have contact with this user")
        }
    }

    const memberMenuItems = [
        {
            label: 'Open profile', icon: <FiUser />,
            onClick: () => handleSelect()
        }
    ];
    if(isAdmin){
        memberMenuItems.push({
            label: 'Remove member', icon: <FiUserX />,
            onClick: () => {
                handleRemoveMember(selectedChatId, member.user_id)
            }, type: 'destructive' 
        })
    }

    const onSelect = (e) => {
        if(member.user_id == user.id)
            return

        let x = (e.touches) ? e.touches[0].pageX : e.pageX
        let y = (e.touches) ? e.touches[0].pageY : e.pageY
        
        if(x + 220 > window.innerWidth){
            x = window.innerWidth-220;
        }
        if(y + 170 > window.innerHeight){
            y = window.innerHeight-170;
        }

        setContextMenu({
		    isOpen: true, x: x, y: y,
            menuItems: memberMenuItems, fromMessage: false
        })
    }

    return (
        <div
            className="select-member-item"
            onClick={onSelect}
        >
            <img src={member.picture}/>
            <div className="select-member-info">
                <h4>{member.first_name}</h4>
            </div>

            {member.role == 'admin' &&
                <div className="select-member-role">admin</div>
            }
        </div>
    )
}

export default Member