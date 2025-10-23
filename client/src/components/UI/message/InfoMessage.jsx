const InfoMessage = ({ message }) => {
    return (
        <div className="message-date">
            {(message.meta['event'] == 'createGroup') ? 
                `${message.meta['user_name']} created group`
            :
            (message.meta['event'] == 'addMember') ?
                `${message.meta['user_name']} added ${message.meta['member_name']}`
            :
            (message.meta['event'] == 'removeMember') ?
                `${message.meta['user_name']} removed ${message.meta['member_name']}`
            :
            (message.meta['event'] == 'leftGroup') ?
                `${message.meta['user_name']} left group`
            :
            (message.meta['event'] == 'editGroupName') ?
                `${message.meta['user_name']} changed group name to ${message.meta['new_name']}`
            :
            (message.meta['event'] == 'editGroupPicture') ?
                `${message.meta['user_name']} changed group picture`
            :
            ''
            }
        </div>
    )
}

export default InfoMessage