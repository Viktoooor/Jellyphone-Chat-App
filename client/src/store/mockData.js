export const mockUser = {
    "id": "22a909e6-159f-47d5-8842-05ab150521f4",
    "email": "test@test.com",
    "user_name": "username1",
    "first_name": "Name1",
    "picture": "/default.png",
    "bio": ""
}

export const mockContacts = {
    "9896004a-b12b-4332-bbc6-66540e56fe55": {
        "chat_id": "9896004a-b12b-4332-bbc6-66540e56fe55",
        "user_id": "e7c49de9-9ad7-4026-b237-d4d2fe3254c9",
        "user_name": "username2",
        "first_name": "Name2",
        "picture": "/default.png",
        "bio": "MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM"
    }
}

export const mockContactRequests = [
    {
        "user_id": "8a3fc9c8-7443-4231-a823-b20979169def",
        "user_name": "username3",
        "first_name": "Name3",
        "picture": "/default.png",
        "bio": ""
    }
]

export const mockGroupChats = {
    "c8f42f49-e35f-4372-b72d-91776f684c38": {
        "name": "group name",
        "picture": "/default.png",
        "members": [
            {
                "chat_id": null,
                "user_id": "22a909e6-159f-47d5-8842-05ab150521f4",
                "user_name": "username1",
                "first_name": "Name1",
                "picture": "/default.png",
                "bio": ""
            },
            {
                "chat_id": "9896004a-b12b-4332-bbc6-66540e56fe55",
                "user_id": "e7c49de9-9ad7-4026-b237-d4d2fe3254c9",
                "user_name": "username2",
                "first_name": "Name2",
                "picture": "/default.png",
                "bio": ""
            },
            {
                "chat_id": null, // no contact so no chat yet
                "user_id": "823fc9c8-7443-4231-a823-b20979169def",
                "user_name": "username3",
                "first_name": "Name3",
                "picture": "/default.png",
                "bio": ""
            },
        ]
    },
    "18f42f49-e35f-4372-b72d-91776f684c38": {
        "name": "group name",
        "picture": "/default.png",
        "members": [
            {
                "chat_id": null,
                "user_id": "22a909e6-159f-47d5-8842-05ab150521f4",
                "user_name": "username1",
                "first_name": "Name1",
                "picture": "/default.png",
                "bio": ""
            },
            {
                "chat_id": "9896004a-b12b-4332-bbc6-66540e56fe55",
                "user_id": "e7c49de9-9ad7-4026-b237-d4d2fe3254c9",
                "user_name": "username2",
                "first_name": "Name2",
                "picture": "/default.png",
                "bio": ""
            },
            {
                "chat_id": null, // no contact so no chat yet
                "user_id": "823fc9c8-7443-4231-a823-b20979169def",
                "user_name": "username3",
                "first_name": "Name3",
                "picture": "/default.png",
                "bio": ""
            }
        ]
    }
}

export const mockChats = [
    {"chat_id": "c8f42f49-e35f-4372-b72d-91776f684c38", "type": "group"},
    {"chat_id": "9896004a-b12b-4332-bbc6-66540e56fe55", "type": "contact"},
    {"chat_id": "18f42f49-e35f-4372-b72d-91776f684c38", "type": "group"}
]

export const mockInfoMessage = {
    "chat_id": "c8f42f49-e35f-4372-b72d-91776f684c38",
    "id": "df6a7638-b5d9-4b10-8a07-7e05d36c30a4",
    "message": "",
    "meta": {
        type: 'info', event: 'createGroup',
        user_id: '22a909e6-159f-47d5-8842-05ab150521f4', user_name: 'Name1'
    },
    "send_time": "2025-10-13T22:00:00.00000"
}

export const mockMessage = {
    "chat_id": "c8f42f49-e35f-4372-b72d-91776f684c38",
    "message": "hello ?",
    "meta": {
        "read": false,
        "sender_id": "22a909e6-159f-47d5-8842-05ab150521f4"
    },
    "id": "c8044e3e-8057-49e4-b85b-d72e1ad855a5",
    "send_time": "2025-10-13T22:03:00.00000",
    "sender_name": "Name1"
}

export const mockPhotoMessage = {
    "chat_id": "c8f42f49-e35f-4372-b72d-91776f684c38",
    "message": "img.JPG",
    "meta": {
        "read": false,
        "width": 900,
        "height": 675,
        "file_id": "17ffdd8b-26ae-44ac-9ae7-dce3e9600762.jpg",
        "file_type": "photo",
        "sender_id": "22a909e6-159f-47d5-8842-05ab150521f4",
        "file_url": "/default.png" // in prod will be download url
    },
    "id": "26d28b65-9a0d-40d3-be84-e39dea24008e",
    "send_time": "2025-10-13T22:04:00.00000",
    "sender_name": "Name1"
}

export const mockFileMessage = {
    "chat_id": "c8f42f49-e35f-4372-b72d-91776f684c38",
    "message": "file.txt",
    "meta": {
        "read": false,
        "file_id": "dccd3137-7fb5-4920-9e3e-26c843f6dec2.txt",
        "file_type": "file",
        "sender_id": "22a909e6-159f-47d5-8842-05ab150521f4",
        "file_url": "/default.png" // in prod will be download url
    },
    "id": "6977e212-5b2f-4f9a-80e4-be317944ea45",
    "send_time": "2025-10-13T22:05:00.00000",
    "sender_name": "Raiden"
}

export const mockMessages = {
    "c8f42f49-e35f-4372-b72d-91776f684c38": [
        mockInfoMessage,
        {
            "message": "<script>alert('hi')</script>",
            "chat_id": "c8f42f49-e35f-4372-b72d-91776f684c38",
            "meta": {
                "read": "false",
                "sender_id": "3a3fc9c8-7443-4231-a823-b20979169def"
            },
            "id": "8002ab8e-1f6a-44ff-a442-2ea783159db2",
            "send_time": "2025-10-13T22:01:00.00000",
            "sender_name": "Name4"
        },
        {
            "chat_id": "c8f42f49-e35f-4372-b72d-91776f684c38",
            "message": "group message from me",
            "meta": {
                "read": "false",
                "sender_id": "22a909e6-159f-47d5-8842-05ab150521f4"
            },
            "id": "492015ff-5b5f-4930-be4e-81336e503c7d",
            "send_time": "2025-10-13T22:02:00.00000",
            "sender_name": "Name1"
        },
        mockMessage,
        mockPhotoMessage,
        mockFileMessage
    ],
    "9896004a-b12b-4332-bbc6-66540e56fe55": [
        {
            "chat_id": "9896004a-b12b-4332-bbc6-66540e56fe55",
            "message": "message to my only contact from me",
            "meta": {
                "read": "false",
                "sender_id": "22a909e6-159f-47d5-8842-05ab150521f4"
            },
            "id": "c69d6cde-0fde-4b9b-9e94-6af7d72ac2ac",
            "send_time": "2025-10-13T22:06:00.00000",
            "sender_name": "Name1"
        }
    ]
}