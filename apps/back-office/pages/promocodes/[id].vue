<template>
  <div>
    <NuxtLayout name="admin">
      <div class="flex items-center justify-between mb-6">
        <h2 class="font-sans text-brand-olive text-2xl font-semibold">Editar Codigo Promocional</h2>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <p class="font-sans text-brand-olive/60 text-sm">Cargando...</p>
      </div>

      <div v-else class="max-w-2xl">
        <form @submit.prevent="handleSubmit">
          <!-- Code -->
          <div class="mb-5">
            <label class="block font-sans text-sm text-brand-olive/70 mb-1">Codigo *</label>
            <input
              v-model="form.code"
              type="text"
              required
              class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive uppercase focus:outline-none focus:border-brand-primary transition-colors"
            />
          </div>

          <!-- Description -->
          <div class="mb-5">
            <label class="block font-sans text-sm text-brand-olive/70 mb-1">Descripcion</label>
            <input
              v-model="form.description"
              type="text"
              class="w-full px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
            />
          </div>

          <!-- Discount percent -->
          <div class="mb-5">
            <label class="block font-sans text-sm text-brand-olive/70 mb-1">Porcentaje de descuento *</label>
            <div class="flex items-center gap-2">
              <input
                v-model.number="form.discountPercent"
                type="number"
                required
                min="1"
                max="100"
                class="w-32 px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
              />
              <span class="font-sans text-sm text-brand-olive/60">%</span>
            </div>
          </div>

          <!-- Max uses global -->
          <div class="mb-5">
            <label class="block font-sans text-sm text-brand-olive/70 mb-1">Usos maximos (global)</label>
            <input
              v-model.number="form.maxUses"
              type="number"
              min="0"
              class="w-32 px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
            />
            <p class="font-sans text-xs text-brand-olive/40 mt-1">0 = sin limite</p>
          </div>

          <!-- Max uses per customer -->
          <div class="mb-5">
            <label class="block font-sans text-sm text-brand-olive/70 mb-1">Usos maximos por cliente</label>
            <input
              v-model.number="form.maxUsesPerCustomer"
              type="number"
              min="0"
              class="w-32 px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
            />
            <p class="font-sans text-xs text-brand-olive/40 mt-1">0 = sin limite por cliente</p>
          </div>

          <!-- Expiry date -->
          <div class="mb-5">
            <label class="block font-sans text-sm text-brand-olive/70 mb-1">Fecha de vencimiento</label>
            <input
              v-model="form.expiresAt"
              type="date"
              class="w-64 px-4 py-2 border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus:outline-none focus:border-brand-primary transition-colors"
            />
            <p class="font-sans text-xs text-brand-olive/40 mt-1">Dejar vacio para sin vencimiento</p>
          </div>

          <!-- Active -->
          <div class="mb-8">
            <label class="flex items-center gap-3 cursor-pointer">
              <input
                v-model="form.isActive"
                type="checkbox"
                class="w-4 h-4 accent-brand-primary"
              />
              <span class="font-sans text-sm text-brand-olive">Activo</span>
            </label>
          </div>

          <!-- Actions -->
          <div class="flex gap-3">
            <button
              type="submit"
              :disabled="saving"
              class="px-6 py-2 bg-brand-primary text-brand-cream font-sans text-sm font-medium hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
            >
              {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
            <NuxtLink
              to="/promocodes"
              class="px-6 py-2 font-sans text-sm text-brand-olive border-2 border-brand-olive/20 hover:border-brand-olive/40 transition-colors"
            >
              Cancelar
            </NuxtLink>
          </div>

          <p v-if="error" class="mt-4 font-sans text-red-600 text-sm">{{ error }}</p>
        </form>

        <!-- Welcome Email Preview (only for codes with a template) -->
        <div v-if="hasEmailTemplate" class="mt-10 pt-8 border-t-2 border-brand-olive/10">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-sans text-brand-olive text-lg font-semibold">Email de bienvenida</h3>
            <button
              type="button"
              class="px-4 py-1.5 font-sans text-xs text-brand-olive border-2 border-brand-olive/20 hover:border-brand-olive/40 transition-colors"
              @click="showEmailPreview = !showEmailPreview"
            >
              {{ showEmailPreview ? 'Ocultar email' : 'Ver email de bienvenida' }}
            </button>
          </div>

          <div v-if="showEmailPreview">
            <div class="flex items-center gap-3 mb-4">
              <button
                type="button"
                class="px-5 py-2 bg-brand-primary text-brand-cream font-sans text-sm font-medium hover:bg-brand-primary/90 transition-colors"
                @click="copyEmailToClipboard"
              >
                {{ emailCopied ? 'Copiado' : 'Copiar al portapapeles' }}
              </button>
              <span v-if="emailCopied" class="font-sans text-xs text-green-700">Listo para pegar en Gmail</span>
            </div>

            <div class="border-2 border-brand-olive/10 p-4 overflow-auto bg-white">
              <div ref="emailContainer" v-html="emailHtml" />
            </div>
          </div>
        </div>

        <!-- Usage info (read-only) -->
        <div class="mt-10 pt-8 border-t-2 border-brand-olive/10">
          <h3 class="font-sans text-brand-olive text-lg font-semibold mb-4">Informacion de uso</h3>

          <div class="mb-4">
            <span class="font-sans text-sm text-brand-olive/70">Total de usos: </span>
            <span class="font-sans text-sm font-semibold text-brand-olive">{{ usageData.currentUses || 0 }}</span>
          </div>

          <div v-if="usageData.usedBy && usageData.usedBy.length > 0">
            <p class="font-sans text-sm text-brand-olive/70 mb-2">Emails que usaron este codigo:</p>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-brand-olive/10">
                    <th class="text-left font-sans text-xs text-brand-olive/50 pb-2 pr-4">Email</th>
                    <th class="text-left font-sans text-xs text-brand-olive/50 pb-2">Fecha de uso</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(usage, idx) in usageData.usedBy"
                    :key="idx"
                    class="border-b border-brand-olive/5"
                  >
                    <td class="py-2 pr-4 font-sans text-sm text-brand-olive">{{ usage.email || '—' }}</td>
                    <td class="py-2 font-sans text-sm text-brand-olive/70">{{ formatDate(usage.usedAt) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <p v-else class="font-sans text-sm text-brand-olive/50">Este codigo aun no fue utilizado.</p>
        </div>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()
const { get, put } = useApi()

const loading = ref(true)
const saving = ref(false)
const error = ref('')
const showEmailPreview = ref(false)
const emailCopied = ref(false)
const emailContainer = ref(null)

const form = ref({
  code: '',
  description: '',
  discountPercent: 10,
  maxUses: 0,
  maxUsesPerCustomer: 0,
  expiresAt: '',
  isActive: true,
})

const usageData = ref({
  currentUses: 0,
  usedBy: [],
})

function toTimestamp(date) {
  if (!date) return 0
  if (date._seconds) return date._seconds * 1000
  if (date.seconds) return date.seconds * 1000
  return new Date(date).getTime()
}

function formatDate(date) {
  if (!date) return ''
  const ms = toTimestamp(date)
  const d = new Date(ms)
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${hours}:${minutes}`
}

function toDateInputValue(date) {
  if (!date) return ''
  const ms = toTimestamp(date)
  const d = new Date(ms)
  return d.toISOString().split('T')[0]
}

const CODES_WITH_EMAIL = ['ELCOMIENZO']

const hasEmailTemplate = computed(() => {
  return CODES_WITH_EMAIL.includes(form.value.code.toUpperCase())
})

const emailHtml = computed(() => {
  const code = form.value.code || 'CODIGO'
  const discount = form.value.discountPercent || 0
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0;padding:0;background-color:#FEFCF0;">
  <tr>
    <td align="center" style="padding:0;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;margin:0 auto;">
        <!-- Header -->
        <tr>
          <td style="background-color:#741617;padding:32px 0;text-align:center;">
            <img src="https://res.cloudinary.com/dmb1vyveg/image/upload/v1771960002/el-gran-peon/customer-logos/txxvbgcxjvctdqxwpgv9.png" alt="El Gran Peón" width="180" style="display:block;margin:0 auto;width:180px;height:auto;" />
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="background-color:#FEFCF0;padding:40px 40px 24px 40px;">
            <p style="margin:0 0 20px 0;font-family:Georgia,serif;font-size:17px;line-height:1.6;color:#4C4A38;">
              Te suscribiste para recibir el beneficio de lanzamiento.
            </p>
            <p style="margin:0 0 28px 0;font-family:Georgia,serif;font-size:17px;line-height:1.6;color:#4C4A38;">
              La web de El Gran Peón ya está online y la Cápsula Raíz ya está disponible.
            </p>
          </td>
        </tr>
        <!-- Promo Code Box -->
        <tr>
          <td style="padding:0 40px 28px 40px;background-color:#FEFCF0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:2px solid #741617;">
              <tr>
                <td style="padding:28px 32px;text-align:center;">
                  <p style="margin:0 0 16px 0;font-family:Georgia,serif;font-size:16px;line-height:1.5;color:#4C4A38;">
                    Este es tu código exclusivo:
                  </p>
                  <p style="margin:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:28px;font-weight:bold;letter-spacing:3px;color:#741617;">
                    ${code}
                  </p>
                  <p style="margin:0;font-family:Georgia,serif;font-size:16px;line-height:1.5;color:#4C4A38;">
                    Ingresalo al finalizar la compra y aplicá tu ${discount}% de descuento de bienvenida.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Message -->
        <tr>
          <td style="background-color:#FEFCF0;padding:0 40px 24px 40px;">
            <p style="margin:0 0 20px 0;font-family:Georgia,serif;font-size:17px;line-height:1.6;color:#4C4A38;">
              Este beneficio fue creado únicamente para quienes se registraron antes del lanzamiento. No es público y tiene tiempo limitado.
            </p>
            <p style="margin:0 0 28px 0;font-family:Georgia,serif;font-size:17px;line-height:1.6;color:#4C4A38;font-style:italic;">
              Si estabas esperando la señal, es esta.
            </p>
          </td>
        </tr>
        <!-- CTA -->
        <tr>
          <td align="center" style="background-color:#FEFCF0;padding:0 40px 28px 40px;">
            <a href="https://elgranpeon.com" target="_blank" style="display:inline-block;padding:14px 40px;background-color:#741617;color:#FEFCF0;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;letter-spacing:1.5px;text-decoration:none;text-transform:uppercase;">
              ENTRAR AHORA
            </a>
          </td>
        </tr>
        <!-- Thanks -->
        <tr>
          <td style="background-color:#FEFCF0;padding:0 40px 40px 40px;">
            <p style="margin:0;font-family:Georgia,serif;font-size:17px;line-height:1.6;color:#4C4A38;">
              Gracias por estar desde el inicio.
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background-color:#4C4A38;padding:24px 40px;text-align:center;">
            <p style="margin:0 0 4px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#FEFCF0;text-decoration:none;">
              <span style="color:#FEFCF0;">elgranpeon.com</span>
            </p>
            <p style="margin:0;font-family:Georgia,serif;font-size:12px;color:#FEFCF0;letter-spacing:1px;opacity:0.7;">
              Hecho para durar. Como las cosas bien hechas.
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
})

async function copyEmailToClipboard() {
  try {
    const html = emailContainer.value?.innerHTML
    if (!html) return
    const blob = new Blob([html], { type: 'text/html' })
    await navigator.clipboard.write([
      new ClipboardItem({ 'text/html': blob })
    ])
    emailCopied.value = true
    setTimeout(() => { emailCopied.value = false }, 3000)
  } catch (err) {
    console.error('Failed to copy email:', err)
  }
}

onMounted(async () => {
  try {
    const promo = await get(`/api/promocodes/${route.params.id}`)

    form.value = {
      code: promo.code || '',
      description: promo.description || '',
      discountPercent: promo.discountPercent || 10,
      maxUses: promo.maxUses ?? 0,
      maxUsesPerCustomer: promo.maxUsesPerCustomer ?? 0,
      expiresAt: toDateInputValue(promo.expiresAt),
      isActive: promo.isActive ?? true,
    }

    usageData.value = {
      currentUses: promo.currentUses || 0,
      usedBy: promo.usedBy || [],
    }
  } catch (err) {
    error.value = 'Error al cargar el codigo promocional'
    console.error(err)
  } finally {
    loading.value = false
  }
})

async function handleSubmit() {
  saving.value = true
  error.value = ''

  try {
    const data = {
      code: form.value.code,
      description: form.value.description,
      discountPercent: form.value.discountPercent,
      maxUses: form.value.maxUses,
      maxUsesPerCustomer: form.value.maxUsesPerCustomer,
      expiresAt: form.value.expiresAt || null,
      isActive: form.value.isActive,
    }
    await put(`/api/promocodes/${route.params.id}`, data)
    router.push('/promocodes')
  } catch (err) {
    error.value = err.message || 'Error al actualizar el codigo promocional'
  } finally {
    saving.value = false
  }
}
</script>
