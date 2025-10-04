<template>
  <ContentBase>
    <div class="row justify-content-md-center">
      <div class="col-3">
        <!--阻止默认行为 -->
        <form @submit.prevent="login">
          <div class="mb-3">
            <label for="username" class="form-label">用户名</label>
            <input v-model="username" type="text" class="form-control" id="username">
          </div>
          <div class="mb-3">
            <label for="password" class="form-label">密码</label>
            <input v-model="password" type="password" class="form-control" id="password">
          </div>
          <div class="error-message">{{error_message}}</div>
          <button type="submit" class="btn btn-primary">登录</button>
        </form>
      </div>
    </div>
  </ContentBase>
</template>

<script>
import ContentBase from '../components/ContentBase'
import {ref} from 'vue'
import { useRouter } from 'vue-router';
import {loginAPI} from '../api/auth'
export default {
  name: 'LoginView',
  components:{
    ContentBase,
  },
  setup() {
    let username=ref('');
    let password=ref('');
    let error_message=ref('');
    const router=useRouter();
    let login = async() =>{
      if (!username.value || !password.value) {
        error_message.value = '请输入用户名和密码';
        return;
      }
      try{
        // 调用登录API
        const response = await loginAPI(username.value, password.value);
        // 存储用户信息到本地存储
        localStorage.setItem('userInfo', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.token);

        router.push('/home');     
      }
      catch(error){
        //登录失败
        error_message.value=error.response?.data?.message||'登录失败，请重试';
      }
    }
    return {
      username,
      password,
      error_message,
      login
    } 
  }
}
</script>
<style scoped>
button{
  width:100%;
}
.error-message{
  color:red;
}
</style>