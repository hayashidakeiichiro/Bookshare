
<template>
  <div id="header">
    <!-- <h1 id="title">九州大学 BookShare</h1> -->
    <img class="logo" :src="'../img/logo_img.png'">
    <div id="login-form">
      <a href="/register" v-if="!login">会員登録</a>
      <a href="/login" v-if="!login">ログイン</a>
      <span v-if="login">
          <i class="las la-user-circle" style="font-size:1.5em;"></i>
          {{name}}さん
      </span>
      <span v-if="login">
          {{point}}P
      </span>
    </div>
  </div>
</template>

<script>
  module.exports = {
    props:{login:{default:false},
            name:{default:"noname"},
            point:{default: 20}
            },
    data(){
      return{
        uid:""
      }
    },
    methods:{

    }
  };
</script>

<style scoped>
@import "https://maxst.icons8.com/vue-static/landings/line-awesome/line-awesome/1.3.0/css/line-awesome.min.css";
#header{
  display: flex;
  /* background: #ff8484; */
  height: 60px;
  margin: 0;
  padding-top: 8px;
}
#header h1{
  font-size: 25px;
  right: 0;
  height: 40px;
  margin:0;
}
#header .logo{
  width: 40%;
  max-width: 250px;
  aspect-ratio: 3.5/1;
}
#login-form{
  width: 160px;
  margin: auto 0 20px auto;
  height: 20px;
  
}
#login-form a{
  text-decoration: none;
  margin-left: 10px;
  color:#000000;
  border: none;
  border-radius: 3px;
}
#login-form a:hover{
  opacity:0.7;
}


</style>