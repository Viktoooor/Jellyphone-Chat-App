import { useState } from "react"
import { FiCheck } from "react-icons/fi"
import { useStore } from "../../store/store"
import EditPicture from '../UI/edit/EditPicture'
import EditName from "../UI/edit/EditName"
import EditList from "../UI/edit/EditList"
import Button from "../UI/button/Button"

const EditGroupInfo = ({ group, selectedChatId }) => {
    const [newGroupName, setNewGroupName] = useState(group.name)
    const [selectedPicture, setSelectedPicture] = useState()
    const [selectedMembers, setSelectedMembers] = useState([])
    
    const contactsStore = useStore(state => state.contacts)
    const memberIds = group.members.map(member => member.user_id)
    const [contacts, setContacts] = useState(
        Object.values(contactsStore).filter(c => !memberIds.includes(c.user_id))
    )
    
    const [loading, setLoading] = useState(false)
    const editGroup = useStore(state => state.handleEditGroup)
    const handleSubmit = async () => {
        // if any changes were omited
        if(
            newGroupName != group.name || selectedPicture ||
            selectedMembers.length > 0
        ){
            setLoading(true)
            const membersToAdd = selectedMembers.map((member) => member.user_id)
            await editGroup(
                selectedChatId, newGroupName, membersToAdd, selectedPicture
            )
            setLoading(false)
        }
    }

    return (
        <div className="contact-info-content">
            <EditPicture 
                name={group.name} src={group.picture}
                setSelectedPicture={setSelectedPicture}
            />
            
            <EditName
                label="Group name"
                name={newGroupName} setName={setNewGroupName}
            />

            <EditList
                label="Add members"
                deselectList={selectedMembers} setDeselectList={setSelectedMembers}
                selectList={contacts} setSelectList={setContacts}
            />
            <EditList
                label="Select contacts"
                hint="Select new group members from the list above"
                deselectList={contacts} setDeselectList={setContacts}
                selectList={selectedMembers} setSelectList={setSelectedMembers}
            />

            <Button
                label={'Save changes'} icon={<FiCheck/>} type='primary'
                full={true} customClass={'create-group-button'}
                onClick={handleSubmit} loading={loading} disabled={loading}
            />
        </div>
    )
}

export default EditGroupInfo