<script setup lang="ts">
import { useItemsStore } from "~/stores/items";
import { ref, computed } from "vue";

const itemsStore = useItemsStore();
const itemsPerPage = 20;
const currentPage = ref(1);
const searchQuery = ref("");

onMounted(async () => {
  await itemsStore.getItems();
  console.log(itemsStore.items);
});

const filteredItems = computed(() => {
  return itemsStore.items.filter((item) => {
    const itemTypeId = item.definition?.item?.baseParameters?.itemTypeId ?? 0;
    const itemTitle = item.title?.[itemsStore.userLang]?.toLowerCase() ?? "";

    // Filtrer par recherche
    if (
      searchQuery.value &&
      !itemTitle.includes(searchQuery.value.toLowerCase())
    ) {
      return false;
    }

    // Si l'option "Afficher uniquement les objets craftables" est activée
    if (
      itemsStore.showCraftableOnly &&
      !itemsStore.craftableItemsIds.has(item.definition?.item?.id ?? 0)
    ) {
      return false;
    }

    // Si des types d'objets sont sélectionnés, filtrer selon ceux-ci
    if (itemsStore.selectedItemTypes.size > 0) {
      return itemsStore.selectedItemTypes.has(itemTypeId);
    }

    return true;
  });
});

// Objets paginés après filtrage
const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredItems.value.slice(start, start + itemsPerPage);
});

// Nombre total de pages
const totalPages = computed(() =>
  Math.ceil(filteredItems.value.length / itemsPerPage)
);

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

// Fonction pour obtenir la couleur de la rareté
const getRarityColor = (rarity?: number) => {
  switch (rarity) {
    case 1:
      return "border-gray-400"; // Gris
    case 2:
      return "border-green-500"; // Vert
    case 3:
      return "border-orange-500"; // Orange
    case 4:
      return "border-yellow-500"; // Jaune
    case 5:
      return "border-blue-500"; // Bleu
    case 6:
      return "border-pink-500"; // Rose
    case 7:
      return "border-purple-500"; // Violet
    default:
      return "border-gray-200"; // Par défaut gris clair
  }
};
</script>

<template>
  <div class="container mx-auto p-4">
    <!-- Champ de recherche -->
    <div class="mb-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Rechercher un objet..."
        class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
    <h1 class="text-3xl font-bold">Liste des objets</h1>

    <!-- Checkbox pour filtrer les objets craftables -->
    <div class="flex items-center mb-4">
      <input
        type="checkbox"
        id="craftableFilter"
        v-model="itemsStore.showCraftableOnly"
        class="mr-2 w-5 h-5 accent-blue-500"
      />
      <label for="craftableFilter" class="text-lg"
        >Afficher uniquement les objets craftables</label
      >
    </div>

    <!-- Checkboxes pour filtrer les types d'objets -->
    <div class="grid grid-cols-3 gap-2 mb-4">
      <div
        v-for="[itemTypeId, itemTypeName] in itemsStore.itemTypes"
        :key="itemTypeId"
        class="flex items-center"
      >
        <input
          type="checkbox"
          :id="'type-' + itemTypeId"
          :value="itemTypeId"
          v-model="itemsStore.selectedItemTypes"
          class="mr-2 w-5 h-5 accent-blue-500"
        />
        <label :for="'type-' + itemTypeId" class="text-sm">{{
          itemTypeName
        }}</label>
      </div>
    </div>

    <div v-if="itemsStore.items.length === 0" class="mt-4">
      <p>Chargement...</p>
    </div>

    <!-- Liste des objets paginés -->
    <ul v-if="filteredItems.length" class="mt-4 grid grid-cols-2 gap-4">
      <li
        v-for="item in paginatedItems"
        :key="item.id"
        :class="`p-4 border-4 rounded ${getRarityColor(
          item.definition?.item?.baseParameters?.rarity
        )}`"
      >
        <h2 class="font-bold">
          {{ item.title?.[itemsStore.userLang] || "Titre indisponible" }}
        </h2>
        <p class="text-sm text-gray-600">
          Type:
          {{
            itemsStore.itemTypes.get(
              item.definition?.item?.baseParameters?.itemTypeId
            ) ?? "Type inconnu"
          }}
        </p>
        <p class="text-sm text-gray-600">
          Level: {{ item.definition?.item?.level }}
        </p>
        <p class="text-sm text-gray-600">ID: {{ item.definition?.item?.id }}</p>
      </li>
    </ul>
    <!-- Pagination -->
    <div class="flex justify-center mt-6">
      <button
        @click="goToPage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="px-4 py-2 mx-1 border rounded"
      >
        ← Précédent
      </button>

      <span class="px-4 py-2">Page {{ currentPage }} / {{ totalPages }}</span>

      <button
        @click="goToPage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="px-4 py-2 mx-1 border rounded"
      >
        Suivant →
      </button>
    </div>
  </div>
</template>
