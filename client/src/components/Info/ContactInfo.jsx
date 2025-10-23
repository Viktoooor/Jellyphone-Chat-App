import UserInfo from "../UI/UserInfo"
import { FiTrash2 } from "react-icons/fi"
import Button from "../UI/button/Button"
import { useStore } from "../../store/store"
import { useState, memo } from "react"

const ContactInfo = memo(({ contact }) => {
    const [loading, setLoading] = useState(false)
    const removeContact = useStore(state => state.handleRemoveContact)

    const handleRemoveContact = async () => {
        setLoading(true)
        await removeContact(contact.user_id)
        setLoading(false)
    }

    return (
        <div className="contact-info-content">
            <UserInfo user={contact}/>
            <Button
                label={'Remove Contact'} icon={<FiTrash2/>} type='destructive'
                full={true} customClass={'remove-contact-button'} loading={loading}
                onClick={handleRemoveContact}
                disabled={loading}
            />
        </div>
    )
})

export default ContactInfo