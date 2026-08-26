<template>
  <aside>
    <div class="login-con">
      <span class="circle">🔒</span>
      <h3>Panel Admin</h3>
      <p>Masukkan PIN untuk mengakses panel admin</p>

      <input
        type="password"
        v-model="pin"
        placeholder="Masukkan PIN"
        maxlength="6"
        @keyup.enter="handleLogin"
      />

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

      <button @click="handleLogin" :disabled="loading">
        {{ loading ? 'Memproses...' : 'Masuk' }}
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue'

const pin = ref('')
const errorMessage = ref('')
const loading = ref(false)

async function handleLogin() {
  errorMessage.value = ''

  if (!pin.value) {
    errorMessage.value = 'PIN harus diisi'
    return
  }

  loading.value = true

  try {
    const response = await fetch('http://jadwalkajian.great-site.net/api/login.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: pin.value })
    })

    const data = await response.json()

    if (!response.ok) {
      errorMessage.value = data.message || 'PIN salah'
      return
    }

    localStorage.setItem('admin_token', data.token)
    window.location.href = '/admin'
  } catch (err) {
    errorMessage.value = 'Terjadi kesalahan, coba lagi'
  } finally {
    loading.value = false
    pin.value = ''
  }
}
</script>

<style scoped>
aside {
    background: #f7f7f4;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.login-con {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
}
.login-con {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
}
.login-con .circle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    border-radius: 40px;
    background-color: #E8F5E8;
    font-size: 32px;
    text-align: center;
}
.login-con h3 {
    color: #212121;
    font-size: 24px;
    font-weight: 700;
}
.login-con p {
    color: #737373;
    font-size: 14px;
    font-weight: normal;
}
.login-con input {
    display: flex;
    gap: 8px;
    padding: 12px 16px;
    border: solid 1px #E5E5E0;
    background: #ffffff;
    border-radius: 14px;
    cursor: text;
    width: 100%;
}
.login-con button {
    display: block;
    padding: 12px 0;
    color: #ffffff;
    border-radius: 14px;
    background: #2E7D33;
    width: 100%;
    border: none;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
}
.login-con button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
.input-group {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
}
.error-message {
  color: #D92E2E;
  font-size: 14px;
  font-weight: 500;
  margin-top: 6px;
  text-align: left;
}
</style>