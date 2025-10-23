const getTime = (date) => {
    date = new Date(date)
    let hours = date.getHours()
    hours = ("0" + hours).slice(-2)
    let minutes = date.getMinutes()
    minutes = ("0" + minutes).slice(-2)

    return hours + ':' + minutes
}

export default getTime