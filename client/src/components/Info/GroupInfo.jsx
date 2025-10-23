import { useStore, selectMembers, selectName, selectPicture } from "../../store/store"
import { FiLogOut } from "react-icons/fi"
import MemberList from "../UI/member/MemberList"
import EditGroupInfo from "./EditGroupInfo"
import Button from "../UI/button/Button"
import { useState, memo } from "react"

const GroupInfo = memo(({ group, selectedChatId, isAdmin }) => {
    const name = useStore(selectName)
    const picture = useStore(selectPicture)

    const isEdit = useStore(state => state.isGroupEdit)
    
    const members = useStore(selectMembers)

    const [loading, setLoading] = useState(false)
    const leaveGroup = useStore(state => state.handleLeaveGroup)
    const handleLeaveGroup = async () => {
        setLoading(true)
        await leaveGroup(selectedChatId)
        setLoading(false)
    }

    if(isEdit){
        return (
            <EditGroupInfo 
                group={group} selectedChatId={selectedChatId}
            />
        )
    }

    return (
        <div className="contact-info-content">
            <div className="info-content-wrapper">
                <img src={picture} alt={name} className="info-avatar" />
                <h2>{name}</h2>
                <div className="info-members">
                    <h3>Members:</h3>
                    <MemberList members={members} isAdmin={isAdmin}/>
                </div>
            </div>
            <Button
                label={'Leave Group'} icon={<FiLogOut/>} type='destructive'
                full={true} customClass={'remove-contact-button'}
                onClick={handleLeaveGroup}
                loading={loading} disabled={loading}
            />
        </div>
    )
})

export default GroupInfo