import EmailForm from '../components/RegisterForm/EmailForm'
import UsernameForm from '../components/RegisterForm/UsernameForm';
import FormFooter from '../components/UI/form/FormFooter'
import { useCallback, useState } from 'react';
import PasswordForm from '../components/RegisterForm/PasswordForm';
import AuthService from '../service/AuthService';
import { isEmailValid, isUserNameValid } from '../tools/validateInput';
import { isFirstNameValid } from '../tools/validateInput';

const Register = () => {
    document.title = "Sign Up"

    const [page, setPage] = useState(0);

    const [data, setData] = useState({
        email: "",
        username: "",
        firstname: "",
        password: "",
        confirmPassword: ""
    })

    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [disable, setDisable] = useState(false)

    const nextPage = useCallback(async () => {
        // user can not spam 'next' button
        setDisable(true)
        setTimeout(() => {
            setDisable(false)
        }, 1000)
        // check validity of current input fields
        if(page === 0){
            if(!isEmailValid(data.email)){
                setError("Invalid email")
                return;
            }
            setLoading(true)
            const res = await AuthService.checkEmail(data.email)
            setLoading(false)
            if(!res.ok){
                setError(res.message)
                return
            }
        }else{
            if(!isUserNameValid(data.username, true)){
                setError("Invalid username")
                return
            }
            if(!isFirstNameValid(data.firstname)){
                setError("First name must be no longer than 32 characters")
                return
            }
            setLoading(true)
            const res = await AuthService.checkUserName(data.username)
            setLoading(false)
            if(!res.ok){
                setError("Username is used")
                return
            }
        }
        setError("")
        setPage(prevStep => prevStep+1)
    }, [page, data])
    
    const prevPage = useCallback(() => {
        setError("")
        setPage(prevStep => prevStep-1)
    }, [])

    const handleChange = useCallback((input) => (e) => {
        setData({...data, [input]: e.target.value})
    }, [data])

    const display = {
        0: <EmailForm 
                error={error} handleChange={handleChange} value={data.email} 
                nextPage={nextPage} disable={disable} loading={loading}
            />,
        1: <UsernameForm 
                handleChange={handleChange} value={data} 
                disable={disable} loading={loading}
                prevPage={prevPage} nextPage={nextPage} error={error}
            />,
        2: <PasswordForm
                handleChange={handleChange} data={data}
                prevPage={prevPage}
            />
    }

    return(
        <main className="auth-container">
            <section className="auth-card">
                <header>
                    <img src='/favicon.ico' style={{width: '50px'}}/>
                    <h2>Sign up</h2>
                </header>
                {display[page]}
                <FormFooter 
                    text="Already have account?"
                    link="/login"
                    linkText="Log in"
                />
            </section>
        </main>
    )
}

export default Register