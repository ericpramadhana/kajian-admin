<template>
  <aside>
    <header>
      <div class="header-top"></div>
      <div class="title">
        <h3>Panel Admin</h3>
        <img src="/public/Icons/sign-out-alt.svg" alt="Logout" class="logout-icon" @click="handleLogout">
      </div>
    </header>

    <div class="nav">
      <span class="back-arrow" @click="handleBatal">←</span>
      <h3>{{ isEditMode ? 'Edit Kajian' : 'Tambah Kajian' }}</h3>
    </div>

    <div class="data-kajian">
      <div class="form-group">
        <label for="judul-kajian" class="form-label">Judul Kajian</label>
        <input
          type="text"
          id="judul-kajian"
          class="form-input"
          placeholder="Masukkan judul kajian"
          v-model="judul"
        />
      </div>

      <div class="form-group">
        <label for="nama-ustadz" class="form-label">Nama Ustadz/Ustadzah</label>
        <input
          type="text"
          id="nama-ustadz"
          class="form-input"
          placeholder="Masukkan nama ustadz/ustadzah"
          v-model="ustadz"
        />
      </div>

      <!-- Pilih tanggal -->
      <div class="form-group">
        <label for="tanggal-kajian" class="form-label">Pilih Tanggal</label>
        <div class="input-wrapper" @click="openSheet">
          <input
            type="text"
            id="tanggal-kajian"
            class="form-input"
            placeholder="dd/mm/yyyy"
            readonly
            :value="tanggalDisplay"
          />
        </div>
      </div>

      <!-- Overlay -->
      <div class="overlay" :class="{ open: sheetOpen }" @click="closeSheet"></div>

      <!-- Bottom sheet kalender -->
      <div class="sheet" :class="{ open: sheetOpen }">
        <div class="sheet-handle"></div>
        <div class="sheet-header">
          <div class="sheet-title">{{ monthLabel }}</div>
          <div class="month-nav">
            <button type="button" @click="prevMonth">&#8249;</button>
            <button type="button" @click="nextMonth">&#8250;</button>
          </div>
        </div>
        <div class="weekdays">
          <div>Min</div><div>Sen</div><div>Sel</div><div>Rab</div><div>Kam</div><div>Jum</div><div>Sab</div>
        </div>
        <div class="days-grid">
          <div
            v-for="(cell, index) in dayCells"
            :key="index"
            class="day-cell"
            :class="{
              empty: cell === null,
              today: cell && isToday(cell),
              selected: cell && isSelected(cell)
            }"
            @click="cell && selectDay(cell)"
          >
            {{ cell || '' }}
          </div>
        </div>
        <div class="sheet-actions">
          <button
            class="btn-confirm"
            type="button"
            :disabled="!pendingDate"
            @click="confirmDate"
          >
            Pilih Tanggal
          </button>
        </div>
      </div>

      <div class="form-group">
        <label for="waktu-kajian" class="form-label">Waktu</label>
        <input
          type="text"
          id="waktu-kajian"
          class="form-input"
          placeholder="Contoh: Ba'da Maghrib"
          v-model="waktu"
        />
      </div>
      <div class="form-group">
        <label for="nama-masjid" class="form-label">Nama Masjid</label>
        <input
            type="text"
            id="nama-masjid"
            class="form-input"
            placeholder="Contoh: Masjid Muslimin Labuah Baru"
            v-model="namaMasjid"
        />
      </div>

      <div class="form-group">
        <label for="link-maps" class="form-label">Alamat Masjid (Link Google Maps)</label>
        <input
          type="url"
          id="link-maps"
          class="form-input"
          :class="{ invalid: linkError }"
          placeholder="https://maps.app.goo.gl/..."
          inputmode="url"
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
          v-model="linkMaps"
          @input="onLinkInput"
          @blur="onLinkBlur"
        />
        <span class="form-error" :class="{ show: linkError }">
          Masukkan link yang valid (harus diawali https://)
        </span>
      </div>

      <div class="button-group">
        <button class="button-outline" type="button" @click="handleBatal">Batal</button>
        <button
            class="button-filled"
            type="button"
            :disabled="!formValid"
            @click="handleSimpan"
            >
            {{ isEditMode ? 'Simpan Perubahan' : 'Simpan' }}
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const kajianId = ref(route.query.id || null)
const isEditMode = computed(() => !!kajianId.value)

onMounted(async () => {
  if (!isEditMode.value) return

  try {
    const response = await fetch(`http://jadwalkajian.great-site.net/api/get-kajian.php?id=${kajianId.value}`)
    const data = await response.json()

    if (!response.ok) {
      alert(data.message || 'Gagal memuat data kajian')
      router.push('/admin')
      return
    }

    judul.value = data.judul
    ustadz.value = data.ustadz
    waktu.value = data.waktu
    namaMasjid.value = data.nama_masjid
    linkMaps.value = data.link_maps

    // Isi tanggal dari format MySQL (yyyy-mm-dd) ke tampilan dd/mm/yyyy
    const [year, month, day] = data.tanggal.split('-')
    tanggalDisplay.value = `${day}/${month}/${year}`
    selectedDate.value = new Date(data.tanggal)
    currentMonth.value = new Date(data.tanggal)
  } catch (err) {
    alert('Terjadi kesalahan saat memuat data')
  }
})

const monthNames = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
]

// ===== Form fields =====
const judul = ref('')
const ustadz = ref('')
const waktu = ref('')
const namaMasjid = ref('')
const linkMaps = ref('')
const linkError = ref(false)

// ===== Date picker state =====
const today = new Date()
const currentMonth = ref(new Date())
const selectedDate = ref(null)   // tanggal yang sudah dikonfirmasi
const pendingDate = ref(null)    // tanggal yang baru diklik, belum dikonfirmasi
const tanggalDisplay = ref('')
const sheetOpen = ref(false)

const monthLabel = computed(() => {
  return `${monthNames[currentMonth.value.getMonth()]} ${currentMonth.value.getFullYear()}`
})

const dayCells = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  return cells
})

function pad(n) {
  return n.toString().padStart(2, '0')
}

function isToday(day) {
  return (
    day === today.getDate() &&
    currentMonth.value.getMonth() === today.getMonth() &&
    currentMonth.value.getFullYear() === today.getFullYear()
  )
}

function isSelected(day) {
  if (!pendingDate.value) return false
  return (
    day === pendingDate.value.getDate() &&
    currentMonth.value.getMonth() === pendingDate.value.getMonth() &&
    currentMonth.value.getFullYear() === pendingDate.value.getFullYear()
  )
}

function openSheet() {
  sheetOpen.value = true
}

function closeSheet() {
  sheetOpen.value = false
}

function prevMonth() {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() - 1, 1)
}

function nextMonth() {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + 1, 1)
}

function selectDay(day) {
  pendingDate.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth(), day)
}

function confirmDate() {
  if (!pendingDate.value) return
  selectedDate.value = pendingDate.value
  tanggalDisplay.value = `${pad(selectedDate.value.getDate())}/${pad(selectedDate.value.getMonth() + 1)}/${selectedDate.value.getFullYear()}`
  closeSheet()
}

// ===== Validasi link Google Maps =====
function isValidUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function onLinkInput() {
  linkMaps.value = linkMaps.value.trim()
}

function onLinkBlur() {
  const value = linkMaps.value.trim()
  if (value === '') {
    linkError.value = false
    return
  }
  linkError.value = !isValidUrl(value)
}

// ===== Validasi form keseluruhan =====
const formValid = computed(() => {
  const judulFilled = judul.value.trim() !== ''
  const ustadzFilled = ustadz.value.trim() !== ''
  const tanggalFilled = tanggalDisplay.value.trim() !== ''
  const waktuFilled = waktu.value.trim() !== ''
  const namaMasjidFilled = namaMasjid.value.trim() !== ''
  const linkValid = isValidUrl(linkMaps.value.trim())

  return judulFilled && ustadzFilled && tanggalFilled && waktuFilled && namaMasjidFilled && linkValid
})

// ===== Actions =====
function handleBatal() {
  router.push('/admin')
}

async function handleSimpan() {
  if (!formValid.value) return

  const payload = {
    judul: judul.value,
    ustadz: ustadz.value,
    tanggal: tanggalDisplay.value,
    waktu: waktu.value,
    namaMasjid: namaMasjid.value,
    linkMaps: linkMaps.value
  }

  const url = isEditMode.value
  ? 'http://jadwalkajian.great-site.net/api/update-kajian.php'
  : 'http://jadwalkajian.great-site.net/api/simpan-kajian.php'

  if (isEditMode.value) {
    payload.id = kajianId.value
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!response.ok) {
      alert(data.message || 'Gagal menyimpan kajian')
      return
    }

    router.push('/admin')
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
.logout-icon {
  color: #ffffff;
  font-size: 16px;
  cursor: pointer;
  font-weight: 600;
}

.nav {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: #F7F7F5;
}
.back-arrow {
  font-size: 20px;
  color: #212121;
  cursor: pointer;
  font-weight: 600;
}
.nav h3 {
  color: #212121;
  font-size: 16px;
  font-weight: 600;
}

/* form kajian */
.data-kajian {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.data-kajian .form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-label {
  font-size: 12px;
  font-weight: 500;
  color: #737373;
}

.form-input {
  width: 100%;
  padding: 12px 14px;
  font-size: 14px;
  color: #111827;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  outline: none;
  box-sizing: border-box;
}

.form-input::placeholder {
  color: #CCCCCC;
  font-weight: 300;
}

.form-input:focus {
  border-color: #111827;
}

.form-input.invalid {
  border-color: #dc2626;
}
.form-input.invalid:focus {
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.form-error {
  display: none;
  font-size: 13px;
  color: #dc2626;
}
.form-error.show {
  display: block;
}

/* Overlay */
.overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 999;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.25s ease;
}
.overlay.open {
  opacity: 1;
  visibility: visible;
}

/* Bottom sheet */
.sheet {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  max-width: 390px;
  margin: 0 auto;
  background-color: #ffffff;
  border-radius: 20px 20px 0 0;
  z-index: 1000;
  transform: translateY(100%);
  transition: transform 0.28s cubic-bezier(0.32, 0.72, 0, 1);
  padding: 10px 20px calc(20px + env(safe-area-inset-bottom));
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.12);
}
.sheet.open {
  transform: translateY(0);
}

.sheet-handle {
  width: 40px;
  height: 4px;
  background-color: #e5e7eb;
  border-radius: 2px;
  margin: 0 auto 16px;
}

.sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.sheet-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.month-nav {
  display: flex;
  align-items: center;
  gap: 12px;
}

.month-nav button {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background-color: #f3f4f6;
  color: #374151;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.month-nav button:active {
  background-color: #e5e7eb;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 8px;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  row-gap: 4px;
}

.day-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #111827;
  border-radius: 10px;
  cursor: pointer;
}
.day-cell.empty {
  cursor: default;
}
.day-cell:not(.empty):active {
  background-color: #f3f4f6;
}
.day-cell.today {
  color: #2e7d32;
  font-weight: 600;
}
.day-cell.selected {
  background-color: #2e7d32;
  color: #ffffff;
  font-weight: 600;
}

.sheet-actions {
  margin-top: 16px;
}

.btn-confirm {
  width: 100%;
  padding: 14px;
  background-color: #2e7d32;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}
.btn-confirm:disabled {
  background-color: #d1d5db;
  cursor: not-allowed;
}

/* Button Group */
.button-group {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 24px;
}
.button-group .button-filled {
  padding: 14px 0;
  color: white;
  background: #2E7D33;
  width: 100%;
  border: #2E7D33 1px solid;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.button-filled:disabled {
  background-color: #D9D9D9;
  color: #ffffff;
  cursor: not-allowed;
  border: none;
}
.button-group .button-outline {
  padding: 14px 0;
  color: #737373;
  width: 100%;
  border: #E5E5E0 1px solid;
  border-radius: 12px;
  background: transparent;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.button-filled:not(:disabled):active {
  background-color: #2E7D33;
}
</style>