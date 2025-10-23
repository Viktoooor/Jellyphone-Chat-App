import SelectList from "../../SelectList"

const EditList = ({ 
    label, hint, deselectList, setDeselectList,
    selectList, setSelectList
}) => {
    const handleSelect = (select) => {
        const user = {...select}
        setSelectList([...selectList, user])
        setDeselectList(
            deselectList.filter((contact) => {
                return user.user_id != contact.user_id
            })
        )
    }

    return (
        <div className='profile-group'>
            <label>{label}</label>
            <SelectList list={deselectList} onSelect={handleSelect}/>
            {hint && <span>{hint}</span>}
        </div>
    )
}

export default EditList