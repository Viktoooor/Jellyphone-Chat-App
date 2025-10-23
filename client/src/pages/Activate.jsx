import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { isUUIDValid } from "../tools/validateInput"
import $api from "../http"

const Activate = () => {
    const navigate = useNavigate()
    
    const [searchParams, setSearchParams] = useSearchParams()
    const link = searchParams.get('link') || ''
    const [message, setMessage] = useState('')
    
    useEffect(() => {
        const controller = new AbortController()

        async function activate(){
            if(!isUUIDValid(link)){
                setMessage('Invalid activation link')
                return;
            }

            try{
                await $api.get(`/auth/activate/${link}`, {signal: controller.signal})
                
                setMessage('Successfuly activated your account. Redirecting...')
                setTimeout(() => {
                    navigate('/login')
                }, 1000)
            }catch(e){
                if(e.response && e.response.data.message == 'Invalid link'){
                    setMessage('Invalid activation link')
                }else if(e.name != 'CanceledError'){
                    setMessage('Unexpected error')
                }
            }
        }
        activate()

        return () => {
            controller.abort()
        }
    }, [])

    return (
        <h1>{message}</h1>
    )
}

export default Activate