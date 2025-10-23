import { useEffect, useRef, memo } from "react"
import { useStore, selectMessages } from "../../../store/store"
import getDate from '../../../tools/getDate'
import MessageGroup from "./MessageGroup"

const MessageList = memo(({ user_id }) => {
    const wsSend = useStore(state => state.wsSend)

    const messages = useStore(selectMessages)
    const chat_id = useStore(state => state.selectedChatId)
    const offset = (messages) ? messages.length : 0

    const areaRef = useRef()
    const setAreaRef = useStore(state => state.setAreaRef)
    const replyOpen = useStore(state => state.replyConfig.isOpen)

    const hasMore = useStore(state => state.hasMore)

    const topSentinelRef = useRef(null)
    const scrollOffset = useRef(null)

    const loadingState = useRef()

    const readingTimer = useRef()

    const loadMoreMessages = () => {
        if(loadingState.current || !hasMore)
            return

        loadingState.current = true
        areaRef.current.scrollTop -= 100
        const request = {"chat_id": chat_id, "offset": offset}
        wsSend('load_messages', request)
    }

    useEffect(() => {
        if(areaRef.current)
            setAreaRef(areaRef)
    }, [])
    
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if(entries[0].isIntersecting){
                    loadMoreMessages()
                }
            },
            { root: areaRef.current, threshold: 1.0 }
        );
        
        if(topSentinelRef.current){
            observer.observe(topSentinelRef.current);
        }
        
        if(areaRef.current && loadingState.current){
            const curScroll = areaRef.current.scrollHeight
            areaRef.current.scrollTop += curScroll-scrollOffset.current;
            loadingState.current = false
        }

        if(areaRef.current){
            scrollOffset.current = areaRef.current.scrollHeight
        }

        if(
            offset > 0 && 
            messages[offset-1].meta['read'] == false &&
            messages[offset-1].meta['sender_id'] != user_id
        ){
            if(readingTimer.current)
                clearTimeout(readingTimer.current)
            readingTimer.current = setTimeout(() => {
                wsSend('read_messages', {'chat_id': chat_id})
            }, 500)
        }
        
        return () => {
            observer.disconnect();
        };
    }, [messages])

    useEffect(() => {
        if(areaRef.current){
            areaRef.current.scrollTop = areaRef.current.scrollHeight;
        }
    }, [chat_id, replyOpen])

    if(!messages)
        return null

    let curDate = null
    return (
        <div 
            className={`messages-area ${(replyOpen) ? 'reply-open': ''}`}
            ref={areaRef}
        >
			<div style={{marginTop: 'auto'}}></div>
            {hasMore && 
            <div ref={topSentinelRef}></div>
            }
            {messages.map((msg) => {
                let date = getDate(msg.send_time)
                let showDate = false
                if(date != curDate){
                    curDate = date
                    showDate = true
                }
                return (
                    <MessageGroup
                        key={`group-${msg.id}`}
                        msg={msg} showDate={showDate}
                        curDate={curDate} user_id={user_id}
                        message={msg.message} read={msg.meta.read}
                    />
                )
            })}
        </div>
    )
})

export default MessageList