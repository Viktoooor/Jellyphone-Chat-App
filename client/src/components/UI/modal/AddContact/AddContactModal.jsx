import { useState } from 'react';
import { isUserNameValid } from '../../../../tools/validateInput';
import { useStore } from '../../../../store/store';
import Modal from '../Modal';
import '../style.css'

const AddContactModal = ({ isOpen, onClose, openRequests }) => {
    const [username, setUsername] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSendRequest = useStore(state => state.handleSendRequest)
    const handleAddContact = async () => {
        if(!isUserNameValid(username)){
            setError('Invalid username')
            return
        }

        setLoading(true)

        const res = await handleSendRequest(username)
        
        setLoading(false)
        if(!res.ok){
            setError(res.message)
        }else{
            setError('')
            openRequests()
            onClose()
        }
	}

    if(!isOpen) return null

    return (
        <Modal
            header='New contact' onClose={onClose} onBackropClick={onClose}
            submitLabel='Add contact' onSubmit={handleAddContact} loading={loading}
        >
            <div className="dialog-body">
                <label>Username</label>
                <input 
                    id="username-input" 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => {
                        (e.key == 'Enter') ? handleAddContact() : null
                    }}
                />
                <span>{error}</span>
            </div>
        </Modal>
    )
}

export default AddContactModal