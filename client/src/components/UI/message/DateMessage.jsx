import { memo } from "react"

const DateMessage = memo(({ curDate }) => {
    return (
        <div className="message-date">
            {curDate}
        </div>
    )
})

export default DateMessage