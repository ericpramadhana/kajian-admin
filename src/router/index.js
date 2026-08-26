import { createRouter, createWebHistory } from 'vue-router'
import AdminLogin from '../components/AdminLogin.vue'
import AdminDashboard from '../components/AdminDashboard.vue'
import AdminForm from '../components/AdminForm.vue'
import PublicHome from '../components/PublicHome.vue'
import KajianDetail from '../components/KajianDetail.vue'

const routes = [
  { path: '/', name: 'home', component: PublicHome, meta: { title: 'Jadwal Kajian' } },
  { path: '/login', name: 'login', component: AdminLogin, meta: { title: 'Admin Login' } },
  {
    path: '/admin',
    name: 'admin',
    component: AdminDashboard,
    meta: { requiresAuth: true, title: 'Panel Admin' }
  },
  {
    path: '/admin/form',
    name: 'admin-form',
    component: AdminForm,
    meta: { requiresAuth: true, title: 'Form Kajian' }
  },
  {
  path: '/kajian/:id',
  name: 'kajian-detail',
  component: KajianDetail,
  meta: { title: 'Detail Kajian' }
}
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Route guard: cek token sebelum masuk halaman yang butuh login
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('admin_token')

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})
router.afterEach((to) => {
  document.title = to.meta.title || 'Kajian Admin'
})

export default router