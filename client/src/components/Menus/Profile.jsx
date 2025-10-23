import { FiEdit2 } from 'react-icons/fi';
import UserInfo from '../UI/UserInfo';
import { useStore } from '../../store/store';
import Button from '../UI/button/Button';

const Profile = ({ changeMenu }) => {
    const user = useStore(state => state.user)

    return (
        <div className="contact-info-content">
            <UserInfo user={user}/>
            <Button
                label={'Edit profile'} icon={<FiEdit2/>} type='primary'
                full={true} customClass={'edit-profile-button'}
                onClick={() => changeMenu('editProfile')}
            />
        </div>
    );
}

export default Profile