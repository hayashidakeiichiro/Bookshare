
<template>
<div>
  <div id="container">
  <ul>
    <li class="list" :class="{'nowpage': page=='home'}" id="home" @click="home">
      <span class="icon">
        <i class="las la-home"></i>
      </span>
      <span class="text">
        ホーム        
      </span>
    </li>
    <li class="list" :class="{'nowpage': page=='alert'}" id="alert" @click="alert">
      <span class="icon">
        <i class="las la-bell"></i>
      </span>
      <span class="text">
        お知らせ     
      </span>
      <div id='alert-point' v-if="alerton"></div>
    </li>
    <li class="list" :class="{'nowpage': page=='give'}" id="give" @click="give">
      <span class="icon">
        <i class="las la-book"></i>
      </span>
      <span class="text">
        あげる       
      </span>
    </li>
    <li class="list" :class="{'nowpage': page=='mypage'}" id="mypage" @click="mypage">
      <span class="icon">
        <i class="las la-user"></i>
      </span>
      <span class="text">
        マイページ        
      </span>
    </li>
  </ul>
  </div>
</div>
</template>

<script>

  module.exports = {
   props: {
    page:{ default: "0"},
    alerton:{default: true}
    },
    methods:{
      home: function(){
        location.href="/"
      },
      give: function(){
        location.href="/give"
      },
      mypage: function(){
        location.href="/Mypage"
      },
      alert: function(){
        location.href="/alert"
      }
    }
  };
</script>

<style scoped>
@import "https://maxst.icons8.com/vue-static/landings/line-awesome/line-awesome/1.3.0/css/line-awesome.min.css";

#container{
  display:relative;
  margin: 0;
  background-color: rgb(255, 255, 255);
}
#container ul{
  display:flex;
  list-style: none;
  padding:0;
}
#container li{
  display:flex;
  position: relative;
  width: 25%;
  flex-direction: column;
  list-style: none;
  padding:0;
  margin: 0 auto ;
  justify-content: center;
  align-items: center;
}
#container li:hover{
  cursor: pointer;
}

#container .icon{
  border-radius: 50%;
  width: 50px;
  height: 50px;
  text-align:center;
  transition: all 0.3s;
}
#container li:hover .icon{
  position: absolute;
  /* background: #006ccb; */
  color:#006ccb;
  transform: translateY(-5px);
  
}
#container li:hover  .text{
  color:#006ccb;
}
#container i{
  line-height: 50px;
  font-size: 2em;
}

#container .text{
  position: absolute;
  bottom: -16px;
}
.nowpage span{
  color:#006ccb;
}
.nowpage .text::before{
  content: '';

  position: absolute;
  left: 50%;
  bottom: -5px; /*下線の上下位置調整*/
  display: inline-block;
  width: 50px; /*下線の幅*/
  height: 4px; /*下線の太さ*/
  -moz-transform: translateX(-50%);
  -webkit-transform: translateX(-50%);
  -ms-transform: translateX(-50%);
  transform: translate(-50%); /*位置調整*/
  background-color: #006ccb; /*下線の色*/
}
.list{
  position: relative;
}

#alert-point{
  position: absolute;
  background-color: #f29191;
  width:10px;
  height:10px;
  border-radius:50%;
  top:0;
  right:30%;
}

</style>