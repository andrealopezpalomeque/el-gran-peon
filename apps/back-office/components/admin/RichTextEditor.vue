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
})

const emit = defineEmits(['update:modelValue'])

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({
      heading: false,
      bulletList: false,
      orderedList: false,
      listItem: false,
      blockquote: false,
      codeBlock: false,
      code: false,
      horizontalRule: false,
    }),
  ],
  editorProps: {
    attributes: {
      class: 'px-4 py-2 min-h-[120px] outline-none',
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
.rich-editor .tiptap {
  min-height: 120px;
}
.rich-editor .tiptap p {
  margin-bottom: 0.5em;
}
.rich-editor .tiptap p:last-child {
  margin-bottom: 0;
}
</style>
