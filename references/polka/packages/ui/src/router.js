import { createRouter, createWebHistory } from 'vue-router';
import WxhView from './views/WxhView.vue';
import AvatarsView from './views/AvatarsView.vue';
import StockView from './views/StockView.vue';

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/wxh' },
    { path: '/wxh', name: 'wxh', component: WxhView },
    { path: '/avatars', name: 'avatars', component: AvatarsView },
    { path: '/stock', name: 'stock', component: StockView },
  ],
});
