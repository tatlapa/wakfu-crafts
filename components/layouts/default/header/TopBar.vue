<script setup lang="ts">
import { useItemsStore } from "~/stores/items";

const itemsStore = useItemsStore();

onMounted(() => {
  itemsStore.getUserLang();
});

const setLanguage = (lang: string) => {
  itemsStore.userLang = lang;
  localStorage.setItem("lang", lang);
  console.log("Langue modifiée :", lang);
};
</script>

<template>
  <div class="flex justify-between w-full p-2 bg-black text-black">
    <h1>Wakfu Crafter</h1>
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
