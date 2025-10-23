import { FiLoader } from "react-icons/fi"
import './style.css'
import { memo } from "react"

const Button = memo(({ label, icon, type, full,
    customClass, onClick, loading, disabled }) => {
    const fullClass = (full) ? 'full' : ''
    const custom = (customClass) ? customClass : ''

    return (
        <button 
            className={`default-button ${type} ${fullClass} ${custom}`}
            onClick={onClick}
            disabled={disabled}
        >    
            {loading ? 
                <FiLoader size={18} className="loading"/>
            :
                <>
                    {icon}
                    <span>{label}</span>
                </>
            }
        </button>
    )
})

export default Button