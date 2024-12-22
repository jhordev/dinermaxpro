<script setup>
import { CircleCheck, Trash2, FilePenLine } from "lucide-vue-next";

const props = defineProps({
  planName: {
    type: String,
    required: true,
  },
  priceRange: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  features: {
    type: Array,
    required: true,
  },
  isMostPopular: {
    type: Boolean,
    default: false,
  },
  onChoosePlan: {
    type: Function,
    required: true,
  },
});

const handleButtonClick = () => {
  props.onChoosePlan();
};
</script>

<template>
  <article
      :class="[
      'flex flex-col dark:bg-black border-[8px] border-colorPurpleCard rounded-[32px] py-8 px-6',
      { 'bg-colorBgPopular dark:bg-colorBgPopular': isMostPopular },
    ]"
  >
    <!--  CONTROL -->


    <header class="relative">

      <div class="absolute right-0 flex gap-2">
        <button   @click="handleButtonClick" :class="[
          'group  p-1 hover:bg-green-500 rounded-lg text-colorTextBlack dark:text-white',
          {'text-white dark:text-white': isMostPopular },
      ]"><FilePenLine class="text-current group-hover:text-white " /></button>
        <button :class="[
          'group p-1 hover:bg-red-500 rounded-lg text-colorTextBlack dark:text-white',
          {'text-white dark:text-white': isMostPopular },
      ]"><Trash2 class="text-current group-hover:text-white" /></button>
      </div>

      <span :class="[
          'font-bold text-colorTextBlack dark:text-white text-[16px]',
          {'text-white dark:text-white': isMostPopular },
      ]">
        {{ planName }}
      </span>

      <div
          v-if="isMostPopular"
          class=" w-fit mt-2 relative top-0 right-0 py-1 px-2 rounded-[8px] text-[#181059] font-semibold bg-white"
      >
        Más Popular
      </div>

      <h3 :class="[
        'font-black text-colorTextBlack dark:text-white text-[27px] mt-4',
        {'text-white dark:text-white': isMostPopular },
      ]">
        {{ priceRange }}
      </h3>
      <p :class="[
          'text-colorTextBlack dark:text-colorPurpleCard mt-2 text-[12px] font-bold',
          {'text-white dark:text-white': isMostPopular },
      ]">{{ duration }}</p>
    </header>
    <ul
        :class="[
            'mt-8 text-colorTextBlack dark:text-[#D2D7D9] text-[14px] leading-5 flex flex-col gap-3',
            {'text-white dark:text-white': isMostPopular },
        ]"
    >
      <li v-for="(feature, index) in features" :key="index" class="flex items-start gap-2">
        <div class="flex-shrink-0">
          <CircleCheck :class="[
              'w-5 text-colorBlue',
              {'text-colorBlue dark:text-white': isMostPopular },
          ]" />
        </div>
        <div>
          {{ feature }}
        </div>
      </li>
    </ul>
  </article>
</template>

<style scoped></style>
