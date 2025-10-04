import { createStore } from 'vuex';
export default createStore({
  state: {
    userInfo: {
      avatar: 'https://cn.bing.com/images/search?view=detailV2&ccid=L04SrvxM&id=687F4429540476E2CAE893CEE99A0F15BBE666C9&thid=OIP.L04SrvxMxeaakcLwuL0jMwHaHa&mediaurl=https%3A%2F%2Fwww.keaitupian.cn%2Fcjpic%2Ffrombd%2F0%2F253%2F838350541%2F3524722087.jpg&exph=500&expw=500&q=%E7%A9%BA%E7%99%BD%E5%9B%BE%E7%89%87&FORM=IRPRST&ck=4D8825FE0FAAE973644C0440D6E9D3B2&selectedIndex=7&itb=0&cw=748&ch=739&ajaxhist=0&ajaxserp=0', // 可使用默认图片
      username: ''
    }
  },
  getters: {
    getUserInfo: state => state.userInfo
  },
  //对state的直接修改操作
  mutations: {
    updateAvatar(state, newAvatar) {
      state.userInfo.avatar = newAvatar
    },
    updateUsername(state, newName) {
      state.userInfo.username = newName
    }
  },
  actions: {
  },
  modules: {
  }
})