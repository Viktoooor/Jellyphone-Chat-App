import { useState } from "react";
import FormInput from "../UI/form/FormInput";
import { useStore } from "../../store/store";
import { isPasswordValid } from "../../tools/validateInput";
import { FiArrowLeftCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const PasswordForm = ({ data, handleChange, prevPage }) => {
    const register = useStore((state) => state.register)

    const navigate = useNavigate()
    const [loading, setLoading] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async () => {
        if(!isPasswordValid(data.password)){
            setError(
                "Password must contain at least 8 characters, \
                1 uppercase letter, 1 lowercase letter and 1 digit"
            )
            return
        }
        if(data.password != data.confirmPassword){
            setError("Passwords are not equal")
            return
        }
        setLoading('loading')
        const res = await register(
            data.email, data.username, data.firstname, data.password
        )
        setLoading('')
        if(res.ok){
            navigate('/registerSuccess')
        }else{
            setError("Unexpected error")
        }
    }

    return (
        <form>
            <FormInput
                type="password" placeholder="Password" value={data.password}
                handle="password" handleChange={handleChange} error={error}
            />
            <FormInput 
                type="password" placeholder="Confirm password" value={data.confirmPassword}
                handle="confirmPassword" handleChange={handleChange} error={error}
            />
            <div className={`error-message ${(error.length == 0) ? 'not-visible' : ''}`}>
                <span>{error}</span>
            </div>
            <div className="next-prev-buttons">
                <button type="button" className="btn" onClick={prevPage}>
                    <FiArrowLeftCircle size={20}/>
                </button>
                <button 
                    type="button" className={`btn ${loading}`}
                    onClick={handleSubmit} disabled={(loading == 'loading')}
                >
                    <span>Submit</span>
                </button>
            </div>
        </form>
    )
}

export default PasswordForm;