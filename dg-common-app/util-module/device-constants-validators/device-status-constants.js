const DEVICE_BATTERY_MAP = {
    batteryPercentage: {
        violation: {startValue: 0, color: 'RED', endValue: 10},
        warn: {startValue: 10, color: 'DARK_ORANGE', endValue: 20},
        moving: {startValue: 20, color: 'YELLOW', endValue: 30},
        safe: {startValue: 30, color: 'GREEN', endValue: 100},
    },
    batteryVoltage: {
        violation: {value: 2, color: 'RED'},
        warn: {value: 2.5, color: 'DARK_ORANGE'},
        moving: {value: 3.4, color: 'YELLOW'},
        safe: {value: 4, color: 'GREEN'}
    }
};


module.exports = {
    DEVICE_BATTERY_MAP
};