<template>
<nav class="navbar navbar-expand-lg bg-body-tertiary">
  <div class="container">
    <router-link class="navbar-brand" :to="{name:'Home'}">表白墙</router-link>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarText">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item">
          <router-link class="nav-link active" aria-current="page" :to="{name:'Home'}">首页</router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" :to="{name:'Community'}">社区</router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" :to="{name:'BanList'}">黑名单</router-link>
        </li>
      </ul>
      <ul class="navbar-nav">
        <li class="nav-item">
          <router-link class="nav-link" :to="{name:'Login'}">登录</router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" :to="{name:'Register'}">注册</router-link>
        </li>
      </ul>
    </div>
  </div>
</nav>
</template>

<script>
export default{
   name:"NavBar",
}
</script> 

<style scoped>

</style>