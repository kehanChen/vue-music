<!-- 所有可以滚动的，划屏的组件-->
<template>
  <div ref="wrapper">
    <slot></slot>
  </div>
</template>

<script type="text/ecmascript6">
    import BScroll from 'better-scroll'
    export default {
        props: {
            probeType: {
                type: Number,
                default: 1
            },
            click: {
                type: Boolean,
                default: true
            },
            data: {
                type: Array,
                default: null
            },
            // 是否监听滚动到上面位置了，如果要左右关联的有用
            listenScroll: {
                type: Boolean,
                default: false
            },
            // 是否开启上拉刷新
            pullup: {
                type: Boolean,
                default: false
            },
            // 滚动前失去焦点，手机端有用
            beforeScroll: {
                type: Boolean,
                default: false
            }
        },
        mounted() {
            // 要确保dom渲染了再重新计算大小
            this.timer = setInterval(() => {

                if(this.data.length>=2) {
                    this._initScroll()
                    clearInterval(this.timer)
                } 
            },20)
        },
        methods: {
            // 初始化，每次改变大小，重新加载等时候初始化
            _initScroll() {
                // wrapper没有的时候,还加载毛，好玩？
                if(!this.$refs.wrapper){
                    return
                }
                this.scroll = new BScroll(this.$refs.wrapper, {
                    probeType: this.probeType,
                    click: this.click
                })
                // console.log(this.scrollTo(0,-2000))
                if(this.listenScroll) {
                    let me = this
                    // scroll里面默认改变指向。默认指向this.scroll（实例化对象）
                    this.scroll.on('scroll', (pos) => {
                        me.$emit('scroll', pos)
                    })
                }
                // 是否开启上拉刷新
                if(this.pullup) {
                    this.scroll.on('scrollEnd', () => {
                        // 快到了，派发快结束的事件
                        if(this.scroll.y <= (this.scroll.maxScrollY + 50)) {
                            this.$emit('scrollToEnd')
                        }
                    })
                }
                // 如果输入框，滚动前要失去焦点。滚动前派发出去
                if(this.beforeScroll) {
                    this.scroll.on('beforeScrollStart', () => {
                        this.$emit('beforeScroll')
                    })
                }
            },
            // 代理一些方法。代理出来上面后自己用
            enable() {
                this.scroll && this.scroll.enable()
            },
            disable() {
                this.scroll && this.scroll.disable()
            },
            refresh() {
                this.scroll && this.scroll.refresh()
            },
            scrollTo() {
                this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments)
            },
            scrollToElement() {
                this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments)
            }
        },
        // 监视data的变化。数据变化了，重新刷新
        watch: {
            data() {
                setTimeout(() => {
                    this.refresh()
                },20)
                // if(this.num.length>=2) {
                //     this.refresh()
                // }
            }
        }
    }
</script>

<style lang="stylus" scoped rel="stylesheet/stylus">

</style>

