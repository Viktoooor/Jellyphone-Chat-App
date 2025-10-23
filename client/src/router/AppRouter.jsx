import { useStore } from '../store/store'
import React from 'react'

const Private =  React.lazy(() => import('./Private'))
const Public =  React.lazy(() => import('./Public'))

const AppRouter = () => {
    const isAuth = useStore(state => state.isAuth)
    
    return(
        isAuth 
        ?
            <Private/>
        :
            <Public/>
    )
}

export default AppRouter