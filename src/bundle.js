import { createApp } from 'vue';
import header from './vue/header.vue';
import Navigation from './vue/Navigation.vue';



const app = createApp({
  components: {
    'Navigation': Navigation,
    'header-tag': header
  }
}) 

app.mount('#hoge')



