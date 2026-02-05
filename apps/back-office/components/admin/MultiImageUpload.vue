<template>
  <div>
    <!-- Image grid -->
    <div v-if="modelValue.length > 0" class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
      <div
        v-for="(img, index) in modelValue"
        :key="img.publicId || index"
        class="relative group border-2 border-brand-olive/10"
      >
        <img
          :src="img.url"
          :alt="`Imagen ${index + 1}`"
          class="w-full aspect-square object-cover"
          @error="e => { e.target.src = '/images/icon.png'; e.target.classList.remove('object-cover'); e.target.classList.add('object-contain', 'p-6', 'opacity-20') }"
        />

        <!-- Principal badge -->
        <span
          v-if="index === 0"
          class="absolute top-0 left-0 bg-brand-primary text-brand-cream font-sans text-[10px] uppercase tracking-wide px-2 py-0.5"
        >
          Principal
        </span>

        <!-- Controls overlay -->
        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end justify-center gap-1 pb-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            v-if="index > 0"
            type="button"
            @click="moveImage(index, index - 1)"
            class="px-2 py-1 bg-white text-brand-olive font-sans text-xs border border-brand-olive/20 hover:bg-brand-cream transition-colors"
          >
            &larr;
          </button>
          <button
            v-if="index < modelValue.length - 1"
            type="button"
            @click="moveImage(index, index + 1)"
            class="px-2 py-1 bg-white text-brand-olive font-sans text-xs border border-brand-olive/20 hover:bg-brand-cream transition-colors"
          >
            &rarr;
          </button>
          <button
            type="button"
            @click="removeImage(index)"
            class="px-2 py-1 bg-red-700 text-white font-sans text-xs hover:bg-red-800 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <!-- Upload area -->
    <div
      v-if="modelValue.length < maxImages"
      @click="triggerFileInput"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      class="border-2 border-dashed p-6 text-center cursor-pointer transition-colors"
      :class="isDragging ? 'border-brand-primary bg-brand-primary/5' : 'border-brand-olive/20 hover:border-brand-olive/40'"
    >
      <p v-if="uploading" class="font-sans text-sm text-brand-olive">
        Subiendo... {{ uploadProgress }}%
      </p>
      <template v-else>
        <p class="font-sans text-sm text-brand-olive/60">
          Click o arrastra imagenes aqui
        </p>
        <p class="font-sans text-xs text-brand-olive/40 mt-1">
          JPG, PNG o WebP — {{ modelValue.length }}/{{ maxImages }} imagenes
        </p>
      </template>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/png,image/webp"
      multiple
      class="hidden"
      @change="handleFileSelect"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  maxImages: { type: Number, default: 6 },
  uploadEndpoint: { type: String, default: '/api/upload/product-image' },
  folder: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

const { upload } = useApi()
const fileInput = ref(null)
const isDragging = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)

function triggerFileInput() {
  if (!uploading.value) fileInput.value?.click()
}

function handleFileSelect(event) {
  const files = Array.from(event.target.files || [])
  if (files.length > 0) uploadFiles(files)
  if (fileInput.value) fileInput.value.value = ''
}

function handleDrop(event) {
  isDragging.value = false
  const files = Array.from(event.dataTransfer.files || []).filter(f =>
    ['image/jpeg', 'image/png', 'image/webp'].includes(f.type)
  )
  if (files.length > 0) uploadFiles(files)
}

async function uploadFiles(files) {
  const remaining = props.maxImages - props.modelValue.length
  const toUpload = files.slice(0, remaining)

  uploading.value = true
  uploadProgress.value = 0

  const uploaded = []
  for (let i = 0; i < toUpload.length; i++) {
    try {
      const formData = new FormData()
      if (props.folder) formData.append('folder', props.folder)
      formData.append('image', toUpload[i])

      const data = await upload(props.uploadEndpoint, formData)
      uploaded.push({
        url: data.url,
        publicId: data.publicId,
        order: props.modelValue.length + uploaded.length,
      })

      uploadProgress.value = Math.round(((i + 1) / toUpload.length) * 100)
    } catch (error) {
      console.error('Error uploading image:', error)
      alert(error.message || 'Error al subir imagen')
    }
  }

  if (uploaded.length > 0) {
    emit('update:modelValue', [...props.modelValue, ...uploaded])
  }

  uploading.value = false
  uploadProgress.value = 0
}

function moveImage(fromIndex, toIndex) {
  const images = [...props.modelValue]
  const [moved] = images.splice(fromIndex, 1)
  images.splice(toIndex, 0, moved)
  const reordered = images.map((img, i) => ({ ...img, order: i }))
  emit('update:modelValue', reordered)
}

async function removeImage(index) {
  const img = props.modelValue[index]
  if (img.publicId) {
    try {
      const config = useRuntimeConfig()
      await fetch(`${config.public.apiBase}${props.uploadEndpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.public.apiKey,
        },
        body: JSON.stringify({ publicId: img.publicId }),
      })
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error)
    }
  }
  const images = props.modelValue.filter((_, i) => i !== index)
  const reordered = images.map((img, i) => ({ ...img, order: i }))
  emit('update:modelValue', reordered)
}
</script>
