import { useState, useEffect, memo } from 'react';
import ReactDOM from 'react-dom';
import { FiCheckCircle, FiXCircle, FiAlertTriangle, FiInfo } from 'react-icons/fi';
import { useStore } from '../../../store/store';
import './style.css';

const Notification = memo(() => {
    const isOpen = useStore(state => state.showNotification)
    const setShowNotification = useStore(state => state.setShowNotification)
    const config = useStore(state => state.notificationConfig)

    const { type, message } = config
    const [isActive, setIsActive] = useState(false);

    const typeConfig = {
        success: { Icon: FiCheckCircle, className: 'success' },
        error: { Icon: FiXCircle, className: 'error' },
        warning: { Icon: FiAlertTriangle, className: 'warning' },
        info: { Icon: FiInfo, className: 'info' },
    };

    const { Icon, className } = typeConfig[type] || typeConfig.info; // default to 'info'

    useEffect(() => {
        if(isOpen){
            setIsActive(true)
            setTimeout(() => {
                setIsActive(false)
                // 100ms fading animation
                setTimeout(() => {setShowNotification(false)}, 100)
            }, 2000)
        }
    }, [isOpen])

    if(!isOpen) return null

    return ReactDOM.createPortal(
        <div 
            className={`notification-content ${isActive ? 'active' : ''} ${className}`}
        >
            <div className="notification-icon">
                <Icon size={28} />
            </div>
            <h3>{message}</h3>
        </div>,
        document.getElementById('portal-root')
    );
});

export default Notification