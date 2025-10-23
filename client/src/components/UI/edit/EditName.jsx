const EditName = ({ label, hint, name, setName }) => {
    return (
        <div className='profile-group'>
            <label htmlFor={`set-${label}`}>{label}</label>
            <input 
                type='text' onChange={(e) => setName(e.target.value)} value={name}
                id={`set-${label}`}
            />
            {hint && <span>{hint}</span>}
        </div>
    )
}

export default EditName 