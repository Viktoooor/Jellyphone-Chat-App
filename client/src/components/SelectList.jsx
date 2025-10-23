const SelectList = ({ list, onSelect }) => {
    if(list.length == 0){
        return (
            <div>
                <span>Nothing here...</span>
            </div>
        )
    }

    return (
        <div className="select-list">
            {list.map((user) => (
                <div
                    key={user.user_id}
                    className="select-member-item"
                    onClick={() => onSelect(user)}
                >
                    <img src={user.picture}/>
                    <div className="select-member-info">
                        <h4>{user.first_name}</h4>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default SelectList