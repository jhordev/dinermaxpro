<script setup>
defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  placeholder: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  truncate: {
    type: Boolean,
    default: false
  }
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="flex flex-col gap-2.5">
    <label
        v-if="label"
        class="text-colorTextBlack dark:text-white font-semibold text-[14px] md:text-[16px]"
    >
      {{ label }}
    </label>
    <div class="flex items-center gap-2.5">
      <slot name="icon"></slot>
      <input
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value)"
          :type="type"
          :placeholder="placeholder"
          :disabled="disabled"
          :class="[
          'w-full pl-5 py-3 md:py-4 outline-none bg-transparent text-colorTextBlack dark:text-white border rounded-[6px] text-[16px] font-normal',
          disabled ? 'opacity-75 cursor-not-allowed' : '',
          truncate ? 'truncate' : ''
        ]"
      >
      <slot name="suffix"></slot>
    </div>
  </div>
</template>

<style scoped>

</style>