import { useState } from "react"
import { FiUsers } from "react-icons/fi"
import { useStore } from "../../store/store"
import { isGroupNameValid } from '../../tools/validateInput'
import EditPicture from "../UI/edit/EditPicture"
import EditName from "../UI/edit/EditName"
import EditList from "../UI/edit/EditList"
import Button from "../UI/button/Button"

const CreateGroupChat = ({ changeMenu }) => {
    const contactsStore = useStore(state => state.contacts)
    
	const setNotification = useStore(state => state.setNotification)

    const [contacts, setContacts] = useState(Object.values(contactsStore))
    const [selectedMembers, setSelectedMembers] = useState([])

    const [name, setName] = useState('')
    const [selectedPicture, setSelectedPicture] = useState()
    const [loading, setLoading] = useState(false)

    const createGroup = useStore(state => state.createGroup)
    const handleCreateGroup = async () => {
        setLoading(true)

        if(!isGroupNameValid(name)){
            setNotification('error', 'Invalid group name')
            setLoading(false)
            return;
        }
        if(selectedMembers.length == 0){
            setNotification('error', 'Select at least one member')
            setLoading(false)
            return;
        }

        const memberIds = selectedMembers.map((member) => member.user_id)
        const res = await createGroup(name, memberIds, selectedPicture)

        setLoading(false)
        if(res == true)
            changeMenu('chat')
    }

    return (
        <div className="contact-info-content">
            <EditPicture 
                name="group picture" src="/default.png"
                setSelectedPicture={setSelectedPicture}
            />

            <EditName label="Group name" name={name} setName={setName} />

            <EditList
                label="Select contacts"
                deselectList={selectedMembers} setDeselectList={setSelectedMembers}
                selectList={contacts} setSelectList={setContacts}
            />
            <EditList
                label="Select contacts"
                hint="Select your group members from the list above"
                deselectList={contacts} setDeselectList={setContacts}
                selectList={selectedMembers} setSelectList={setSelectedMembers}
            />

            <Button
                label={'Create group'} icon={<FiUsers/>} type='primary'
                full={true} customClass={'create-group-button'}
                onClick={handleCreateGroup} disabled={loading}
                loading={loading}
            />
        </div>
    )
}

export default CreateGroupChat