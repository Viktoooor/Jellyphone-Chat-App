import { FaUserCircle } from "react-icons/fa";
import { FiUsers, FiUserCheck, FiLogOut } from "react-icons/fi";
import { useStore } from "../../store/store";
import Button from "../UI/button/Button";

const Menu = ({ changeMenu }) => {
    const logout = useStore(state => state.logout)

    return (
        <div className="user-menu">
            <div className="menu-item" onClick={() => changeMenu('profile')}>
                <FaUserCircle/>
                <p>Profile</p>
            </div>
            <div className="menu-item" onClick={() => changeMenu('contacts')}>
                <FiUsers/>
                <p>Contacts</p>
            </div>
            <div className="menu-item" onClick={() => changeMenu('contactRequestsIn')}>
                <FiUserCheck/>
                <p>Contact Requests</p>
            </div>

            <Button
                label={'Logout'} icon={<FiLogOut/>} type='destructive'
                full={true} customClass={'logout-button'}
                onClick={logout}
            />
        </div>
    )
}

export default Menu