import { BrowserRouter } from 'react-router-dom';
import AppRouter from './router/AppRouter';
import './App.css'
import { useStore } from './store/store';
import { useState, useEffect } from 'react';

function App() {
    const [isHydrated, setIsHydrated] = useState(false);
    const isAuth = useStore(state => state.isAuth)
    const checkAuth = useStore(state => state.checkAuth)
    
    useEffect(() => {
        const unsubscribe = useStore.persist.onFinishHydration(async () => {
            setIsHydrated(true)
        })

        if(useStore.persist.hasHydrated()){
            setIsHydrated(true)
        }

        return () => {
            unsubscribe()
        };
    }, []);
    
    useEffect(() => {
        const controller = new AbortController()
        
        async function check(){
            if(isAuth){
                await checkAuth(controller.signal)
            }
        }
        check()

        return () => {
            controller.abort()
        }
    }, [isAuth])

    if(!isHydrated){
        return <div></div>;
    }

    return (
        <BrowserRouter>
            <AppRouter/>
        </BrowserRouter>
    );
}

export default App;