<script setup lang="ts">
import { useItemsStore } from "~/stores/items";
import 'flag-icons/css/flag-icons.min.css';
import { useI18n } from 'vue-i18n';

const itemsStore = useItemsStore();
const { locales, setLocale } = useI18n();

onMounted(() => {
  itemsStore.getUserLang();
});

const switchLanguage = (lang: string) => {
  if (lang === 'fr' || lang === 'en' || lang === 'es' || lang === 'pt') {
    setLocale(lang);
    itemsStore.userLang = lang;
    localStorage.setItem("lang", lang);
  }
};
</script>

<template>
  <header class="flex justify-between w-full items-center px-8 py-3 bg-gradient-to-r from-gray-900 to-black shadow-md">
    <h1 class="text-white text-2xl">{{ $t('common.title') }}</h1>
    <div class="w-32">
      <Select v-model="itemsStore.userLang" @update:modelValue="switchLanguage">
        <SelectTrigger>
          <SelectValue/>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem v-for="locale in locales" :key="locale.code" :value="locale.code">
              <span :class="['fi', `fi-${locale.code === 'en' ? 'gb' : locale.code}`, 'mr-2']"></span>
              {{ locale.name }}
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  </header>
</template>
