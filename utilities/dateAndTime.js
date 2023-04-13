module.exports.date = () => {
    let d = new Date();
    const date = `${d.getDate()}/${d.getMonth()}/${d.getFullYear()}`;
    return date;
}

module.exports.time = () => {
    let d = new Date();
    const time = `${d.getHours()}:${d.getMinutes()}`;
    return time;
}