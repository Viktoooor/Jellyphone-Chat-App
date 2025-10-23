import { useState } from "react"
import { useStore } from "../../store/store"
import Button from "../UI/button/Button"
import UserInfo from "../UI/UserInfo"
import { FiCheck, FiX } from "react-icons/fi"

const ContactRequestProfile = ({ selected, changeMenu }) => {
    const { type, contact } = selected
    const [rejectLoading, setRejectLoading] = useState(false)
    const [addLoading, setAddLoading] = useState(false)

    const acceptContact = useStore(state => state.acceptContactRequest)
    const rejectContact = useStore(state => state.rejectContactRequest)

    const showNotification = useStore(state => state.showNotification)

    const handleAddContact = async () => {
        setAddLoading(true)
        const res = await acceptContact(contact.user_id)
        setAddLoading(false)

        if(res == true)
            changeMenu('contactRequestsIn')
    }
    
    const handleRejectContact = async () => {
        setRejectLoading(true)
        const res = await rejectContact(contact.user_id)
        setRejectLoading(false)

        if(res === true)
            changeMenu('contactRequestsIn')
    }

    const disabled = (rejectLoading || addLoading || showNotification)

    return (
        <div className="contact-info-content">
            <UserInfo user={contact}/>
            {type == 'ingoing' &&
                <div className="button-container">
                    <Button
                        label={'Reject'} icon={<FiX/>} type='destructive'
                        full={true} onClick={handleRejectContact}
                        disabled={disabled} loading={rejectLoading}
                    />
                    <Button
                        label={'Add'} icon={<FiCheck/>} type='primary'
                        full={true} onClick={handleAddContact}
                        disabled={disabled} loading={addLoading}
                    />
                </div>
            }
        </div>
    )
}

export default ContactRequestProfile