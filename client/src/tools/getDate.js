const getDate = (date) => {
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]
    date = new Date(date)
    return monthNames[date.getMonth()] + " " + date.getDate()
}

export default getDate