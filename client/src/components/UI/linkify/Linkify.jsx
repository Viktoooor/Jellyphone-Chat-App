const LinkifyText = ({ text }) => {
    const parts = text.split(/(https?:\/\/[^\s]+)/g)

    return (
        <>
        {parts.map((part, i) =>
            part.match(/https?:\/\/[^\s]+/) ?
                <a 
                    key={i} href={part} target="_blank"
                    rel="noopener noreferrer"
                >
                    {part}
                </a>
            : 
                part
        )}
        </>
    )
}

export default LinkifyText