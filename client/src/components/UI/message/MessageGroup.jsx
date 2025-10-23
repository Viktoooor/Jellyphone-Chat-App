import DateMessage from "./DateMessage"
import InfoMessage from "./InfoMessage"
import MessageRow from "./MessageRow"
import { memo } from "react"

// message, read added to make memo work
const MessageGroup = memo(({ msg, message, read, showDate,
    curDate, user_id }) => {
    return (
        <>
            {(showDate) && <DateMessage curDate={curDate}/>}

            {(msg.meta.type && msg.meta.type == 'info') ?
                <InfoMessage message={msg}/>
            :
                <MessageRow
                    message={msg} isSent={msg.meta.sender_id === user_id}
                />
            }
        </>
    )
})

export default MessageGroup