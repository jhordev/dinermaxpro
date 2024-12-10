<script setup>
defineProps({
  to: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
});
</script>

<template>
    <router-link :to="to" class="py-[10px] px-[15px] text-[14px] md:text-[18px] font-bold  md:py-3 md:px-6 border border-colorBlue bg-white dark:bg-black rounded-full  hover:shadow-custom-inset-black text-center  text-colorTextBlack hover:text-colorTextBlack  dark:text-white transition-all duration-300 ease-in-out">
        {{label}}
    </router-link>
</template>

<style scoped>

</style>