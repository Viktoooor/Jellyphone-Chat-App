const notificationSfx = new Audio('/notificationSound.mp3');

export const wsHandlers = (get) => ({
    show_error: (message) => {
        get().setNotification('error', message)
    },

    send_message: (data) => {
        get().changeMessageStatus(data.chat_id, data.client_id, data.message)
    },

    receive_message: (data) => {
        get().addMessage(data.chat_id, data.message)

        // if user is watching last message, 
        // scroll his messages view to bottom
        get().scrollDown(data.chat_id, true)
        notificationSfx.play()
    },

    load_messages: (data) => get().loadMessages(data.chat_id, data.messages),

    read_messages: (data) => get().readMessages(data.chat_id),

    delete_message: (data) => get().deleteMessage(data.chat_id, data.id),

    edit_message: (data) => {
        get().editMessage(
            data.message.chat_id, data.message.id, data.message.message
        );
    },

    remove_contact: (data) => get().removeContact(data.chat_id),

    add_contact: (data) => {
        get().addContact(data.new_contact, data.new_chat_id, false);
    },

    add_group: (data) => {
        get().addGroup(
            data.new_chat, data.new_group, data.new_message
        );
    },

    edit_group: (data) => {
        get().editGroup(
            data.chat_id, data.new_group, data.new_messages
        );
    },

    remove_member: (data) => {
        get().removeMember(
            data.chat_id, data.member_id, data.message
        );
    },

    receive_status: (data) => get().setStatus(data.chat_id, data.status)
});