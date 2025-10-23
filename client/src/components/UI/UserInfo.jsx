import { useRef } from "react";
import { FiAtSign, FiInfo } from "react-icons/fi";
import { copyToClipboard } from "../../tools/copyToClipboard";
import { useStore } from "../../store/store";

const UserInfo = ({ user }) => {
    const usernameRef = useRef()
    const bioRef = useRef()

    const setNotification = useStore(state => state.setNotification)

    const handleCopy = (ref) => {
        copyToClipboard(ref)

        setNotification("success", "Copied to clipboard")
    }

    return (
        <div className="info-content-wrapper">
            <img src={user.picture} alt={user.first_name} className="info-avatar" />
            <h2>{user.first_name}</h2>
            <div 
                className="info-details"
                onClick={() => handleCopy(usernameRef.current)}
            >
                <FiAtSign/>
                <div className='info-row'>
                    <span>Username</span>
                    <p id='contact-username' ref={usernameRef}>
                        @{user.user_name}
                    </p>
                </div>
            </div>
            {user.bio && (user.bio.length > 0) && (
                <div
                    className="info-details"
                    onClick={() => handleCopy(bioRef.current)}
                >
                    <FiInfo/>
                    <div className='info-row'>
                        <span>Bio</span>
                        <p id='contact-username' ref={bioRef}>{user.bio}</p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default UserInfo