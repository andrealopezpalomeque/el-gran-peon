<template>
  <div>
    <!-- Current image preview -->
    <div v-if="modelValue" class="mb-4">
      <div class="relative inline-block">
        <img
          :src="modelValue"
          alt="Imagen actual"
          class="w-40 h-40 object-cover border-2 border-brand-olive/10"
        />
        <button
          @click="removeImage"
          type="button"
          class="absolute -top-2 -right-2 w-6 h-6 bg-red-700 text-white text-xs flex items-center justify-center hover:bg-red-800 transition-colors"
        >
          x
        </button>
      </div>
    </div>

    <!-- Upload area -->
    <div
      v-if="!modelValue"
      @click="triggerFileInput"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      class="border-2 border-dashed p-8 text-center cursor-pointer transition-colors"
      :class="isDragging ? 'border-brand-primary bg-brand-primary/5' : 'border-brand-olive/20 hover:border-brand-olive/40'"
    >
      <p class="font-sans text-brand-olive/60 text-sm">
        {{ uploading ? `Subiendo... ${progress}%` : 'Click o arrastra una imagen' }}
      </p>
      <p class="font-sans text-brand-olive/40 text-xs mt-1">JPG, PNG o WebP</p>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/png,image/webp"
      class="hidden"
      @change="handleFileSelect"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: String, default: '' },
  endpoint: { type: String, required: true },
  folder: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

const { upload } = useApi()
const fileInput = ref(null)
const isDragging = ref(false)
const uploading = ref(false)
const progress = ref(0)

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileSelect(event) {
  const file = event.target.files?.[0]
  if (file) uploadFile(file)
}

function handleDrop(event) {
  isDragging.value = false
  const file = event.dataTransfer.files?.[0]
  if (file) uploadFile(file)
}

async function uploadFile(file) {
  uploading.value = true
  progress.value = 0

  try {
    const formData = new FormData()
    formData.append('image', file)
    if (props.folder) {
      formData.append('folder', props.folder)
    }

    // Simulate progress
    const progressInterval = setInterval(() => {
      if (progress.value < 90) progress.value += 10
    }, 200)

    const data = await upload(props.endpoint, formData)

    clearInterval(progressInterval)
    progress.value = 100

    emit('update:modelValue', data.url)
  } catch (error) {
    console.error('Error uploading image:', error)
    alert(error.message || 'Error al subir la imagen')
  } finally {
    uploading.value = false
    progress.value = 0
    if (fileInput.value) fileInput.value.value = ''
  }
}

function removeImage() {
  emit('update:modelValue', '')
}
</script>
