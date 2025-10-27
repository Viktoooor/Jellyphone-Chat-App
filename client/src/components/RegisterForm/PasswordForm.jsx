import { useState } from "react";
import FormInput from "../UI/form/FormInput";
import { useStore } from "../../store/store";
import { isPasswordValid } from "../../tools/validateInput";
import { FiArrowLeftCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Button from "../UI/button/Button";

const PasswordForm = ({ data, handleChange, prevPage }) => {
    const register = useStore((state) => state.register)

    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [disable, setDisable] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async () => {
        setDisable(true)
        setTimeout(() => {
            setDisable(false)
        }, 1000)
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
        setLoading(true)
        const res = await register(
            data.email, data.username, data.firstname, data.password
        )
        setLoading(false)
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
                <Button
                    icon={<FiArrowLeftCircle size={20}/>} type='primary' full
                    onClick={prevPage}
                />
                <Button 
                    label='Submit' type='primary' full
                    onClick={handleSubmit} loading={loading}
                    disabled={disable || loading} submit
                />
            </div>
        </form>
    )
}

export default PasswordForm;