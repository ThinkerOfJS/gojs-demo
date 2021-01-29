import Vue from 'vue'
import Router from 'vue-router'
// const PdfView = () => import('./../components/views/Components/PdfView');
import PdfView from "../components/views/Components/PdfView";
import MeetingDetail from "../components/views/MeetingDetail";
import PrintingTest from "../components/views/PrintingTest";
import GoJs from '../components/views/GoJs'
Vue.use(Router);

export default new Router({
    routes: [
        {path: '/', redirect: '/go-js'},
        {path: '/home', name: 'home', component: MeetingDetail},
        {path:'/pdf-view', name: 'home', component: PdfView},
        {path:'/printing-test', name: 'home', component: PrintingTest},
        {path:'/go-js', name: 'home', component: GoJs},
    ]
});