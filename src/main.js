import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import VueRouter from 'vue-router'
import Home from '@/components/Home.vue'
import Stamper from '@/components/Stamper.vue'
import UserBrands from '@/components/UserBrands.vue'
import VueRx from 'vue-rx'
import QrCode from '@xkeshi/vue-qrcode'

Vue.config.productionTip = false;
Vue.config.ignoredElements = [/ion-\w*/];

Vue.use(VueRouter);
Vue.use(VueRx);

Vue.component(QrCode.name, QrCode)

const router = new VueRouter({
    routes: [
        {path: '/', component: Home},
        {path: '/stamper', component: Stamper},
        {path: '/user-brands', component: UserBrands}
    ]
})

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')
