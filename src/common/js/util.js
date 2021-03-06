// 打乱排序
function getRandomInt(min,max) {
    // 包含max和min
    return Math.floor(Math.random() * (max - min + 1) + min)
}
export function shuffle(arr) {
    for(let i=0; i<arr.length; i++) {
        let j = getRandomInt(0,i)
        let t = arr[i]
        arr[i] = arr[j]
        arr[j] = t
    }
    return arr
}

// 节流函数
export function debounce(fn, delay) {
    let timer
    return function(...args) {
        if(timer) {
            clearTimeout(timer)
        }
        timer = setTimeout(() => {
            fn.apply(this, args)
        }, delay)
    }
}
