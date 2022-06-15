import { createApp } from 'vue';
import header from './vue/header.vue';
import Navigation from './vue/Navigation.vue';
import {loginCheck} from './js/functions.js';

const db=firebase.firestore();
const app = createApp({
  data(){
    return{
      login:false,
      name:'noname',
      point:-1,
      alerton:false
    }
  },
  components: {
    'Navigation': Navigation,
    'header-tag': header
  },
  methods:{
    pointMinus:function(){
      this.point=this.point-100
    },
    pointplus:function(){
      this.point=this.point+75
    }
  },
  created(){
    const vm = this;
    async function run(){
      const login = await loginCheck(firebase);
      if (login){
        vm.login=true;
        const uid = sessionStorage.getItem('user');
        db.collection('users').doc(uid).get().then(doc=>{
          vm.name=doc.data().name;
          vm.point=doc.data().point;
        })
        db.collection('users').doc(uid).collection('alert').limit(1).get().then(snapshot=>{
          snapshot.forEach((doc)=>{
            vm.alerton = true;
            }
          )
        })
      }
    }
    run()
   
  }
}) 

app.mount('#hoge')



