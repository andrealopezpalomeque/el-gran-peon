<template>
  <div>
    <NuxtLayout name="admin">
      <div class="flex items-center justify-between mb-6">
        <h2 class="font-sans text-brand-olive text-2xl font-semibold">Codigos Promocionales</h2>
        <NuxtLink
          to="/promocodes/nuevo"
          class="px-5 py-2 bg-brand-primary text-brand-cream font-sans text-sm font-medium hover:bg-brand-primary/90 transition-colors"
        >
          Nuevo Codigo
        </NuxtLink>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <p class="font-sans text-brand-olive/60 text-sm">Cargando codigos...</p>
      </div>

      <!-- Empty state -->
      <div v-else-if="promoCodes.length === 0" class="text-center py-12">
        <p class="font-sans text-brand-olive/60 text-sm">No hay codigos promocionales creados.</p>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b-2 border-brand-olive/10">
              <th class="text-left font-sans text-xs text-brand-olive/50 uppercase tracking-wide pb-3 pr-4">Codigo</th>
              <th class="text-left font-sans text-xs text-brand-olive/50 uppercase tracking-wide pb-3 pr-4">Descuento</th>
              <th class="text-left font-sans text-xs text-brand-olive/50 uppercase tracking-wide pb-3 pr-4">Usos</th>
              <th class="text-left font-sans text-xs text-brand-olive/50 uppercase tracking-wide pb-3 pr-4">Vencimiento</th>
              <th class="text-left font-sans text-xs text-brand-olive/50 uppercase tracking-wide pb-3 pr-4">Estado</th>
              <th class="text-left font-sans text-xs text-brand-olive/50 uppercase tracking-wide pb-3 pr-4">Email</th>
              <th class="text-right font-sans text-xs text-brand-olive/50 uppercase tracking-wide pb-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="promo in promoCodes"
              :key="promo.id"
              class="border-b border-brand-olive/5"
            >
              <td class="py-3 pr-4">
                <span class="font-sans text-sm font-semibold text-brand-olive">{{ promo.code }}</span>
                <span v-if="promo.description" class="block font-sans text-xs text-brand-olive/50">{{ promo.description }}</span>
              </td>
              <td class="py-3 pr-4">
                <span class="font-sans text-sm text-brand-primary font-medium">{{ promo.discountPercent }}%</span>
              </td>
              <td class="py-3 pr-4">
                <span class="font-sans text-sm text-brand-olive">
                  {{ promo.currentUses || 0 }}{{ promo.maxUses > 0 ? ` / ${promo.maxUses}` : '' }}
                </span>
              </td>
              <td class="py-3 pr-4">
                <span class="font-sans text-sm text-brand-olive/70">
                  {{ promo.expiresAt ? formatDate(promo.expiresAt) : 'Sin vencimiento' }}
                </span>
                <span v-if="isExpired(promo.expiresAt)" class="block font-sans text-xs text-red-500">Expirado</span>
              </td>
              <td class="py-3 pr-4">
                <AdminStatusBadge :status="promo.isActive" type="active" />
              </td>
              <td class="py-3 pr-4">
                <button
                  v-if="hasEmailTemplate(promo.code)"
                  @click="openEmailPreview(promo)"
                  class="px-3 py-1 font-sans text-xs text-brand-olive border border-brand-olive/20 hover:border-brand-olive/40 transition-colors"
                >
                  Ver email
                </button>
                <span v-else class="font-sans text-xs text-brand-olive/30">—</span>
              </td>
              <td class="py-3 text-right">
                <div class="flex items-center justify-end gap-2">
                  <NuxtLink
                    :to="`/promocodes/${promo.id}`"
                    class="px-3 py-1 font-sans text-xs text-brand-primary border border-brand-primary/30 hover:bg-brand-primary hover:text-brand-cream transition-colors"
                  >
                    Editar
                  </NuxtLink>
                  <button
                    @click="confirmDelete(promo)"
                    class="px-3 py-1 font-sans text-xs text-red-700 border border-red-300 hover:bg-red-700 hover:text-white transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <AdminConfirmModal
        :visible="showDeleteModal"
        title="Eliminar codigo promocional"
        :message="deleteMessage"
        @confirm="deletePromo"
        @cancel="showDeleteModal = false"
      />

      <!-- Email Preview Modal -->
      <div
        v-if="showEmailModal"
        class="fixed inset-0 z-50 flex items-start justify-center pt-10 px-4"
        @click.self="showEmailModal = false"
      >
        <div class="fixed inset-0 bg-black/50" @click="showEmailModal = false" />
        <div class="relative bg-brand-cream border-2 border-brand-olive/20 w-full max-w-[680px] max-h-[90vh] flex flex-col">
          <!-- Modal header -->
          <div class="flex items-center justify-between px-6 py-4 border-b-2 border-brand-olive/10">
            <h3 class="font-sans text-brand-olive text-lg font-semibold">Email de bienvenida</h3>
            <div class="flex items-center gap-3">
              <button
                type="button"
                class="px-5 py-2 bg-brand-primary text-brand-cream font-sans text-sm font-medium hover:bg-brand-primary/90 transition-colors"
                @click="copyEmailToClipboard"
              >
                {{ emailCopied ? 'Copiado' : 'Copiar al portapapeles' }}
              </button>
              <span v-if="emailCopied" class="font-sans text-xs text-green-700">Listo para pegar en Gmail</span>
              <button
                type="button"
                class="px-3 py-2 font-sans text-xs text-brand-olive/50 hover:text-brand-olive transition-colors"
                @click="showEmailModal = false"
              >
                Cerrar
              </button>
            </div>
          </div>
          <!-- Modal body -->
          <div class="overflow-auto p-4 bg-white">
            <div ref="emailContainer" v-html="emailHtml" />
          </div>
        </div>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup>
const { get, delete: apiDelete } = useApi()

const promoCodes = ref([])
const loading = ref(true)
const showDeleteModal = ref(false)
const promoToDelete = ref(null)
const showEmailModal = ref(false)
const emailCopied = ref(false)
const emailContainer = ref(null)
const selectedPromo = ref(null)

const deleteMessage = computed(() => {
  if (!promoToDelete.value) return ''
  return `Se eliminara el codigo '${promoToDelete.value.code}'. Esta accion no se puede deshacer.`
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
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
}

function isExpired(expiresAt) {
  if (!expiresAt) return false
  return toTimestamp(expiresAt) < Date.now()
}

async function loadPromoCodes() {
  loading.value = true
  try {
    promoCodes.value = await get('/api/promocodes')
  } catch (error) {
    console.error('Error loading promo codes:', error)
  } finally {
    loading.value = false
  }
}

function confirmDelete(promo) {
  promoToDelete.value = promo
  showDeleteModal.value = true
}

async function deletePromo() {
  if (!promoToDelete.value) return

  try {
    await apiDelete(`/api/promocodes/${promoToDelete.value.id}`)
    await loadPromoCodes()
  } catch (error) {
    console.error('Error deleting promo code:', error)
    alert(error.message || 'Error al eliminar el codigo')
  } finally {
    showDeleteModal.value = false
    promoToDelete.value = null
  }
}

const CODES_WITH_EMAIL = ['ELCOMIENZO']

function hasEmailTemplate(code) {
  return CODES_WITH_EMAIL.includes((code || '').toUpperCase())
}

function openEmailPreview(promo) {
  selectedPromo.value = promo
  emailCopied.value = false
  showEmailModal.value = true
}

const emailHtml = computed(() => {
  if (!selectedPromo.value) return ''
  const code = selectedPromo.value.code || 'CODIGO'
  const discount = selectedPromo.value.discountPercent || 0
  return `<div style="background:#FEFCF0;background-color:#FEFCF0;" bgcolor="#FEFCF0">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#FEFCF0" style="margin:0;padding:0;background:#FEFCF0;background-color:#FEFCF0;">
  <tr>
    <td align="center" bgcolor="#FEFCF0" style="padding:0;background:#FEFCF0;background-color:#FEFCF0;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" bgcolor="#FEFCF0" style="max-width:600px;width:100%;margin:0 auto;background:#FEFCF0;background-color:#FEFCF0;">
        <tr>
          <td bgcolor="#FEFCF0" align="center" style="background:#FEFCF0;background-color:#FEFCF0;padding:32px 0 24px 0;text-align:center;">
            <a href="https://elgranpeon.com" target="_blank" style="display:inline-block;text-decoration:none;"><img src="https://res.cloudinary.com/dmb1vyveg/image/upload/v1771963287/el-gran-peon/customer-logos/wjecybujavkox0vu2i8d.png" alt="El Gran Peón" width="160" style="display:block;width:160px;height:auto;border:0;" /></a>
          </td>
        </tr>
        <tr>
          <td bgcolor="#FEFCF0" style="background:#FEFCF0;background-color:#FEFCF0;padding:16px 40px 24px 40px;">
            <p style="margin:0 0 20px 0;font-family:Georgia,serif;font-size:17px;line-height:1.6;color:#4C4A38;">
              <font color="#4C4A38">Te suscribiste para recibir el beneficio de lanzamiento.</font>
            </p>
            <p style="margin:0;font-family:Georgia,serif;font-size:17px;line-height:1.6;color:#4C4A38;">
              <font color="#4C4A38">La web de El Gran Peón ya está online y la Cápsula Raíz ya está disponible.</font>
            </p>
          </td>
        </tr>
        <tr>
          <td bgcolor="#FEFCF0" style="padding:0 40px 28px 40px;background:#FEFCF0;background-color:#FEFCF0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#FEFCF0" style="border:2px solid #4C4A38;background:#FEFCF0;background-color:#FEFCF0;">
              <tr>
                <td bgcolor="#FEFCF0" style="padding:28px 32px;text-align:center;background:#FEFCF0;background-color:#FEFCF0;">
                  <p style="margin:0 0 16px 0;font-family:Georgia,serif;font-size:16px;line-height:1.5;color:#4C4A38;">
                    <font color="#4C4A38">Copiá este código y aplicalo en tu compra:</font>
                  </p>
                  <p style="margin:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:28px;font-weight:bold;letter-spacing:3px;color:#4C4A38;">
                    <font color="#4C4A38">${code}</font>
                  </p>
                  <p style="margin:0;font-family:Georgia,serif;font-size:16px;line-height:1.5;color:#4C4A38;">
                    <font color="#4C4A38">${discount}% de descuento de bienvenida.</font>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td bgcolor="#FEFCF0" style="background:#FEFCF0;background-color:#FEFCF0;padding:0 40px 24px 40px;">
            <p style="margin:0 0 20px 0;font-family:Georgia,serif;font-size:17px;line-height:1.6;color:#4C4A38;">
              <font color="#4C4A38">Este beneficio fue creado únicamente para quienes se registraron antes del lanzamiento. No es público y tiene tiempo limitado.</font>
            </p>
            <p style="margin:0 0 28px 0;font-family:Georgia,serif;font-size:17px;line-height:1.6;color:#4C4A38;font-style:italic;">
              <font color="#4C4A38"><em>Si estabas esperando la señal, es esta.</em></font>
            </p>
          </td>
        </tr>
        <tr>
          <td align="center" bgcolor="#FEFCF0" style="background:#FEFCF0;background-color:#FEFCF0;padding:0 40px 28px 40px;">
            <table role="presentation" cellpadding="0" cellspacing="0" bgcolor="#FEFCF0" style="background:#FEFCF0;">
              <tr>
                <td bgcolor="#FEFCF0" style="background:#FEFCF0;background-color:#FEFCF0;padding:14px 40px;text-align:center;border:2px solid #4C4A38;">
                  <a href="https://elgranpeon.com" target="_blank" style="color:#4C4A38;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;letter-spacing:1.5px;text-decoration:none;text-transform:uppercase;"><font color="#4C4A38">ENTRAR AHORA</font></a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td bgcolor="#FEFCF0" style="background:#FEFCF0;background-color:#FEFCF0;padding:0 40px 24px 40px;">
            <p style="margin:0;font-family:Georgia,serif;font-size:17px;line-height:1.6;color:#4C4A38;">
              <font color="#4C4A38">Gracias por estar desde el inicio.</font>
            </p>
          </td>
        </tr>
        <tr>
          <td bgcolor="#FEFCF0" style="background:#FEFCF0;background-color:#FEFCF0;padding:8px 40px 32px 40px;text-align:center;">
            <p style="margin:0 0 2px 0;font-family:Georgia,serif;font-size:12px;color:#4C4A38;letter-spacing:1px;">
              <font color="#4C4A38">Hecho para durar. Como las cosas bien hechas.</font>
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</div>`
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

onMounted(loadPromoCodes)
</script>
