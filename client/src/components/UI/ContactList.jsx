import { useState } from "react";
import { FiSearch } from "react-icons/fi";

const ContactList = ({ contacts, onSelectContact }) => {
    const [search, setSearch] = useState("")

    const filteredContacts = contacts.filter(contact =>
        contact.first_name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <div className="search-bar">
                <FiSearch />
                <input 
                    type="text" placeholder="Search" 
                    onChange={(e) => setSearch(e.target.value)} value={search}
                />
            </div>
            <div className="contact-list">
            {filteredContacts.map((contact) => (
                <div
                    key={contact.user_id}
                    className={`contact-item`}
                    onClick={() => onSelectContact(contact, true)}
                >
                    <img src={contact.picture} alt={contact.first_name} />
                    <div className='contact-item-info'>
                        <h3>{contact.first_name}</h3>
                    </div>
                </div>
            ))}
            </div>
        </>
    )
}

export default ContactList