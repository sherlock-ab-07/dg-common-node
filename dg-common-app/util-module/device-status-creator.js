const statusMapper = (status, onlineStatusFlag) => {
    const statusMap = {
        violation: 'violation_disable',
        safe: 'safe_disable',
        still: 'still_disable',
        moving: 'moving_disable',
        warn: 'warn_disable'
    };
    return onlineStatusFlag ? status : statusMap[status]
};
const deviceStatusCreator = (text, icon, value, status, key, onlineStatusFlag) => {
    return {
        text,
        status: statusMapper(status, onlineStatusFlag),
        key,
        icon,
        value
    }
};
module.exports = {
    deviceStatusCreator
};