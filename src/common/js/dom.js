// 添加class之前判断是否存在，可以用classList方法。
export function addClass(el, className) {
    if(hasClass(el, className)) {
        return
    }
    let newClass = el.className.split(' ')
    newClass.push(className)
    el.className = newClass.join(' ')
}

export function hasClass(el, className) {
    let reg = new RegExp('(^|\\S)' + className + '(\\s|$)')
    return reg.test(el.className)
}

// 获取索引的方法封装.2个参数是获取，3个参数是设置
export function getData(el, name, val) {
    const prefix = 'data-'
    name = prefix + name
    if(val) {
        return el.setAttribute(name, val)
    } else {
        return el.getAttribute(name)
    }
}

// transform自动补一个moz、webkit等前缀
let elementStyle = document.createElement('div').style
// 检测是哪个流浪器
let vendor = (() => {
    let transformNames = {
        webkit: 'webkiTransform',
        Moz: 'mozTransform',
        O: 'OTransform',
        ms: 'msTransform',
        standard: 'transform'
    }
    for(let key in transformNames) {
        if(elementStyle[transformNames[key]] !== undefined) {
            return key
        }
    }
    // 如果都没，不知道是上面野鸡流浪器
    return false
})()
// transform自动补一个moz、webkit等前缀的方法
export function prefixStyle(style) {
    if(vendor === false) {
        return false
    }
    if(vendor === 'standard') {
        return style
    }
    // 否则返回
    return vendor + style.charAt(0).toUpperCase() + style.substr(1)
}