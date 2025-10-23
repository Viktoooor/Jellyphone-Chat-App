import ContactList from "../UI/ContactList"
import { useEffect, useState } from "react"
import { useStore } from "../../store/store"

const ContactRequests = ({ setSelected, changeMenu, type }) => {
    const [requestsType, setRequestsType] = useState(type)
    const storeRequests = useStore(state => state.contactRequests)
    const contactRequests = (storeRequests && requestsType in storeRequests) ?
        storeRequests[requestsType] 
    : 
        null

    const getContactRequests = useStore(state => state.getContactRequests)

    useEffect(() => {
        if(contactRequests){
            return
        }
        const controller = new AbortController()

        async function fetchContacts(){
            await getContactRequests(controller.signal)
        }
        fetchContacts()

        return () => {
            controller.abort()
        }
    }, [])

    const handleSelect = (contact) => {
        setSelected({'type': requestsType, 'contact': contact})
        changeMenu('contactRequestProfile')
    }

    if(!contactRequests)
        return <div></div>

    return (
        <div className={`contact-menu`}>
            <div className="contact-tab-container">
                <button
                    className={`contact-tab ${(requestsType == 'ingoing') ? 'active' : ''}`}
                    onClick={() => setRequestsType('ingoing')}
                >
                    Ingoing
                </button>
                <button
                    className={`contact-tab ${(requestsType == 'outgoing') ? 'active' : ''}`}
                    onClick={() => setRequestsType('outgoing')}
                >
                    Outgoing
                </button>
            </div>
            {(contactRequests.length == 0) ?
                <div className="no-contacts">
                    <h2 style={{textAlign: "center"}}>
                        {`No ${requestsType} contact requests`}
                    </h2>
                </div>
            :
                <ContactList 
                    contacts={contactRequests}
                    onSelectContact={handleSelect}
                />
            }
        </div>
    )
}

export default ContactRequests