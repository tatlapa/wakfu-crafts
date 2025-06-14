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
import { useItemsStore } from "~/stores/items";
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const itemsStore = useItemsStore();
const searchQuery = ref(""); // Gère la recherche
const selectedRarities = ref<number[]>([]); // Pour stocker les raretés sélectionnées
const levelRange = ref<[number, number]>([0, 245]); // Plage initiale de niveaux
const hideDroppable = ref(false);
const droppableItemsSet = ref<Set<number>>(new Set());
const selectedItemTypes = ref<number[]>([]); // Pour stocker les types d'items sélectionnés

const toggleRarity = (rarity: number) => {
  if (selectedRarities.value.includes(rarity)) {
    selectedRarities.value = selectedRarities.value.filter((r) => r !== rarity);
  } else {
    selectedRarities.value.push(rarity);
  }
};

// Fonction pour basculer la sélection d'un type d'item
const toggleItemType = (typeId: number) => {
  if (selectedItemTypes.value.includes(typeId)) {
    selectedItemTypes.value = selectedItemTypes.value.filter(
      (id) => id !== typeId
    );
  } else {
    selectedItemTypes.value.push(typeId);
  }
};

const isItemDroppable = (item: any) => {
  return droppableItemsSet.value.has(item.definition.item.id);
};

const rarityArray = computed(() => [
  { label: t('common.filter.rarities.common'), icon: iconCommon, rarity: 1 },
  { label: t('common.filter.rarities.rare'), icon: iconRare, rarity: 2 },
  { label: t('common.filter.rarities.mythic'), icon: iconMythical, rarity: 3 },
  { label: t('common.filter.rarities.legendary'), icon: iconLegendary, rarity: 4 },
  { label: t('common.filter.rarities.relic'), icon: iconRelic, rarity: 5 },
  { label: t('common.filter.rarities.memory'), icon: iconMemory, rarity: 6 },
  { label: t('common.filter.rarities.epic'), icon: iconEpic, rarity: 7 },
]);


const extractIdFromUrl = (url: string): number | null => {
  if (!url) return null; // Vérifier que l'URL existe

  const match = url.match(/\/(\d+)-/); // Trouve un nombre suivi d'un '-'
  return match ? Number(match[1]) : null;
};

onMounted(async () => {
  await itemsStore.loadAllCSVs();

  // Stocke les ID des objets droppables
  const droppableIds = new Set<number>();

  const dataSources = [
    itemsStore.armures,
    itemsStore.armes,
    itemsStore.accessoires,
    itemsStore.consommables,
    itemsStore.ressources,
    itemsStore.familiers,
  ];

  dataSources.forEach((dataSource) => {
    dataSource.forEach((data) => {
      // Vérifie que l'objet est droppable et possède un lien
      if (data["Peut être obtenu sur"] === "Oui" && data["Lien"]) {
        const itemId = extractIdFromUrl(data["Lien"]); // Extraire l'ID depuis le lien
        if (itemId !== null) {
          droppableIds.add(itemId);
        } else {
          console.warn("❌ Impossible d'extraire l'ID pour :", data);
        }
      }
    });
  });

  droppableItemsSet.value = droppableIds;
});

const filteredItems = computed(() => {
  let items = itemsStore.items;
  // Filtre par recherche
  if (searchQuery.value) {
    items = items.filter((item) => {
      const title =
        item?.title?.[itemsStore.userLang as keyof typeof item.title] ??
        item?.title?.fr ??
        ""; // fallback vide si rien

      return title.toLowerCase().includes(searchQuery.value.toLowerCase());
    });
  }

  // Filtre par rareté
  if (selectedRarities.value.length > 0) {
    items = items.filter((item) =>
      selectedRarities.value.includes(
        item.definition.item.baseParameters.rarity
      )
    );
  }

  // Filtre par type d'item
  if (selectedItemTypes.value.length > 0) {
    items = items.filter((item) =>
      selectedItemTypes.value.includes(
        item.definition.item.baseParameters.itemTypeId
      )
    );
  }

  // Filtre pour cacher les objets droppables (si activé)
  if (hideDroppable.value) {
    items = items.filter((item) => !isItemDroppable(item));
  }

  // Filtre par plage de niveaux
  items = items.filter(
    (item) =>
      item.definition.item.level >= levelRange.value[0] &&
      item.definition.item.level <= levelRange.value[1]
  );

  // Tri par niveau décroissant
  items.sort((a, b) => b.definition.item.level - a.definition.item.level);

  return items;
});

const allItemTypes = computed(() => {
  const combinedItems = [...itemsStore.itemTypes, ...itemsStore.equipmentTypes];

  // 1. Récupérer tous les itemTypeId utilisés par les items
  const usedTypeIds = new Set(
    itemsStore.items.map(
      (item) => item.definition.item.baseParameters.itemTypeId
    )
  );

  // 2. Ne garder que les types d'objets utilisés
  const filtered = combinedItems.filter((item) =>
    usedTypeIds.has(item.definition.id)
  );

  // 3. Supprimer les doublons par titre français
  const uniqueItemsMap = new Map();
  filtered.forEach((item) => {
    if (item.title?.fr) {
      uniqueItemsMap.set(
        item.title.fr.replace(/\{\[~1\]\?s:\}|\{\[~1\]\?x:\}/g, ""),
        item
      );
    }
  });

  return Array.from(uniqueItemsMap.values());
});

// Exposer `filteredItems` globalement pour qu'il soit accessible dans la page
useNuxtApp().provide("filteredItems", filteredItems);
</script>

<template>
  <aside class="w-1/3 mt-[87px]">
    <Card class="bg-muted-foreground/[0.03] px-4">
      <CardHeader class="my-4">
        <CardTitle>{{ $t('common.filter.title') }}</CardTitle></CardHeader>

      <!-- Barre de recherche -->
      <CardContent class="my-4 space-y-3">
        <div class="relative w-full">
          <Search
            class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
          />
          <input
            v-model="searchQuery"
            class="w-full pl-10 p-2 border rounded-lg"
            :placeholder="$t('common.filter.search')"
          />
        </div>
      </CardContent>

      <!-- CheckBox Hide Droppable -->
      <CardContent class="flex items-center gap-2">
        <Checkbox
          id="hideDroppable"
          v-model:checked="hideDroppable"
          class="w-5 h-5"
        />
        <label for="hideDroppable" class="text-sm cursor-pointer">
          {{ $t('common.filter.hideDroppable') }}
        </label>
      </CardContent>

      <!-- Filtre par rareté avec Toggle -->
      <CardHeader class="my-4"><CardTitle>{{ $t('common.filter.rarity') }}</CardTitle></CardHeader>
      <CardContent class="flex gap-2">
        <TooltipProvider>
          <Tooltip v-for="rarity in rarityArray" :key="rarity.rarity">
            <TooltipTrigger as-child>
              <Toggle
                :pressed="selectedRarities.includes(rarity.rarity)"
                @click="toggleRarity(rarity.rarity)"
                class="flex items-center justify-center p-2 rounded-lg transition-all duration-300 border-2 hover:scale-105 hover:ring-2 hover:ring-blue-300"
                :class="{
                  'bg-blue-500 border-blue-700 text-white shadow-md':
                    selectedRarities.includes(rarity.rarity),
                  'bg-gray-100 border-gray-300 text-gray-500 hover:bg-gray-200':
                    !selectedRarities.includes(rarity.rarity),
                }"
              >
                <img
                  :src="rarity.icon"
                  alt="Rarity Icon"
                  class="transition-opacity duration-300"
                  :class="{
                    'opacity-100': selectedRarities.includes(rarity.rarity),
                    'opacity-60': !selectedRarities.includes(rarity.rarity),
                  }"
                />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              <p>{{ rarity.label }}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardContent>

      <CardHeader class="flex-row iems-center my-4 gap-4">
        <CardTitle>
          {{ $t('common.filter.level') }}
        </CardTitle> 
          <p class="text-lg font-bold">( {{ levelRange[0] }} - {{ levelRange[1] }} )  </p>
      </CardHeader>
      <Slider
          v-model="levelRange"
          :min="0"
          :max="245"
          :step="1"
          :range="true"
        />

      <!-- Liste des types d'objets avec filtrage actif -->
      <CardHeader class="my-4"><CardTitle>{{ $t('common.filter.itemTypes') }}</CardTitle></CardHeader>
      <CardContent class="grid grid-cols-2 gap-4 my-2">
        <div
          v-for="itemType in allItemTypes"
          :key="itemType.definition.id"
          class="flex gap-2 items-center"
        >
          <Checkbox
            :checked="selectedItemTypes.includes(itemType.definition.id)"
            @update:checked="toggleItemType(itemType.definition.id)"
          />
          <label class="cursor-pointer">
            {{
              (
                itemType.title?.[
                  itemsStore.userLang as keyof typeof itemType.title as
                    | "en"
                    | "es"
                    | "fr"
                    | "pt"
                ] || "Nom du type non disponible"
              ).replace(/\{\[~1\]\?s:\}|\{\[~1\]\?x:\}/g, "")
            }}
          </label>
        </div>
      </CardContent>
    </Card>
  </aside>
</template>
