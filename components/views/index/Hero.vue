<script setup lang="ts">
import { useItemsStore } from "~/stores/items";
import { ref, computed } from "vue";

const itemsStore = useItemsStore();
const itemsPerPage = 20;
const currentPage = ref(1);

onMounted(async () => {
  await itemsStore.getItems();
});

// Objets paginés
const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return itemsStore.items.slice(start, start + itemsPerPage);
});

// Nombre total de pages
const totalPages = computed(() =>
  Math.ceil(itemsStore.items.length / itemsPerPage)
);

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

// Fonction pour obtenir la couleur en fonction de la rareté
const getRarityColor = (rarity: number) => {
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
    <h1 class="text-3xl font-bold">Liste des objets</h1>

    <div v-if="itemsStore.items.length === 0" class="mt-4">
      <p>Chargement...</p>
    </div>

    <!-- Liste des objets paginés -->
    <ul v-if="itemsStore.items.length" class="mt-4 grid grid-cols-2 gap-4">
      <li
        v-for="item in paginatedItems"
        :key="item.id"
        :class="`p-4 border-4 rounded ${getRarityColor(
          item.definition.item.baseParameters.rarity
        )}`"
      >
        <h2 class="font-bold">
          {{ item.title?.[itemsStore.userLang] || "Titre indisponible" }}
        </h2>
        <p>Level {{ item.definition.item.level }}</p>
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
