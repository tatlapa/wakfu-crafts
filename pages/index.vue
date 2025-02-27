<script setup lang="ts">
import { useItemsStore } from "~/stores/items";
import { ref, computed, onMounted } from "vue";
import { Search, ClipboardCopy, Check} from "lucide-vue-next";
import {
  Pagination,
  PaginationEllipsis,
  PaginationFirst,
  PaginationLast,
  PaginationList,
  PaginationListItem,
  PaginationNext,
  PaginationPrev,
} from "@/components/ui/pagination";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import iconCommon from "~/assets/icons/rarity/common.png";
import iconRare from "~/assets/icons/rarity/rare.png";
import iconMythical from "~/assets/icons/rarity/mythic.png";
import iconLegendary from "~/assets/icons/rarity/legendary.png";
import iconEpic from "~/assets/icons/rarity/epic.png";
import iconMemory from "~/assets/icons/rarity/memory.png";
import iconRelic from "~/assets/icons/rarity/relic.png";
import CardContent from "~/components/ui/card/CardContent.vue";

const itemsStore = useItemsStore();
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = 12;
const hideDroppable = ref(false);
const droppableItemsSet = ref<Set<number>>(new Set());
const levelRange = ref<[number, number]>([0, 245]); // Plage initiale de niveaux
const selectedItemTypes = ref<number[]>([]); // Pour stocker les types d'items sélectionnés

const rarityArray = [
  {
    label: "Commun",
    icon: iconCommon,
    rarity: 1,
  },
  { label: "Rare", icon: iconRare, rarity: 2 },
  {
    label: "Mythique",
    icon: iconMythical,
    rarity: 3,
  },
  {
    label: "Légendaire",
    icon: iconLegendary,
    rarity: 4,
  },
  { label: "Relique", icon: iconRelic, rarity: 5 },
  { label: "Souvenir", icon: iconMemory, rarity: 6 },
  { label: "Épique", icon: iconEpic, rarity: 7 },
];

onMounted(async () => {
  await itemsStore.getItems();
  await itemsStore.getItemTypes();
  await itemsStore.getEquipmentTypes();
  await itemsStore.getJobs();
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

// Fonction pour supprimer les accents d'une chaîne
const removeAccents = (str: string) => {
  return str
    .normalize("NFD") // Décompose les accents
    .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
    .toLowerCase(); // Convertit en minuscule pour éviter la sensibilité à la casse
};

const getItemImage = (item: any) => {
  // Toujours récupérer le titre en français
  const itemTitleFr = item.title["fr"];

  if (!itemTitleFr) {
    console.warn("⚠️ Aucun titre en français pour cet item :", item);
    return null;
  }

  // Supprimer les accents et mettre en minuscule pour la comparaison
  const normalizedTitle = removeAccents(itemTitleFr);

  // Liste des tableaux à vérifier
  const dataSources = [
    itemsStore.armures,
    itemsStore.armes,
    itemsStore.accessoires,
    itemsStore.consommables,
    itemsStore.ressources,
    itemsStore.familiers,
  ];

  // Cherche l'image dans les 4 tableaux en comparant sans accents
  for (const dataSource of dataSources) {
    const imageObj = dataSource.find(
      (data) => removeAccents(data.Nom) === normalizedTitle
    );
    if (imageObj) {
      return imageObj.Image; // Retourne la première image trouvée
    }
  }
  return null;
};

const getItemTypeTitle = (itemTypeId: number): string => {
  const itemType = allItemTypes.value.find(
    (type) => type.definition.id === itemTypeId
  );

  return (
    itemType?.title?.[itemsStore.userLang as keyof typeof itemType.title] ??
    "Type inconnu"
  );
};

const extractIdFromUrl = (url: string): number | null => {
  if (!url) return null; // Vérifier que l'URL existe

  const match = url.match(/\/(\d+)-/); // Trouve un nombre suivi d'un '-'
  return match ? Number(match[1]) : null;
};

const isItemDroppable = (item: any) => {
  return droppableItemsSet.value.has(item.definition.item.id);
};

const selectedRarities = ref<number[]>([]);

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
  // Réinitialiser la pagination lorsqu'un filtre change
  currentPage.value = 1;
};

const allItemTypes = computed(() => {
  const combinedItems = [...itemsStore.itemTypes, ...itemsStore.equipmentTypes];

  // Utiliser un Map pour conserver uniquement le dernier élément avec chaque ID
  const uniqueItemsMap = new Map();

  combinedItems.forEach((item) => {
    if (item.title && item.title.fr) {
      uniqueItemsMap.set(
        item.title.fr.replace(/\{\[~1\]\?s:\}|\{\[~1\]\?x:\}/g, ""),
        item
      );
    }
  });

  // Convertir le Map en tableau
  return Array.from(uniqueItemsMap.values());
});

const filteredItems = computed(() => {
  let items = itemsStore.items;

  // Filtre par recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    items = items.filter((item) =>
      item.title[itemsStore.userLang as keyof typeof item.title]
        .toLowerCase()
        .includes(query)
    );
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

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredItems.value.slice(start, end);
});

// Réinitialiser la pagination quand les filtres changent
watch(
  [searchQuery, selectedRarities, hideDroppable, levelRange, selectedItemTypes],
  () => {
    currentPage.value = 1;
  }
);

const copiedItemId = ref<number | null>(null);

const copyItemTitle = (title: string, id: number) => {
  navigator.clipboard.writeText(title)
    .then(() => {
      copiedItemId.value = id;
      setTimeout(() => copiedItemId.value = null, 2000); // Réinitialise après 2 sec
    })
    .catch((err) => {
      console.error("Erreur lors de la copie du titre : ", err);
    });
};
</script>

<template>
  <div class="mx-12">
    <!-- Barre de recherche -->
    <div class="flex items-center justify-between mb-6">
      <div class="relative">
        <Search
          class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
        />
        <Input
          v-model="searchQuery"
          class="pl-10"
          placeholder="Rechercher un item..."
        />
      </div>
      <div class="flex gap-2">
        <Button
          v-for="rarity in rarityArray"
          :key="rarity.rarity"
          :class="{
            'bg-blue-500 text-white': selectedRarities.includes(rarity.rarity),
            'bg-gray-200 text-black': !selectedRarities.includes(rarity.rarity),
          }"
          @click="toggleRarity(rarity.rarity)"
          class="hover:text-white"
        >
          <img :src="rarity.icon" alt="Rarity Icon" />
          {{ rarity.label }}
        </Button>
      </div>
    </div>

    <!-- CheckBox Hide Droppable -->
    <div class="flex items-center gap-2">
      <Checkbox
        id="hideDroppable"
        v-model:checked="hideDroppable"
        class="w-5 h-5"
      />
      <label for="hideDroppable" class="text-sm cursor-pointer">
        Cacher les objets droppables
      </label>
    </div>

    <!-- Slider pour la plage de niveaux -->
    <div class="mt-3">
      <div class="mb-2">Niveau {{ levelRange[0] }} - {{ levelRange[1] }}</div>
      <Slider
        v-model="levelRange"
        :min="0"
        :max="245"
        :step="1"
        :range="true"
        class="w-1/3"
      />
    </div>

    <!-- Liste des métiers -->
    <p class="mt-4 text-xl">Métiers</p>
    <div class="flex flex-wrap gap-4 mb-4">
      <div
        v-for="job in itemsStore.jobs"
        :key="job.definition.id"
        class="flex gap-2 items-center"
      >
        <Checkbox />
        <label class="cursor-pointer">{{
          job.title?.[
            itemsStore.userLang as keyof typeof job.title as
              | "en"
              | "es"
              | "fr"
              | "pt"
          ] ?? "Nom du métier non disponible"
        }}</label>
      </div>
    </div>

    <!-- Liste des types d'objets avec filtrage actif -->
    <p class="mt-4 text-xl">Types d'objets</p>
    <div class="grid grid-cols-4 gap-4 mb-6">
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
    </div>

    <!-- Statistiques des résultats -->
    <div class="mb-4 text-sm text-muted-foreground">
      {{ filteredItems.length }} items trouvés
      <span v-if="selectedItemTypes.length > 0">
        ({{ selectedItemTypes.length }} types sélectionnés)
      </span>
    </div>

    <!-- Liste des objets -->
    <h1 class="text-3xl font-bold mb-4">Liste des objets</h1>
    <div
      v-if="itemsStore.loading"
      class="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2 lg:grid-cols-3"
    >
      <!-- Items Skeleton -->
      <Card v-for="n in 20" :key="n" class="flex items-center gap-4">
        <CardContent>
          <Skeleton class="h-12 w-12 rounded" />
          <div class="space-y-2">
            <Skeleton class="h-4 w-[250px]" />
            <Skeleton class="h-4 w-[200px]" />
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Liste vide -->
    <div v-else-if="!filteredItems.length">
      <div class="col-span-full text-center py-8">
        <div class="text-muted-foreground">Aucun item trouvé</div>
      </div>
    </div>

    <!-- Liste d'items -->
    <div
      v-else
      class="grid grid-cols-1 gap-4 my-4 md:grid-cols-2 lg:grid-cols-4"
    >
      <Card
        v-for="item in paginatedItems"
        :key="item.definition.item.id"
        class="p-4 border rounded hover:shadow-md transition-shadow"
      >
        <CardHeader>
          <!-- Recherche de l'image correspondant au titre de l'item -->
          <img
            v-if="getItemImage(item)"
            :src="getItemImage(item)"
            alt="Item Image"
            referrerpolicy="no-referrer"
            class="w-12 h-12 rounded"
          />

          <CardTitle class="flex gap-2 items-center">
  <img
    :src="
      rarityArray.find(
        (rarity) => rarity.rarity === item.definition.item.baseParameters.rarity
      )?.icon
    "
    alt="Rarity Icon"
  />
  {{
    item.title[itemsStore.userLang as 'en' | 'es' | 'fr' | 'pt'] ??
    "Nom de l'objet non disponible"
  }}
  
  <TooltipProvider>
  <Tooltip>
    <TooltipTrigger as-child>
      <Button
        variant="ghost"
        size="sm"
        class="p-2"
        @click="copyItemTitle(item.title[itemsStore.userLang as 'en' | 'es' | 'fr' | 'pt'] ?? 'Nom inconnu', item.definition.item.id)"
      >
        <Check v-if="copiedItemId === item.definition.item.id" class="w-4 h-4 text-green-500" />
        <ClipboardCopy v-else class="w-4 h-4" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <span v-if="copiedItemId === item.definition.item.id" class="text-xs text-green-500">Copié !</span>
      <span v-else class="text-xs">Copier</span>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>

</CardTitle>


        </CardHeader>

        <CardContent>
          Type :
          {{
            getItemTypeTitle(
              item.definition.item.baseParameters.itemTypeId
            ).replace(/\{\[~1\]\?s:\}|\{\[~1\]\?x:\}/g, "")
          }}
        </CardContent>

        <CardContent> Niveau {{ item.definition.item.level }} </CardContent>
        <CardContent> ID {{ item.definition.item.id }} </CardContent>
      </Card>
    </div>

    <!-- Pagination -->
    <div
      v-if="filteredItems.length > itemsPerPage"
      class="my-6 flex justify-center gap-2"
    >
      <Pagination
        v-slot="{ page }"
        v-model:page="currentPage"
        :total="filteredItems.length"
        :itemsPerPage="itemsPerPage"
        :sibling-count="1"
        show-edges
      >
        <PaginationList v-slot="{ items }" class="flex items-center gap-1">
          <PaginationFirst @click="currentPage = 1" />
          <PaginationPrev @click="currentPage > 1 ? currentPage-- : null" />

          <template v-for="(item, index) in items">
            <PaginationListItem
              v-if="item.type === 'page'"
              :key="index"
              :value="item.value"
              as-child
            >
              <Button
                class="w-10 h-10 p-0"
                :variant="item.value === page ? 'default' : 'outline'"
                @click="currentPage = item.value"
              >
                {{ item.value }}
              </Button>
            </PaginationListItem>
            <PaginationEllipsis v-else :key="item.type" :index="index" />
          </template>

          <PaginationNext />
          <PaginationLast />
        </PaginationList>
      </Pagination>
    </div>
  </div>
</template>
