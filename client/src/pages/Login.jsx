import FormFooter from '../components/UI/form/FormFooter'
import FormInput from '../components/UI/form/FormInput'
import { useCallback, useState } from 'react'
import { isEmailValid } from '../tools/validateInput'
import { useStore } from '../store/store'
import { FiLogIn } from "react-icons/fi";

const Login = () => {
    document.title = "Login"

    const login = useStore((state) => state.login)

    const [data, setData] = useState({
        email: "",
        password: ""
    })

    const [error, setError] = useState("")
    const [disable, setDisable] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleChange = useCallback((input) => (e) => {
        setData({...data, [input]: e.target.value})
    }, [data])

    const handleLogin = useCallback(async () => {
        setDisable(true)
        setTimeout(() => {
            setDisable(false)
        }, 1000)


        if(!isEmailValid(data.email) || data.password.length < 8){
            setError("Invalid credentials")
            return
        }
        setLoading(true)
        const res = await login(data.email, data.password)
        setLoading(false)

        if(!res.ok)
            setError(res.message)
    }, [data])

    const errorClass = (error.length == 0) ? 'not-visible' : ''

    return(
        <main className="auth-container">
            <section className="auth-card">
                <header>
                    <img src='/favicon.ico' style={{width: '50px'}}/>
                    <h2>Login</h2>
                </header>

                <form onSubmit={(e) => {e.preventDefault()}}>
                    <FormInput
                        type="email" placeholder="Email" value={data.email}
                        handle="email" handleChange={handleChange} error={error}
                    />
                    <FormInput 
                        type="password" placeholder="Password" value={data.password}
                        handle="password" handleChange={handleChange} error={error}
                    />
                    <div 
                    className={`error-message ${errorClass}`}
                    >
                        <span>{error}</span>
                    </div>
                    <div className="next-prev-buttons">
                        <button 
                            type="button" 
                            className={`btn ${loading ? 'loading' : ''}`} 
                            onClick={handleLogin} disabled={disable || loading}
                        >
                            <span>Log in</span>
                        </button>
                    </div>
                </form>

                <FormFooter 
                    text="Don't have an account?"
                    link="/signup"
                    linkText="Sign Up"
                />
            </section>
        </main>
    )
}

export default Login