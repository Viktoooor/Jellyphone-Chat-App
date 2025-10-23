import $api from "../http";

export default class AuthService {
    static async checkEmail(email){
        try{
            await $api.get(`/auth/checkUserEmail/${email}`)

            return { ok: true, message: "Email is free" }
        }catch(e){
            const message = e.response?.data?.message || "Unexpected error"

            return { ok: false, message }
        }
    }


    static async checkUserName(username){
        try{
            await $api.get(`/auth/checkUserName/${username}`)

            return { ok: true, message: "Username is free" }
        }catch(e){
            const message = e.response?.data?.message || "Unexpected error"
            
            return { ok: false, message }
        }
    }

    static async login(email, password){
        return $api.post('/auth/login', {email, password})
    }

    static async registration(email, user_name, first_name, password){
        return $api.post('/auth/register', {email, user_name, first_name, password})
    }

    static async logout(){
        return $api.post('/user/logout')
    }
}