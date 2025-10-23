import { FiUserPlus } from "react-icons/fi";
import ContactList from "../UI/ContactList";
import { useState, memo } from "react";
import { useStore } from "../../store/store";
import Button from "../UI/button/Button";
import AddContactModal from "../UI/modal/AddContact/AddContactModal";

const Contacts = memo(({ changeMenu }) => {
    const contactsStore = useStore(state => state.contacts)
	const onSelectContact = useStore(state => state.handleSelectChat)

    if(!contactsStore) return null;
    
    const contacts = Object.values(contactsStore)
    const sorted = [...contacts]
    sorted.sort((a, b) => a.first_name.localeCompare(b.first_name))

    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="contact-menu">
            {contacts.length == 0 ? 
                <h2 style={{textAlign: "center", marginTop: "30vh"}}>No contacts</h2>
            :
                <ContactList 
                    contacts={sorted} onSelectContact={onSelectContact}
                />   
            }
            <Button
                label={'Add contact'} icon={<FiUserPlus/>} type='primary'
                full={true} customClass={'add-contact-button'}
                onClick={() => setIsModalOpen(true)}
            />
            <AddContactModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
                openRequests={() => changeMenu('contactRequestsOut')}
			/>
        </div>
    )
})

export default Contacts