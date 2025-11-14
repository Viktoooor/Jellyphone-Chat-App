import FormFooter from '../components/UI/form/FormFooter'
import FormInput from '../components/UI/form/FormInput'
import { useCallback, useEffect, useState } from 'react'
import { isEmailValid } from '../tools/validateInput'
import { useStore } from '../store/store'
import { useSearchParams } from 'react-router-dom'
import Button from '../components/UI/button/Button'
import GoogleIcon from '../components/UI/icon/GoogleIcon'

const Login = () => {
    document.title = "Login"

    const [params, setParams] = useSearchParams()

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

    const handleLogin = async (data) => {
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

        if(res.ok === false)
            setError(res.message)
    }

    const handleGoogleLogin = (e) => {
        e.preventDefault()
        window.location.href = `${import.meta.env.VITE_API_URL}/auth/google/url`
    }

    const googleLogin = useStore(state => state.googleLogin)
    const [googleLoading, setGoogleLoading] = useState(false)
    useEffect(() => {
        const handleGoogleLogin = async () => {
            setDisable(true)
            setTimeout(() => {
                setDisable(false)
            }, 1000)

            setGoogleLoading(true)
            const res = await googleLogin(params.get('code'))
            setGoogleLoading(false)

            if(res.ok === false)
                setError(res.message)
        }
        if(params.get('error')){
            setError(params.get('error'))
        }else if(params.get('code')){
            handleGoogleLogin()
        }
    }, [params])

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
                        <Button 
                            label='Log in' type='primary' full
                            onClick={() => handleLogin(data)} loading={loading}
                            disabled={disable || loading} submit
                        />
                    </div>
                </form>
                <div style={{margin: '15px 0'}}>
                    <span>or</span>
                </div>
                <div className="next-prev-buttons">
                    <Button 
                        label='Continue with Google' icon={<GoogleIcon/>}
                        type='secondary' full
                        onClick={handleGoogleLogin} customClass='google-button'
                        disabled={disable || googleLoading} loading={googleLoading}
                    />
                </div>

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
