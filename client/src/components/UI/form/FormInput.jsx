import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

const FormInput = ({ type, placeholder, value, handle, handleChange, error }) => {
    const [inputType, setInpputType] = useState(type)

    const handleShowPassword = () => {
        if(inputType == 'password')
            setInpputType('text')
        else
            setInpputType('password')
    }

    const inputClass = (error.length != 0) ? "input-wrapper error" : "input-wrapper"

    return (
        <div className="form-group">
            <div className={inputClass}>
                <input 
                    type={inputType} placeholder="&nbsp;" value={value} 
                    onChange={handleChange(handle)} 
                    required
                />
                <span className="placeholder-text">{placeholder}</span>
                {type == 'password' && 
                    <div className="show-password" onClick={handleShowPassword}>
                        {inputType == 'password' ?
                            <FiEye size={20}/>
                        :
                            <FiEyeOff size={20}/>
                        }
                    </div>
                }
            </div>
        </div>
    )
}

export default FormInput