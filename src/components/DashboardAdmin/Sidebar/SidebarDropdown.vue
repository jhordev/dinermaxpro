<script setup>
import { useSidebarStore } from '@/stores/sidebar'
import { ref } from 'vue'

const sidebarStore = useSidebarStore()

const props = defineProps({
  items: Array,
  page: String
})

const items = ref(props.items)

const handleItemClick = (index) => {
  const pageName =
      sidebarStore.selected === props.items[index].label ? '' : props.items[index].label
  sidebarStore.selected = pageName
}
</script>

<template>
  <ul class="mt-4 mb-5.5 flex flex-col gap-2.5 pl-6">
    <template v-for="(childItem, index) in items" :key="index">
      <li>
        <router-link
            :to="childItem.route"
            @click="handleItemClick(index)"
            class=" group relative flex items-center gap-5 rounded-sm py-2 px-4 font-medium text-colorTextBlack dark:text-white duration-300 ease-in-out hover:bg-bghoverligth dark:hover:bg-colorTextBlack"
            :class="{
            '!text-colorBgButton': childItem.label === sidebarStore.selected
          }"
        >
          {{ childItem.label }}
        </router-link>
      </li>
    </template>
  </ul>
</template>
