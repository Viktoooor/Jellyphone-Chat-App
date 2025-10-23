import { useRef } from "react";

const Textarea = ({ value, handleChange, placeholder }) => {
    const textbox = useRef()

    const adjustHeight = () => { 
        textbox.current.style.height = "inherit";
        textbox.current.style.height = `${textbox.current.scrollHeight}px`;
    }

    return (
        <textarea 
            id="set-bio"
            style={{width: "100%"}} onKeyDown={adjustHeight}
            value={value} ref={textbox} onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
        />
    )
}

export default Textarea