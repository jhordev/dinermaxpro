<script setup>
import { CircleCheck, Loader2 } from "lucide-vue-next";

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
  isActive: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  onChoosePlan: {
    type: Function,
    required: true,
  },
});

const handleButtonClick = () => {
  if (!props.disabled && !props.isLoading && !props.isActive) {
    props.onChoosePlan();
  }
};
</script>

<template>
  <article
      :class="[
      'flex flex-col dark:bg-black border-[8px] rounded-[32px] py-8 px-6',
      {
        'bg-colorBgPopular dark:bg-colorBgPopular': isMostPopular,
        'border-green-500': isActive,
        'border-colorPurpleCard': !isActive,
        'opacity-50': disabled && !isActive,
      },
    ]"
  >
    <header class="relative">
      <div v-if="isActive" class="absolute -top-6 -right-4 py-1 px-3 bg-green-500 text-white rounded-full text-sm">
        Plan Activo
      </div>
      <span :class="[
        'font-bold text-colorTextBlack dark:text-white text-[16px]',
        {'text-white dark:text-white': isMostPopular },
      ]">
        {{ planName }}
      </span>
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
      <div
          v-if="isMostPopular"
          class="absolute top-0 right-0 py-1 px-2 rounded-[8px] text-[#181059] font-semibold bg-white"
      >
        Más Popular
      </div>
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
    <button
        @click="handleButtonClick"
        :disabled="disabled || isLoading || isActive"
        :class="[
        'rounded-[8px] mt-7 w-full text-center py-3 text-[16px] font-semibold transition-all duration-200',
        {
          'bg-colorBgButton text-white hover:bg-opacity-90': !disabled && !isActive,
          'bg-gray-400 text-gray-200 cursor-not-allowed': disabled && !isActive,
          'bg-green-500 text-white cursor-default': isActive,
        }
      ]"
    >
      <Loader2 v-if="isLoading" class="inline-block w-5 h-5 mr-2 animate-spin" />
      <span>{{ isActive ? 'Plan Actual' : 'Elegir plan' }}</span>
    </button>
  </article>
</template>

<style scoped></style>
