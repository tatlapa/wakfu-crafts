<script setup lang="ts">
import { useItemsStore } from "~/stores/items";
import { ref, computed, onMounted } from "vue";
import ItemCard from "@/components/pages/index/ItemCard.vue";
import iconCommon from "~/assets/icons/rarity/common.png";
import iconRare from "~/assets/icons/rarity/rare.png";
import iconMythical from "~/assets/icons/rarity/mythic.png";
import iconLegendary from "~/assets/icons/rarity/legendary.png";
import iconEpic from "~/assets/icons/rarity/epic.png";
import iconMemory from "~/assets/icons/rarity/memory.png";
import iconRelic from "~/assets/icons/rarity/relic.png";
import CardContent from "~/components/ui/card/CardContent.vue";

definePageMeta({
  layout: "aside",
});

// const props = defineProps<{ searchQuery: string }>(); // Récupération du searchQuery
const itemsStore = useItemsStore();
const currentPage = ref(1);
const itemsPerPage = 12;
const selectedItemTypes = ref<number[]>([]); // Pour stocker les types d'items sélectionnés
const { $filteredItems } = useNuxtApp();

const rarityArray = [
  {
    label: "Commun",
    icon: iconCommon,
    rarity: 1,
    color: "#fff",
  },
  { label: "Rare", icon: iconRare, rarity: 2, color: "#4c9646" },
  {
    label: "Mythique",
    icon: iconMythical,
    rarity: 3,
    color: "#dd7f13",
  },
  {
    label: "Légendaire",
    icon: iconLegendary,
    rarity: 4,
    color: "#ffef64",
  },
  { label: "Relique", icon: iconRelic, rarity: 5, color: "#c570ef" },
  { label: "Souvenir", icon: iconMemory, rarity: 6, color: "#80d6d4" },
  { label: "Épique", icon: iconEpic, rarity: 7, color: "#eebcd7" },
];

onMounted(async () => {
  await itemsStore.getItems();
  await itemsStore.getItemTypes();
  await itemsStore.getEquipmentTypes();
  await itemsStore.getJobs();
  await itemsStore.loadAllCSVs();
  await itemsStore.getItemStatistics();
});

// Fonction pour supprimer les accents d'une chaîne
const removeAccents = (str: string) => {
  return str
    .normalize("NFD") // Décompose les accents
    .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
    .toLowerCase(); // Convertit en minuscule pour éviter la sensibilité à la casse
};

const getItemImage = (item: any) => {
  const itemTitleFr = item?.title?.fr;

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

const getItemLink = (item: any) => {
  const itemTitleFr = item?.title?.fr;

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

  // Cherche le lien dans les 4 tableaux en comparant sans accents
  for (const dataSource of dataSources) {
    const linkObj = dataSource.find(
      (data) => removeAccents(data.Nom) === normalizedTitle
    );
    if (linkObj) {
      return linkObj.Lien; // Retourne la première image trouvée
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

const getItemStatistics = (actionId: number, params: number[]) => {
  const stat = itemsStore.itemStatistics.find(
    (stat) => stat.definition.id === actionId
  );

  if (!stat) return null; // Aucune statistique trouvée

  let description =
    stat.description[itemsStore.userLang as "fr" | "en" | "es" | "pt"];

  description = description
    .replace("[#1]", params[0]?.toString() ?? "?")
    .replace("[#2]", params[2]?.toString() ?? "?")
    .replace("{[~2]?%:}", params[4]?.toString() ?? "?")
    .replace(/(\d+)121(?!\d)/g, "$1% Armure Reçue")
    .replace(/(\d+)120(?!\d)/g, "$1% Armure Donnée")
    .replace("[el2]", "eau")
    .replace("[el3]", "terre")
    .replace("[el4]", "air")
    .replace(/\[[^\]]*\]/g, "") // Supprime les crochets et leur contenu
    .replace("{?s:}", "")
    .replace("{?s:}}", "")
    .replace("{?", "")
    .replace("Maîtrise :", "");

  return description;
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

const paginatedItems = computed(() => {
  // Ensure $filteredItems is an array before using .slice
  const items = Array.isArray($filteredItems.value) ? $filteredItems.value : [];
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;

  return $filteredItems.value.slice(start, end);
});

const copiedItemId = ref<number | null>(null);

const copyItemTitle = (title: string, id: number) => {
  navigator.clipboard
    .writeText(title)
    .then(() => {
      copiedItemId.value = id;
      setTimeout(() => (copiedItemId.value = null), 2000); // Réinitialise après 2 sec
    })
    .catch((err) => {
      console.error("Erreur lors de la copie du titre : ", err);
    });
};
</script>

<template>


  <div class="w-2/3">
          <!-- Statistiques des résultats -->
          <div class="mb-4 text-sm text-muted-foreground">
      {{ $filteredItems.length }} items trouvés
    </div>
    <!-- Liste des objets -->
    <h1 class="text-3xl font-bold mb-4">Liste des objets</h1>

    <div
      v-if="itemsStore.loading"
      class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
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
    <div v-else-if="!$filteredItems.length">
      <div class="col-span-full text-center py-8">
        <div class="text-muted-foreground">Aucun item trouvé</div>
      </div>
    </div>

    <!-- Liste d'items -->
    <div
      v-else
      class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
    >
      <ItemCard
        v-for="item in paginatedItems"
        :key="item.definition.item.id"
        :item="item"
        :itemLink="getItemLink(item)"
        :getItemImage="getItemImage"
        :getItemTypeTitle="getItemTypeTitle"
        :getItemStatistics="getItemStatistics"
        :rarityArray="rarityArray"
        :userLang="itemsStore.userLang"
        :copyItemTitle="copyItemTitle"
        :copiedItemId="copiedItemId"
      />
    </div>

    <!-- Pagination -->
    <div
      v-if="$filteredItems.length > itemsPerPage"
      class="my-6 flex justify-center gap-2"
    >
      <Pagination
        v-slot="{ page }"
        v-model:page="currentPage"
        :total="$filteredItems.length"
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
