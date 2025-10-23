import { FiCheck } from 'react-icons/fi';
import { useState } from 'react';
import { useStore } from '../../store/store';
import Textarea from '../UI/textarea/Textarea';
import EditPicture from '../UI/edit/EditPicture';
import EditName from '../UI/edit/EditName';
import Button from '../UI/button/Button';

const EditProfile = () => {
    const user = useStore(state => state.user)
    const userBio = (user.bio) ? user.bio : ''
    
    const [selectedPicture, setSelectedPicture] = useState()

    const [userName, setUserName] = useState(user.user_name)
    const [firstName, setFirstName] = useState(user.first_name)
    const [bio, setBio] = useState(userBio)

    const showNotification = useStore(state => state.showNotification)
	const setNotification = useStore(state => state.setNotification)

    const [loading, setLoading] = useState(false)
    const changeInfo = useStore(state => state.changeInfo)
    
    const handleSubmit = async () => {
        setLoading(true)

        const res = await changeInfo(
            {'user_name': userName, 'first_name': firstName, 'bio': bio},
            selectedPicture
        )

        if(res === true){
            setNotification("success", "Profile changed")
        }else{
            setNotification("error", "Unexpected error")
        }

        setLoading(false)
    }

    return (
        <div className="contact-info-content">
            <div className="info-content-wrapper">
                <EditPicture 
                    name={user.first_name} src={user.picture}
                    setSelectedPicture={setSelectedPicture}
                />
                
                <EditName
                    label="First name"
                    hint="This is how other users will see your name"
                    name={firstName} setName={setFirstName}
                />
                <EditName
                    label="Username"
                    hint={
                        `Other people can search and find you by this username.
                        You can use letters from a-z, digits 0-9 and underscore.
                        Length must be between 3 and 32 characters`
                    }
                    name={userName} setName={setUserName}
                />
                
                <div className='profile-group'>
                    <label htmlFor='set-bio'>Bio</label>
                    <Textarea 
                        value={bio} handleChange={setBio}
                    />
                </div>
            </div>

            <Button
                label={'Save changes'} icon={<FiCheck/>} type='primary'
                full={true} customClass={'save-changes-button'}
                onClick={handleSubmit} disabled={showNotification || loading}
                loading={loading}
            />
        </div>
    )
}

export default EditProfile