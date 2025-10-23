import AuthService from '../service/AuthService'
import $api from '../http'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import axios from 'axios';
// import { 
//     mockUser, mockContacts, mockChats,
//     mockGroupChats, mockContactRequests, mockMessages 
// } from './mockData';
import { memoize } from "proxy-memoize";
import dataURItoBlob from '../tools/dataURItoBlob';
import { wsHandlers } from '../service/wsService/handlers';
import { wsClient } from '../service/wsService/wsClient';
import { v4 } from 'uuid'

export const selectMessages = memoize((state) => {
    if(state.messages && state.selectedChatId in state.messages)
        return state.messages[state.selectedChatId]
    return []
})

const getMessageDate = (message) => {
    if(message)
        return new Date(message.send_time).getTime()

    return 0;
}

export const selectJoinedChats = memoize((state) => {
    if(!state.chats)
        return []
    
    let list = [...state.chats]
    list = list.map((chat) => {
        const messagesLen = (state.messages && chat.chat_id in state.messages) ?
            state.messages[chat.chat_id].length
        :
            0
        if(messagesLen > 0){
            chat.lastMessage = state.messages[chat.chat_id][messagesLen-1]
        }

        if(chat.type == 'contact' && chat.chat_id in state.contacts){
            chat.info = state.contacts[chat.chat_id]
        }else if(chat.type == 'group' && chat.chat_id in state.groupChats){
            chat.info = state.groupChats[chat.chat_id]
        }else{
            console.error("error joining chats")
            chat.info = null
        }

        return chat
    })
    list.sort((a, b) => {
        const first = getMessageDate(a.lastMessage)
        const second = getMessageDate(b.lastMessage)

        return second - first;
    })
    
    return list
})

export const selectChat = memoize((state) => {
    if(!state.selectedChatId){
        return null
    }

    let selectedChat = state.chats.find(c => c.chat_id == state.selectedChatId)
    if(!selectedChat){
        return null
    }

    if(
        selectedChat.type == 'contact' &&
        (state.selectedChatId in state.contacts)
    ){
        selectedChat.info = state.contacts[state.selectedChatId]
    }else if(
        selectedChat.type == 'group' &&
        (state.selectedChatId in state.groupChats)
    ){
        selectedChat.info = state.groupChats[state.selectedChatId]
    }else{
        console.error("error selecting chats")
        return null
    }

    return selectedChat
})

export const selectMembers = memoize((state) => {
    if(
        state.groupChats && state.selectedChatId && 
        state.selectedChatId in state.groupChats
    ){
        return state.groupChats[state.selectedChatId].members
    }

    return null
})

export const selectName = memoize((state) => {
    if(state.groupChats && state.selectedChatId &&
        state.selectedChatId in state.groupChats){
        return state.groupChats[state.selectedChatId].name
    }

    return null
})

export const selectPicture = memoize((state) => {
    if(state.groupChats && state.selectedChatId &&
        state.selectedChatId in state.groupChats){
        return state.groupChats[state.selectedChatId].picture
    }

    return null
})

export const useStore = create(
    persist((set, get) => ({
        user: {},
        contacts: null,
        contactStatus: {},
        groupChats: null,
        chats: null,
        contactRequests: null,
        messages: null,

        setStatus: (chat_id, status) => {
            set({contactStatus: {...get().contactStatus, [chat_id]: status}})
        },
        
        visible: 'sidebar',
        setVisible: (visible) => set({visible: visible}),

        selectedChatId: '',
        setSelectedChatId: (chat_id) => set({selectedChatId: chat_id}),

        hasMore: true,
        setHasMore: (hasMore) => set({hasMore: hasMore}),

        areaRef: null,
        setAreaRef: (ref) => set({areaRef: ref}),
        scrollDown: (chat_id, receive = false) => {
            const areaRef = get().areaRef
            if(
                areaRef && chat_id === get().selectedChatId &&
                // if user receiving message is watching last message,
                // scroll his messages view to bottom
                (!receive || areaRef.current.scrollTop > areaRef.current.scrollHeight-800)
            ){
                setTimeout(() => {
                    areaRef.current.scrollTo({
                        top: areaRef.current.scrollHeight,
                        behavior: 'smooth'
                    })
                }, 10) // use timeout because messages aren't instantly updated
            }
        },

        isAuth: false,
        setAuth: (auth) => set({isAuth: auth}),

        showNotification: false,
        notificationConfig: {type: '', message: ''},
        setShowNotification: (show) => set({showNotification: show}),
        setNotification: (type, message) => set({
            notificationConfig: {type: type, message: message},
            showNotification: true
        }),

        contextMenu: {
		    isOpen: false, x: 0, y: 0, menuItems: null, fromMessage: false
	    },
        setContextMenu: (context_menu) => set({contextMenu: context_menu}),
        closeContextMenu: (fromMessage) => {
            if(!fromMessage){
                set({contextMenu: {...get().contextMenu, isOpen: false}})
            }
        },

        messageInput: "",
        setMessageInput: (message_input) => set({messageInput: message_input}),

        replyConfig: {
            isOpen: false, message_id: null, name: null, message: null, edit: false
        },
        setReplyConfig: (reply_config) => set({replyConfig: reply_config}),
        closeReply: () => set({
            replyConfig: {
                isOpen: false, message_id: null, 
                name: null, message: null, edit: false
            },
            messageInput: ""
        }),

        isGroupEdit: false,
        setIsGroupEdit: (edit) => set({isGroupEdit: edit}),
        
        handleSelectChat: (chat, openInfo) => {
            get().closeReply()
            set({hasMore: true, selectedChatId: chat.chat_id})
            if(openInfo){
                set({visible: 'info'})
            }else{
                set({visible: 'chat'})
            }
        },

        wsSend: (type, payload) => wsClient.send(type, payload),

        // auth
        login: async (email, password) => {
            try{
                const res = await AuthService.login(email, password)
                set({isAuth: true, user: res.data.user})

                return { ok: true, 'message': 'Login success' }
            }catch(e){
                const message = e.response?.data?.message || "Unexpected error"

                return { ok: false, message }
            }
        },

        register: async (email, user_name, first_name, password) => {
            try{
                await AuthService.registration(email, user_name, first_name, password)

                return { ok: true, 'message': 'Register success' }
            }catch(e){
                const message = e.response?.data?.message || "Unexpected error"

                return { ok: false, message }
            }
        },

        logout: async () => {
            await AuthService.logout()
            wsClient.disconnect()
            set({
                isAuth: false, user: null, contacts: null, 
                contactRequests: null, messages: null
            })
        }, 
        
        checkAuth: async (signal) => {
            try{
                const res = await $api.get('/user/me', {signal: signal})

                set({user: res.data.user})
            }catch(e){
                if(e.name != "CanceledError"){
                    wsClient.disconnect()
                    set({
                        isAuth: false, user: null, contacts: null, 
                        contactRequests: null, messages: null
                    })
                    console.error(e)
                }
            }
        },

        // rewrite
        uploadPicture: async (request_type, picture) => {
            try{
                if(picture){
                    const pictureBlob = dataURItoBlob(picture)
                    const client_id = Date.now().toString()
                    const req = {
                        'request_type': request_type,
                        'files': [{
                            'client_id': client_id,
                            'size': pictureBlob.size,
                            'type': pictureBlob.type
                        }]
                    }
                    const res = await $api.post('/user/generateUploadUrls', req)
                    const data = res.data.upload_urls[client_id]
                    if(data.success){
                        await axios.put(data.upload_url, pictureBlob)

                        return data.file_id
                    }else{
                        throw new Error('Error generating url')
                    }
                }
            }catch(e){
                get().setNotification('error', 'Error uploading picture')
                throw new Error('Error uploading picture')
            }
        },
        
        // user related
        changeInfo: async (data, new_picture) => {
            try{
                const picture_id = await get().uploadPicture(
                    'profilePictures', new_picture
                )
                let req = {...data}
                if(picture_id){
                    req['picture_id'] = picture_id
                }
                const res = await $api.put('/user/changeInfo', req)
                
                set({user: res.data.user})

                return true
            }catch(e){
                if(e.message != 'Error uploading picture')
                    get().setNotification("error", "Unexpected error")
            }
        },

        setChatData: (data) => {
            set({
                messages: data.messages, contacts: data.contacts,
                chats: data.chats, groupChats: data.groupChats,
                contactStatus: data.status
            })
        },

        // messages related
        getLastMessage: (chat_id) => {
            const messages = get().messages

            if(chat_id in messages && messages[chat_id].length > 0){
                return messages[chat_id][messages[chat_id].length-1]
            }

            return null;
        },

        addMessage: (chat_id, message) => {
            const messages = {...get().messages}
            const prev_chat = (chat_id in messages) ? messages[chat_id] : []
            const new_messages = {
                ...messages,
                [chat_id]: [...prev_chat, message]
            }
            set({messages: new_messages})
        },
        sendMessage: (chat_id, message) => {
            if(message.trim() == '')
                return
            
            const replyConfig = get().replyConfig
            const client_send_time = new Date()
            let new_message = {
                "id": v4(),
                "chat_id": chat_id, "message": message,
                "meta": {
                    "sender_id": get().user.id
                }
            }
            if(replyConfig.message_id)
                new_message['meta']['reply_id'] = replyConfig.message_id
            wsClient.send('send_message', new_message)

            // server non crucial
            new_message['meta']['saved'] = false
            // server will send new ones
            new_message['send_time'] = client_send_time.toISOString()
            new_message['sender_name'] = get().user.first_name
            if(replyConfig.message_id){
                new_message['meta']['reply_message'] = replyConfig.message   
                new_message['reply_name'] = replyConfig.name
            }

            get().addMessage(chat_id, new_message)

            get().scrollDown(chat_id)
        },
        handleEditMessage: (chat_id, message_id, message) => {
            if(message.trim() == '')
                return

            const request = {
                "message_id": message_id,
                "edited_message": message
            }
            wsClient.send('edit_message', request)
            get().editMessage(chat_id, message_id, message)
        },
        sendFile: async (chat_id, file_id, file) => {
            try{
                let new_message = {
                    "chat_id": chat_id, "message": file.name,
                    "meta": {
                        "file_id": file_id,
                        "file_type": file.type, // photo/file
                        "file_size": file.fileObject.size,
                        "sender_id": get().user.id
                    }
                }
                if(file.width && file.height){
                    new_message.meta.width = file.width
                    new_message.meta.height = file.height
                }

                const res = await wsClient.request('send_message', new_message)
                
                get().addMessage(res.chat_id, res.message)

                get().scrollDown(res.chat_id)
            }catch(e){
                get().setNotification('error', 'Error sending message')
            }
        },

        loadMessages: (chat_id, loaded_messages) => {
            if(loaded_messages.length == 0){
                set({hasMore: false});
                return;
            }
            
            const messages = get().messages
            const prev_messages = (chat_id in messages) ? get().messages[chat_id] : []
            const new_messages = {
                ...get().messages,
                [chat_id]: [...loaded_messages, ...prev_messages]
            }
            set({messages: new_messages})
        },

        changeMessageStatus: (chat_id, client_id, new_message) => {
            const messages = [...get().messages[chat_id]]
            const new_messages = messages.map(msg => {
                if(msg.id == client_id){
                    msg = new_message
                }
                return msg
            })

            set({messages: {
                ...get().messages,
                [chat_id]: new_messages
            }})
        },

        readMessages: (chat_id) => {
            const messages = [...get().messages[chat_id]]
            const new_messages = messages.map(msg => {
                msg.meta['read'] = true
                return msg
            })

            set({messages: {
                ...get().messages,
                [chat_id]: new_messages
            }})
        },

        editMessage: (chat_id, id, new_message) => {
            const messages = [...get().messages[chat_id]]
            const new_messages = messages.map(msg => {
                if(msg.id == id){
                    msg.message = new_message
                    msg.meta.edited = true
                }
                return msg
            })
            
            set({messages: {
                ...get().messages,
                [chat_id]: new_messages
            }})
        },

        deleteMessage: (chat_id, message_id) => {
            const messages = [...get().messages[chat_id]]
            const new_messages = messages.filter(msg => msg.id != message_id)

            set({messages: {
                ...get().messages,
                [chat_id]: new_messages
            }})
        },

        // contacts related
        getContactRequests: async (signal) => {
            try{
                const res = await $api.get(
                    '/user/getContactRequests/?all=true', {signal: signal}
                )
                
                set({contactRequests: res.data})
            }catch(e){
                if(e.name != "CanceledError"){
                    get().setNotification('error', 'Error getting contact requests')
                }
            }
        },

        removeContact: (chat_id) => {
            const cur_contacts = get().contacts
            const { [chat_id]: _, ...new_contacts } = cur_contacts;

            let new_chats = [...get().chats]
            new_chats = new_chats.filter(chat => chat.chat_id != chat_id)

            if(chat_id == get().selectedChatId)
                set({selectedChatId: null, visible: 'sidebar'})

            set({contacts: new_contacts, chats: new_chats})
        },
        handleRemoveContact: async (contact_id) => {
            try{
                const request = {contact_id}
                const res = await wsClient.request('remove_contact', request)

                get().removeContact(res.chat_id)

                get().setNotification('success', 'Successfuly removed contact')
            }catch(e){
                get().setNotification('error', 'Error while removing contact')
            }
        },

        handleSendRequest: async (username) => {
            try{
                const res = await $api.post(`/user/sendContactRequest/${username}`)
                
                get().setNotification(
                    'success', `Contact request to ${username} sent!`
                )

                const newOutgoing = ('outgoing' in get().contactRequests) ? 
                    [...get().contactRequests['outgoing'], res.data.new_contact]
                :
                    [res.data.new_contact]
                
                set({contactRequests: {
                    ...get().contactRequests,
                    ['outgoing']: newOutgoing
                }})

                return { ok: true, 'message': 'Success' }
            }catch(e){
                const message = e.response?.data?.message || "Unexpected error"

                return { ok: false, message }
            }
        },

        addContact: (new_contact, new_chat_id, isUserAccepter) => {
            set({contacts: {...get().contacts, [new_chat_id]: new_contact},
                chats: [
                    ...get().chats, {"chat_id": new_chat_id, "type": "contact"}
                ],
                messages: {...get().messages, [new_chat_id]: []}
            })

            if(get().contactRequests){
                let newContactRequests = {...get().contactRequests}
                const key = (isUserAccepter) ? 'ingoing' : 'outgoing'
                newContactRequests[key] = newContactRequests[key].filter(contact => {
                    return new_contact.user_id != contact.user_id
                })

                set({contactRequests: newContactRequests})
            }
        },
        
        acceptContactRequest: async (sender_id) => {
            try{
                const request = {sender_id}
                const res = await wsClient.request('accept_contact', request)
                
                get().addContact(res.new_contact, res.new_chat_id, true)
                
                get().setNotification("success", "Contact added")

                return true
            }catch(e){
                get().setNotification("error", "Unexpected error")
            }
        },
        
        // may rename it to block contact(not sure if i want to keep this name)
        rejectContactRequest: async (contact_id) => {
            try{
                await $api.post(`/user/rejectContactRequest/${contact_id}`)

                let newIngoing = [...get().contactRequests['ingoing']]
                newIngoing = newIngoing.filter(contact => {
                    return contact_id != contact.user_id
                })

                set({contactRequests: {
                    ...get().contactRequests,
                    ['ingoing']: newIngoing
                }})
                get().setNotification("success", "Contact rejected")

                return true
            }catch(e){
                if(e.response)
                    get().setNotification("error", e.response.data.message)
                get().setNotification("error", "Unexpected error")
                console.error(e)
            }
        },
        
        // group related
        addGroup: (new_chat, new_group, new_message) => {
            set({
                chats: [...get().chats, new_chat],
                groupChats: {
                    ...get().groupChats,
                    [new_chat.chat_id]: new_group
                },
                messages: {
                    ...get().messages,
                    [new_chat.chat_id]: [new_message]
                }
            })
        },
        createGroup: async (name, members, picture) => {
            try{
                const picture_id = await get().uploadPicture('groupPictures', picture)

                const request = {name, members, picture_id}
                const res = await wsClient.request('create_group', request)

                get().addGroup(res.new_chat, res.new_group, res.new_message)
                get().setNotification('success', 'Created group sucsessfuly')

                return true
            }catch(e){
                if(e.message != 'Error uploading picture')
                    get().setNotification('error', 'Error creating group')
            }
        },

        editGroup: (chat_id, new_group, new_messages) => {
            const prev_messages = (chat_id in get().messages) ? 
                get().messages[chat_id] : [];

            set({
                groupChats: {...get().groupChats, [chat_id]: new_group},
                messages: {
                    ...get().messages,
                    [chat_id]: [...prev_messages, ...new_messages]
                }
            })

            // if user was added to group
            let new_chat = get().chats.find(c => c.chat_id == chat_id)
            if(!new_chat){
                new_chat = {'chat_id': chat_id, 'type': 'group'}
                set({chats: [...get().chats, new_chat]})
            }
        },
        handleEditGroup: async (chat_id, name, membersToAdd, new_picture) => {
            try{
                const picture_id = await get().uploadPicture(
                    'groupPictures', new_picture
                )

                const request = {
                    'chat_id': chat_id,
                    'name': name, 'members_to_add': membersToAdd, 
                    'picture_id': picture_id
                }
                const res = await wsClient.request('edit_group', request)

                get().editGroup(res.chat_id, res.new_group, res.new_messages)

                get().setNotification('success', 'Successfuly edited group')
                get().setIsGroupEdit(false)
                get().scrollDown(chat_id)
            }catch(e){
                if(e.message != 'Error uploading picture'){
                    get().setNotification('error', 'Error editing group')
                    console.error(e)
                }
            }
        },
        
        removeMember: (chat_id, user_id, message) => {
            if(user_id == get().user.id){
                const cur_group_chats = get().groupChats
                const { [chat_id]: _, ...new_group_chats } = cur_group_chats;

                let new_chats = [...get().chats]
                new_chats = new_chats.filter(chat => chat.chat_id != chat_id)

                set({
                    chats: new_chats,
                    groupChats: new_group_chats
                })
            }else{
                let new_group = {...get().groupChats[chat_id]}
                const prev_messages = get().messages
                new_group.members = new_group.members.filter(
                    m => m.user_id != user_id
                )
                set({
                    groupChats: {...get().groupChats, [chat_id]: new_group},
                    messages: {
                        ...prev_messages,
                        [chat_id]: [...prev_messages[chat_id], message]
                    }
                })
            }
        },
        handleLeaveGroup: async (chat_id) => {
            try{
                await wsClient.request('leave_group', {chat_id})

                get().removeMember(chat_id, get().user.id)
                
                get().setNotification('success', 'Successfuly left group')
                set({visible: 'sidebar', isGroupEdit: false})
            }catch(e){
                get().setNotification('error', 'Error leaving group')
            }
        },
        handleRemoveMember: async (chat_id, member_id) => {
            try{
                const request = {chat_id, member_id}
                const res = await wsClient.request('remove_member', request)

                get().removeMember(res.chat_id, res.member_id, res.message)
                
                get().setNotification('success', 'Successfuly removed group member')
            }catch(e){
                get().setNotification('error', 'Error removing member')
                console.error(e)
            }
        },

        initSocketListeners: () => {
            if(get().isListening)
                return;
            const handlers = wsHandlers(get);
            Object.entries(handlers).forEach(([event, fn]) => wsClient.on(event, fn));
            set({ isListening: true, _handlers: handlers });
        },

        removeSocketListeners: () => {
            const _handlers = get()._handlers;
            if(!_handlers)
                return;
            Object.entries(_handlers).forEach(([event, handler]) =>
                wsClient.off(event, handler)
            );
            set({ isListening: false, _handlers: null });
        },
    }),
    {
        name: 'user-auth-storage',
        storage: createJSONStorage(() => localStorage),
        
        partialize: (state) => ({ 
            isAuth: state.isAuth
        }),
    }
))