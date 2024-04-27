const commonFunction = {
    generateNumber: (number, prefix) => {
        return `${prefix}${String(number)?.padStart(4, '0')}`
    }
}

module.exports = commonFunction