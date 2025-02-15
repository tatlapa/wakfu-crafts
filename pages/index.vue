<script setup lang="ts">
import { useItemsStore } from "~/stores/items";
import { ref, computed, onMounted } from "vue";
import { Search } from "lucide-vue-next";
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

const itemsStore = useItemsStore();
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = 20;
const resetPagination = () => {
  currentPage.value = 1;
};

onMounted(async () => {
  await itemsStore.getItems();
  await itemsStore.getItemTypes();
  await itemsStore.getJobs();
});

const filteredItems = computed(() => {
  if (!searchQuery.value) return itemsStore.items;

  const query = searchQuery.value.toLowerCase();
  return itemsStore.items.filter((item) => {
    return item.title[itemsStore.userLang as keyof typeof item.title]
      .toLowerCase()
      .includes(query);
  });
});

const totalPages = computed(() =>
  Math.ceil(filteredItems.value.length / itemsPerPage)
);

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredItems.value.slice(start, end);
});
</script>

<template>
  <div class="mx-12">
    <!-- Barre de recherche -->
    <div class="flex items-center justify-center mb-6">
      <div class="relative">
        <Search
          class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
        />
        <Input
          v-model="searchQuery"
          class="pl-10"
          placeholder="Rechercher un item..."
          @input="resetPagination"
        />
      </div>
    </div>

    <!-- Liste des objets -->
    <h1 class="text-3xl font-bold">Liste des objets</h1>
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
      class="grid grid-cols-1 gap-4 my-4 md:grid-cols-2 lg:grid-cols-3"
    >
      <Card
        v-for="item in paginatedItems"
        :key="item.definition.item.id"
        class="p-4 border rounded"
      >
        <CardHeader>
          <CardTitle>{{
            item.title[
              itemsStore.userLang as keyof typeof item.title as
                | "en"
                | "es"
                | "fr"
                | "pt"
            ] ?? "Nom de l'objet non disponible"
          }}</CardTitle>
          <CardDescription>{{
            item.description[
              itemsStore.userLang as keyof typeof item.title as
                | "en"
                | "es"
                | "fr"
                | "pt"
            ] ?? "Nom de l'objet non disponible"
          }}</CardDescription>
        </CardHeader>
        <CardContent> Niveau {{ item.definition.item.level }} </CardContent>
      </Card>
    </div>

    <!-- Pagination -->
    <div
      v-if="filteredItems.length > itemsPerPage"
      class="mt-6 flex justify-center gap-2"
    >
      <Pagination
        v-slot="{ page }"
        v-model:page="currentPage"
        :total="totalPages"
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
