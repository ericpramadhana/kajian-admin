<template>
  <aside>
    <header>
      <div class="header-top"></div>
      <div class="title">
        <h3>Panel Admin</h3>
        <img src="/public/Icons/sign-out-alt.svg" alt="Logout" class="logout-icon" @click="handleLogout">
      </div>
    </header>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Memuat data...</p>
    </div>

    <template v-else>
      <div class="card-sum">
        <div class="card">
          <h3>{{ summary.total }}</h3>
          <p>Total</p>
        </div>
        <div class="card">
          <h3>{{ summary.today }}</h3>
          <p>Hari Ini</p>
        </div>
        <div class="card">
          <h3>{{ summary.week }}</h3>
          <p>Minggu Ini</p>
        </div>
      </div>

      <div class="date-filter">
        <button
          class="date-button"
          :class="{ active: activeFilter === 'all' }"
          @click="activeFilter = 'all'"
        >
          Semua
        </button>
        <button
          class="date-button"
          :class="{ active: activeFilter === 'today' }"
          @click="activeFilter = 'today'"
        >
          Hari Ini
        </button>
        <button
          class="date-button"
          :class="{ active: activeFilter === 'week' }"
          @click="activeFilter = 'week'"
        >
          Minggu Ini
        </button>
      </div>

      <div class="jadwal-title">
        <h3>Daftar Kajian</h3>
      </div>

      <div class="daftar-kajian">
        <p v-if="filteredKajian.length === 0" class="empty-state">Belum ada kajian</p>

        <div class="card-daftar-kajian" v-for="item in filteredKajian" :key="item.id">
          <div class="text-group">
            <h3>{{ item.judul }}</h3>
            <p>{{ formatTanggalPanjang(item.tanggal) }}</p>
            <p>{{ item.waktu }}</p>
            <p>{{ item.nama_masjid }}</p>
            <p>{{ item.ustadz }}</p>
          </div>
          <div class="icon-group">
            <span class="icon-edit" @click="handleEdit(item.id)">
              <img src="/public/Icons/pencil.svg" alt="Edit" />
            </span>
            <span class="icon-delete" @click="handleDelete(item.id)">
              <img src="/public/Icons/trash.svg" alt="Hapus" />
            </span>
          </div>
        </div>
      </div>

      <div class="button-container">
        <div class="button-wrapper">
          <router-link to="/admin/form">
            <button class="floating-button">Tambah Kajian Baru</button>
          </router-link>
        </div>
      </div>
    </template>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(true)
const activeFilter = ref('all')
const kajianList = ref([])

const summary = ref({
  total: 0,
  today: 0,
  week: 0
})

const filteredKajian = computed(() => {
  const sorted = [...kajianList.value].sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal))

  if (activeFilter.value === 'all') {
    return sorted
  }

  const todayStr = new Date().toISOString().split('T')[0]

  if (activeFilter.value === 'today') {
    return sorted.filter(item => item.tanggal === todayStr)
  }

  if (activeFilter.value === 'week') {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek

    const monday = new Date(now)
    monday.setDate(now.getDate() + diffToMonday)
    monday.setHours(0, 0, 0, 0)

    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    sunday.setHours(23, 59, 59, 999)

    return sorted.filter(item => {
      const itemDate = new Date(item.tanggal)
      return itemDate >= monday && itemDate <= sunday
    })
  }

  return sorted
})

onMounted(async () => {
  try {
    const response = await fetch('http://jadwalkajian.great-site.net/api/list-kajian.php')
    const data = await response.json()

    kajianList.value = data.kajian
    summary.value = data.summary
  } catch (err) {
    console.error('Gagal memuat data kajian:', err)
  } finally {
    loading.value = false
  }
})

const hariNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu']
const bulanNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

function formatTanggalPanjang(tanggalMysql) {
  const date = new Date(tanggalMysql)
  const hari = hariNames[date.getDay()]
  const tanggal = date.getDate()
  const bulan = bulanNames[date.getMonth()]
  const tahun = date.getFullYear()
  return `${hari}, ${tanggal} ${bulan} ${tahun}`
}

function handleEdit(id) {
  router.push(`/admin/form?id=${id}`)
}

async function handleDelete(id) {
  try {
    const response = await fetch(`http://jadwalkajian.great-site.net/api/hapus-kajian.php?id=${id}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      alert('Gagal menghapus kajian')
      return
    }

    kajianList.value = kajianList.value.filter(item => item.id !== id)
    summary.value.total -= 1
  } catch (err) {
    alert('Terjadi kesalahan, coba lagi')
  }
}

function handleLogout() {
  localStorage.removeItem('admin_token')
  router.push('/login')
}
</script>

<style scoped>
aside {
  min-height: 100vh;
  background: #f7f7f4;
}

header {
  background-color: #2E7D33;
}
header .header-top {
  height: 48px;
}
header .title {
  display: flex;
  padding: 12px 20px 16px 20px;
  justify-content: space-between;
  align-items: center;
}
.title h3 {
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
}
.title img {
  width: 16px;
  cursor: pointer;
}

.card-sum {
  display: flex;
  gap: 12px;
  padding: 12px 20px;
  background: #f7f7f4;
}
.card-sum .card {
  display: flex;
  flex-direction: column;
  padding: 10px 12px;
  border-radius: 12px;
  background: #E8F5E8;
  gap: 2px;
  align-items: center;
  width: 100%;
}
.card h3 {
  color: #2E7D33;
  font-size: 22px;
  font-weight: 700;
}
.card p {
  color: #737373;
  font-size: 11px;
  font-weight: 500;
}

.date-filter {
  padding: 16px 20px 8px 20px;
  display: flex;
  gap: 8px;
  background: #f7f7f4;
}
.date-filter .date-button {
  padding: 8px 16px;
  border-radius: 24px;
  border: 1px solid #E5E5E0;
  background: #fff;
  font-size: 13px;
  color: #212121;
  cursor: pointer;
}
.logout-icon {
  color: #ffffff;
  font-size: 16px;
  cursor: pointer;
  font-weight: 600;
}
.date-filter .date-button.active {
  background: #2E7D33;
  border-color: #2E7D33;
  color: #fff;
}
.jadwal-title {
  padding: 16px 20px 8px 20px;
}
.daftar-kajian {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 20px 100px 20px;
}

.card-daftar-kajian {
  display: flex;
  justify-content: space-between;
  padding: 12px 14px;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.06);
  align-items: center;
}

.card-daftar-kajian .text-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.text-group h3 {
  color: #212121;
  font-size: 14px;
  font-weight: 600;
}
.text-group p {
  color: #737373;
  font-size: 12px;
  font-weight: normal;
}

.card-daftar-kajian .icon-group {
  display: flex;
  gap: 8px;
}
.icon-group .icon-edit {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 6px 8px;
  background: #E8F5E8;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}
.icon-group .icon-delete {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 6px 8px;
  background: #FFEDED;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.empty-state {
  text-align: center;
  color: #737373;
  font-size: 14px;
  padding: 60px 0;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 60px 20px;
}
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #E5E5E0;
  border-top-color: #2E7D33;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.loading-state p {
  color: #737373;
  font-size: 14px;
}

.button-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 0;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  background-color: #f7f7f4;
  z-index: 1000;
  margin: 0 auto;
  width: 390px;
}

.button-wrapper {
  max-width: 390px;
  margin: 0 auto;
  padding: 0 16px;
}

.floating-button {
  width: 100%;
  padding: 14px 24px;
  background-color: #2e7d32;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.floating-button:active {
  background-color: #256428;
}
</style>