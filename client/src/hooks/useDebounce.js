import { useState, useEffect, useRef } from 'react';

const useDebounce = (isTyping, delay, func) => {
	const typingTimeoutRef = useRef()
	const [lastReq, setLastReq] = useState(false)

    useEffect(() => {
        clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = setTimeout(() => {
            if(isTyping != lastReq){
                setLastReq(isTyping)
                func()
            }
        }, delay)
    }, [isTyping])
}

export default useDebounce;