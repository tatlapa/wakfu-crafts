<script setup lang="ts">
import { ref } from "vue";
import { Search } from "lucide-vue-next";
import { Toggle } from "@/components/ui/toggle"; // Import du Toggle de shadcn-vue
import iconCommon from "~/assets/icons/rarity/common.png";
import iconRare from "~/assets/icons/rarity/rare.png";
import iconMythical from "~/assets/icons/rarity/mythic.png";
import iconLegendary from "~/assets/icons/rarity/legendary.png";
import iconEpic from "~/assets/icons/rarity/epic.png";
import iconMemory from "~/assets/icons/rarity/memory.png";
import iconRelic from "~/assets/icons/rarity/relic.png";
import CardContent from "~/components/ui/card/CardContent.vue";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const searchQuery = ref(""); // Gère la recherche
const selectedRarities = ref<number[]>([]);
const toggleRarity = (rarity: number) => {
  if (selectedRarities.value.includes(rarity)) {
    selectedRarities.value = selectedRarities.value.filter((r) => r !== rarity);
  } else {
    selectedRarities.value.push(rarity);
  }
};

const rarityArray = [
  { label: "Commun", icon: iconCommon, rarity: 1 },
  { label: "Rare", icon: iconRare, rarity: 2 },
  { label: "Mythique", icon: iconMythical, rarity: 3 },
  { label: "Légendaire", icon: iconLegendary, rarity: 4 },
  { label: "Relique", icon: iconRelic, rarity: 5 },
  { label: "Souvenir", icon: iconMemory, rarity: 6 },
  { label: "Épique", icon: iconEpic, rarity: 7 },
];
</script>

<template>
  <aside class="w-full">
    <Card class="bg-muted-foreground/[0.03]">
      <CardHeader class="p-4">Filtrer la liste</CardHeader>

      <!-- Barre de recherche -->
      <CardContent class="p-4 space-y-3">
        <div class="relative w-full">
          <Search
            class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
          />
          <input
            v-model="searchQuery"
            class="w-full pl-10 p-2 border rounded-lg"
            placeholder="Rechercher un item..."
          />
        </div>
      </CardContent>

      <!-- Filtre par rareté avec Toggle -->
      <CardContent class="flex p-4 gap-2">
        <TooltipProvider>
          <Tooltip v-for="rarity in rarityArray" :key="rarity.rarity">
            <TooltipTrigger as-child>
              <Toggle
                :pressed="selectedRarities.includes(rarity.rarity)"
                @click="toggleRarity(rarity.rarity)"
                class="flex items-center justify-center p-2 rounded-lg transition-all duration-300 border-2 
                hover:scale-105 hover:ring-2 hover:ring-blue-300
                "
                :class="{
                  'bg-blue-500 border-blue-700 text-white shadow-md': selectedRarities.includes(rarity.rarity),
                  'bg-gray-100 border-gray-300 text-gray-500 hover:bg-gray-200': !selectedRarities.includes(rarity.rarity),
                }"
              >
                <img
                  :src="rarity.icon"
                  alt="Rarity Icon"
                  class="transition-opacity duration-300"
                  :class="{ 'opacity-100': selectedRarities.includes(rarity.rarity), 'opacity-60': !selectedRarities.includes(rarity.rarity) }"
                />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              <p>{{ rarity.label }}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardContent>
    </Card>

    <!-- Passage de searchQuery au slot -->
    <slot :searchQuery="searchQuery" />
  </aside>
</template>
