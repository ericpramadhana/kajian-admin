<template>
  <aside>
    <header>
      <div class="header-top"></div>
      <div class="nav">
        <router-link to="/">
          <img src="/Icons/left.svg" alt="Kembali" />
        </router-link>
        <h3>Detail Kajian</h3>
      </div>
    </header>

    <div class="detail-card-box">
      <div v-if="loading" class="detail-loading">
        <div class="spinner"></div>
      </div>

      <template v-else-if="kajian">
        <div class="kajian-card">
          <div class="kajian-date">
            <img src="/Icons/date.svg" alt="" />
            <p>{{ formatTanggalPanjang(kajian.tanggal) }}</p>
          </div>
          <div class="kajian-time">
            <p>{{ kajian.waktu }} - selesai</p>
          </div>
          <h1>{{ kajian.judul }}</h1>
          <span class="line"></span>
          <div class="kajian-speaker">
            <p>Pengisi Kajian</p>
            <h6>{{ kajian.ustadz }}</h6>
          </div>
        </div>

        <div class="lokasi-card">
          <div class="title-lokasi">
            <img src="/Icons/lokasi-red.svg" alt="" />
            <h4>Lokasi</h4>
          </div>
          <h3>{{ kajian.nama_masjid }}</h3>
          <a :href="kajian.link_maps" target="_blank" rel="noopener">
            <div class="detail-lokasi">
              <img src="/Icons/marker.svg" alt="" />
              <h3>Buka Lokasi di Google Maps</h3>
            </div>
          </a>
        </div>
      </template>

      <p v-else class="empty-state">Kajian tidak ditemukan</p>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const loading = ref(true)
const kajian = ref(null)

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

onMounted(async () => {
  const id = route.params.id

  try {
    const response = await fetch(`http://localhost/kajian-admin-api/get-kajian.php?id=${id}`)
    const data = await response.json()

    if (!response.ok) {
      kajian.value = null
      return
    }

    kajian.value = data
  } catch (err) {
    console.error('Gagal memuat detail kajian:', err)
    kajian.value = null
  } finally {
    loading.value = false
  }
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

.nav {
  display: flex;
  gap: 12px;
  padding: 12px 20px 16px 20px;
  align-items: center;
}
.nav img {
  width: 20px;
  cursor: pointer;
}
.nav h3 {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}

.detail-card-box {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  min-height: 60vh;
}

.detail-card-box .kajian-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.06);
}
.kajian-card .kajian-date {
  display: flex;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  background: #E8F5E8;
  max-width: 200px;
}
.kajian-date p {
  color: #2E7D33;
  font-size: 13px;
  font-weight: 400;
  width: 148px;
}
.kajian-card .kajian-time {
  display: flex;
  gap: 6px;
}
.kajian-time p {
  color: #212121;
  font-size: 14px;
  font-weight: 500;
}
.kajian-card h1 {
  color: #212121;
  font-size: 20px;
  font-weight: 700;
}
.line {
  display: block;
  width: 100%;
  height: 1px;
  background-color: #E5E5E0;
}
.kajian-card .kajian-speaker {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.kajian-speaker p {
  color: #999999;
  font-size: 11px;
  font-weight: normal;
}
.kajian-speaker h6 {
  color: #212121;
  font-size: 15px;
  font-weight: 600;
}

.detail-card-box .lokasi-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.06);
}
.lokasi-card .title-lokasi {
  display: flex;
  gap: 6px;
}
.title-lokasi img {
  width: 16px;
  height: 16px;
}
.title-lokasi h4 {
  color: #212121;
  font-size: 14px;
  font-weight: 600;
}
.lokasi-card h3 {
  color: #212121;
  font-size: 16px;
  font-weight: 600;
}
.lokasi-card p {
  color: #737373;
  font-size: 13px;
  font-weight: normal;
}
.lokasi-card .detail-lokasi {
  display: flex;
  padding: 24px;
  width: 100%;
  height: 120px;
  align-items: center;
  justify-content: center;
  background: #E8F5E8;
  border-radius: 12px;
  gap: 6px;
  cursor: pointer;
}
.detail-lokasi img {
  width: 20px;
  height: 20px;
}
.detail-lokasi h3 {
  color: #2E7D33;
  font-size: 14px;
  font-weight: 500;
  margin: 0;
}

.detail-loading {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F7F7F5;
  border-radius: 24px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e3f2e5;
  border-top-color: #2e7d32;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  color: #737373;
  font-size: 14px;
  padding: 60px 0;
}
</style>