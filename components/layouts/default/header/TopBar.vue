<script setup lang="ts">
import { useItemsStore } from "~/stores/items";

const itemsStore = useItemsStore();

onMounted(() => {
  itemsStore.getUserLang();
});

const setLanguage = (lang: string) => {
  itemsStore.userLang = lang;
  localStorage.setItem("lang", lang);
};
</script>

<template>
  <div class="flex justify-between w-full items-center px-8 py-3 bg-black text-black">
    <h1 class="text-white">Wakfu Crafter</h1>
    <div class="w-32">
      <Select v-model="itemsStore.userLang" @update:modelValue="setLanguage">
        <SelectTrigger>
          <SelectValue placeholder="Choisir une langue" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="fr">🇫🇷 Français</SelectItem>
            <SelectItem value="en">🇬🇧 English</SelectItem>
            <SelectItem value="es">🇪🇸 Español</SelectItem>
            <SelectItem value="pt">🇵🇹 Português</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  </div>
</template>
