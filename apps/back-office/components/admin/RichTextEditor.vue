<template>
  <div>
    <!-- Toolbar -->
    <div
      v-if="editor"
      class="flex items-center gap-1 px-2 py-1.5 border-2 border-b-0 border-brand-olive/20 bg-brand-olive/5"
    >
      <button
        type="button"
        class="w-8 h-8 flex items-center justify-center font-sans text-sm font-bold transition-colors"
        :class="editor.isActive('bold') ? 'text-brand-primary bg-brand-primary/10' : 'text-brand-olive/60 hover:text-brand-olive'"
        title="Negrita"
        @click="editor.chain().focus().toggleBold().run()"
      >
        B
      </button>
      <button
        type="button"
        class="w-8 h-8 flex items-center justify-center font-sans text-sm italic transition-colors"
        :class="editor.isActive('italic') ? 'text-brand-primary bg-brand-primary/10' : 'text-brand-olive/60 hover:text-brand-olive'"
        title="Cursiva"
        @click="editor.chain().focus().toggleItalic().run()"
      >
        I
      </button>

      <!-- Separator -->
      <div class="w-px h-5 bg-brand-olive/20 mx-1" />

      <!-- H2 -->
      <button
        type="button"
        class="px-2 h-8 flex items-center justify-center font-sans text-xs font-semibold transition-colors"
        :class="editor.isActive('heading', { level: 2 }) ? 'text-brand-primary bg-brand-primary/10' : 'text-brand-olive/60 hover:text-brand-olive'"
        title="Titulo H2"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
      >
        H2
      </button>

      <!-- H3 -->
      <button
        type="button"
        class="px-2 h-8 flex items-center justify-center font-sans text-xs font-semibold transition-colors"
        :class="editor.isActive('heading', { level: 3 }) ? 'text-brand-primary bg-brand-primary/10' : 'text-brand-olive/60 hover:text-brand-olive'"
        title="Titulo H3"
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
      >
        H3
      </button>

      <!-- Separator -->
      <div class="w-px h-5 bg-brand-olive/20 mx-1" />

      <!-- Bullet List -->
      <button
        type="button"
        class="px-2 h-8 flex items-center justify-center font-sans text-xs transition-colors"
        :class="editor.isActive('bulletList') ? 'text-brand-primary bg-brand-primary/10' : 'text-brand-olive/60 hover:text-brand-olive'"
        title="Lista con puntos"
        @click="editor.chain().focus().toggleBulletList().run()"
      >
        &bull; Lista
      </button>

      <!-- Ordered List -->
      <button
        type="button"
        class="px-2 h-8 flex items-center justify-center font-sans text-xs transition-colors"
        :class="editor.isActive('orderedList') ? 'text-brand-primary bg-brand-primary/10' : 'text-brand-olive/60 hover:text-brand-olive'"
        title="Lista numerada"
        @click="editor.chain().focus().toggleOrderedList().run()"
      >
        1. Lista
      </button>
    </div>

    <!-- Editor -->
    <EditorContent
      :editor="editor"
      class="rich-editor border-2 border-brand-olive/20 bg-white font-sans text-sm text-brand-olive focus-within:border-brand-primary transition-colors"
    />
  </div>
</template>

<script setup>
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'

const props = defineProps({
  modelValue: { type: String, default: '' },
  minHeight: { type: String, default: '120px' },
})

const emit = defineEmits(['update:modelValue'])

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({
      heading: { levels: [2, 3] },
      blockquote: false,
      codeBlock: false,
      code: false,
      horizontalRule: false,
    }),
  ],
  editorProps: {
    attributes: {
      class: 'px-4 py-2 outline-none',
      style: `min-height: ${props.minHeight}`,
    },
  },
  onUpdate({ editor }) {
    emit('update:modelValue', editor.getHTML())
  },
})

watch(() => props.modelValue, (val) => {
  if (!editor.value) return
  const currentHTML = editor.value.getHTML()
  if (val !== currentHTML) {
    editor.value.commands.setContent(val, false)
  }
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style>
.rich-editor .tiptap p {
  margin-bottom: 0.5em;
}
.rich-editor .tiptap p:last-child {
  margin-bottom: 0;
}
.rich-editor .tiptap h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #4C4A38;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}
.rich-editor .tiptap h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #4C4A38;
  margin-top: 1rem;
  margin-bottom: 0.25rem;
}
.rich-editor .tiptap ul {
  list-style-type: disc;
  padding-left: 1.5rem;
  margin-bottom: 0.75rem;
}
.rich-editor .tiptap ol {
  list-style-type: decimal;
  padding-left: 1.5rem;
  margin-bottom: 0.75rem;
}
.rich-editor .tiptap li {
  margin-bottom: 0.25rem;
}
</style>
