<template>
  <aside>
    <header>
      <div class="header-top"></div>
      <div class="title">
        <h3>Jadwal Kajian</h3>
        <div class="loc">
          <img src="/public/Icons/lokasi.svg" alt="" />
          <p>Kota Payakumbuh, Kab. Limapuluh Kota</p>
        </div>
      </div>
      <div class="search-box">
        <div class="search">
          <img src="/public/Icons/search.svg" alt="" />
          <input
            type="text"
            placeholder="Cari kajian, ustadz, atau masjid..."
            v-model="searchQuery"
          />
        </div>
      </div>
    </header>

    <div class="date-filter">
      <button
        class="date-button"
        :class="{ active: activeFilter === 'today' }"
        @click="activeFilter = 'today'"
      >
        Hari Ini
      </button>
      <button
        class="date-button"
        :class="{ active: activeFilter === 'tomorrow' }"
        @click="activeFilter = 'tomorrow'"
      >
        Besok
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
      <h3>{{ jadwalTitleText }}</h3>
      <span v-if="loading" class="loading loading-count"></span>
      <p v-else>{{ filteredKajian.length }} Kajian</p>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="loading-card">
      <div class="loading-content" v-for="n in 3" :key="n">
        <span class="loading skeleton-text"></span>
        <span class="loading skeleton-text"></span>
        <span class="loading skeleton-text"></span>
        <div class="cont-load">
          <span class="loading skeleton-text"></span>
          <span class="loading skeleton-location"></span>
        </div>
      </div>
    </div>

    <!-- Daftar kajian -->
    <div v-else class="card-container">
      <p v-if="filteredKajian.length === 0" class="empty-state">
        Belum ada kajian
      </p>

      <router-link
        v-for="item in filteredKajian"
        :key="item.id"
        :to="`/kajian/${item.id}`"
      >
        <div class="card">
          <div class="time">
            <img src="/public/Icons/clock.svg" alt="" />
            <p>{{ item.waktu }} - selesai</p>
          </div>
          <h3>{{ item.judul }}</h3>
          <div class="ustd">
            <img src="/public/Icons/muslim.svg" alt="" />
            <p>{{ item.ustadz }}</p>
          </div>
          <div class="cont">
            <div class="mesdj">
              <img src="/public/Icons/mosque-01.svg" alt="" />
              <p>{{ item.nama_masjid }}</p>
            </div>
            <div class="lokasi">
              <p>Lihat Lokasi</p>
            </div>
          </div>
        </div>
      </router-link>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const loading = ref(true)
const kajianList = ref([])
const activeFilter = ref('today')
const searchQuery = ref('')

onMounted(async () => {
  try {
    const response = await fetch('https://jadwalkajian.great-site.net/api/list-kajian.php')
    const data = await response.json()
    kajianList.value = data.kajian
  } catch (err) {
    console.error('Gagal memuat data kajian:', err)
  } finally {
    loading.value = false
  }
})

const jadwalTitleText = computed(() => {
  if (activeFilter.value === 'today') return 'Jadwal Hari Ini'
  if (activeFilter.value === 'tomorrow') return 'Jadwal Besok'
  return 'Jadwal Minggu Ini'
})

const filteredKajian = computed(() => {
  const sorted = [...kajianList.value].sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal))

  let filtered = sorted

  if (activeFilter.value === 'today') {
    const todayStr = new Date().toISOString().split('T')[0]
    filtered = sorted.filter(item => item.tanggal === todayStr)
  } else if (activeFilter.value === 'tomorrow') {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]
    filtered = sorted.filter(item => item.tanggal === tomorrowStr)
  } else if (activeFilter.value === 'week') {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek

    const monday = new Date(now)
    monday.setDate(now.getDate() + diffToMonday)
    monday.setHours(0, 0, 0, 0)

    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    sunday.setHours(23, 59, 59, 999)

    filtered = sorted.filter(item => {
      const itemDate = new Date(item.tanggal)
      return itemDate >= monday && itemDate <= sunday
    })
  }

  // Terapkan pencarian di atas hasil filter tanggal
  const query = searchQuery.value.trim().toLowerCase()
  if (query !== '') {
    filtered = filtered.filter(item =>
      item.judul.toLowerCase().includes(query) ||
      item.ustadz.toLowerCase().includes(query) ||
      item.nama_masjid.toLowerCase().includes(query)
    )
  }

  return filtered
})
</script>

<style scoped>
aside {
  background: #f7f7f4;
  min-height: 100vh;
}
a {
  text-decoration: none;
}
header {
  background-color: #2E7D33;
}
header .header-top {
  height: 48px;
}
header .title {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 4px 20px 20px 20px;
}
.title h3 {
  color: #fff;
  font-size: 22px;
  font-weight: 600;
}
.title .loc {
  display: flex;
  gap: 4px;
  color: #fff;
}
.title .loc p {
  font-size: 13px;
  font-weight: 300;
}

.search-box {
  padding: 0px 20px 20px 20px;
}
.search-box .search {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: #fff;
  border-radius: 24px;
  cursor: text;
}
.search input {
  border: none;
  outline: none;
  width: 100%;
  font-size: 14px;
  color: #212121;
}
.search input::placeholder {
  font-size: 14px;
  color: #999;
}

.date-filter {
  padding: 16px 20px;
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
.date-filter .date-button.active {
  background: #2E7D33;
  border-color: #2E7D33;
  color: #fff;
}

.jadwal-title {
  display: flex;
  justify-content: space-between;
  padding: 8px 20px 4px 20px;
  background: #F7F7F5;
}
.jadwal-title h3 {
  color: #212121;
  font-size: 16px;
}
.jadwal-title p {
  color: #737373;
  font-size: 13px;
}
.loading-count {
  width: 79px;
  height: 16px;
  background: #eeeeeb;
  border-radius: 8px;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

.card-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px 20px 20px 20px;
  background: #f7f7f4;
}
.card-container .card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
}
.card .time {
  display: flex;
  gap: 4px;
  background: #E8F5E8;
  width: fit-content;
  padding: 4px 8px;
  border-radius: 8px;
  align-items: center;
}
.time img {
  width: 12px;
  height: 12px;
}
.time p {
  color: #2E7D33;
  font-size: 12px;
  font-weight: 400;
}
.card h3 {
  color: #212121;
  font-size: 16px;
  font-weight: 600;
}
.card .ustd {
  display: flex;
  gap: 6px;
}
.ustd img {
  width: 14px;
  height: 14px;
}
.ustd p {
  color: #737373;
  font-size: 13px;
}

.card .cont {
  display: flex;
  justify-content: space-between;
}
.cont .mesdj {
  display: flex;
  gap: 6px;
}
.mesdj img {
  width: 14px;
  height: 14px;
}
.mesdj p {
  color: #737373;
  font-size: 13px;
}
.cont .lokasi {
  background: #F7F7F5;
  padding: 2px 8px;
  border-radius: 8px;
}
.lokasi p {
  color: #999;
  font-size: 11px;
  font-weight: 400;
}

.empty-state {
  text-align: center;
  color: #737373;
  font-size: 14px;
  padding: 60px 20px;
}

.loading-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px 20px 20px 20px;
}
.loading-card .loading-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: #fff;
  padding: 16px;
  border-radius: 16px;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.06);
}
.loading-content .loading {
  display: block;
  background: #F7F7F5;
  border-radius: 8px;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}
.skeleton-text {
  width: 55%;
  height: 23px;
}
.cont-load {
  display: flex;
  justify-content: space-between;
}
.skeleton-location {
  width: 25%;
  height: 23px;
}
@keyframes skeleton-loading {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}
</style>