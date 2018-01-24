let moment = require('moment')

let formatDate = (date, style) => {
    return moment(date).format(style)
}

module.exports = formatDate