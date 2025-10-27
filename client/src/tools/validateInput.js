export function isEmailValid(email){
    const regex = /\S+@\S+\.\S+/;
    return regex.test(email);
}

export function isUserNameValid(username, isRegister = false){
    let regex = /^@?[a-z0-9_]{3,32}$/
    if(isRegister)
        regex = /^[a-z0-9_]{3,32}$/
    
    return regex.test(username);
}

export function isFirstNameValid(firstname){
    return (firstname.length > 0 && firstname.length < 33);
}

export function isPasswordValid(password){
    const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;
    return regex.test(password)
}

export function isUUIDValid(uuid){
    const regex = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
    return regex.test(uuid)
}

export function isGroupNameValid(groupName){
    return (groupName.length > 0 && groupName.length < 33)
}