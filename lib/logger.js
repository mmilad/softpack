
separator = (l) => {
    var sep = '\t'
    sep += l < 15 ?  '\t' : ''
    sep += l < 9 ?  '\t' : ''
    sep += l < 7 ?  '\t' : ''
    return sep+'->'
}
function logger (msg, type, label) {
    var msgLength = label 
        ? label.length 
        : 10
    if(logger[type]) {
        console.log(logger[type], label ? label : type, separator(msgLength), msg) 
    } else {
        if(label) {
            console.log(label ,separator(msgLength), msg) 
        } else {
            console.log('output',separator(msgLength), msg) 
        }
    }
}
logger.error = '\x1b[31m%s\x1b[0m'
logger.success = '\x1b[32m%s\x1b[0m'
logger.warning = '\x1b[35m%s\x1b[0m'
logger.notice = '\x1b[33m%s\x1b[0m'
module.exports = logger