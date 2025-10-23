import { useStore } from "../../../store/store"
import Member from "./Member"

const MemberList = ({ members, isAdmin }) => {
    const user = useStore(state => state.user)

    if(!members || members.length == 0){
        return null
    }

    return (
        <div className="select-list">
            {members.map((member) => (
                <Member
                    key={member.user_id} member={member} user={user} isAdmin={isAdmin}
                />
            ))}
        </div>
    )
}

export default MemberList