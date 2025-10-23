import ReactDOM from 'react-dom';
import { useEffect, useRef, memo } from 'react';
import { useStore } from '../../../store/store';
import './style.css'

const ContextMenu = memo(() => {
    const menuRef = useRef()
    const config = useStore(state => state.contextMenu)
    const onClose = useStore(state => state.closeContextMenu)

    useEffect(() => {
        const handleClickOutside = (event) => {
            if(menuRef.current && !menuRef.current.contains(event.target)){
                onClose(false);
            }
        };

        if(config.isOpen && config.fromMessage){
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [config.isOpen, onClose, config.fromMessage]);

    const handleItemClick = (onClick) => {
        if(onClick)
            onClick();
        onClose();
    };
    
    if(!config.isOpen || !config.menuItems){
        return null;
    }

    return ReactDOM.createPortal(
        <div 
            className="backdrop"
            onClick={() => onClose(config.fromMessage)}
            onContextMenu={() => onClose(false)}
        >
            <div
                ref={menuRef}
                className="context-menu"
                style={{ top: `${config.y}px`, left: `${config.x}px` }}
            >
            <ul>
                {config.menuItems.map((item, index) => (
                <li 
                    key={index} 
                    className={item.type === 'destructive' ? 'destructive' : ''}
                >
                    <button onClick={() => handleItemClick(item.onClick)}>
                    {item.icon} {item.label}
                    </button>
                </li>
                ))}
            </ul>
            </div>
        </div>, document.getElementById('portal-root')
    );
});

export default ContextMenu;