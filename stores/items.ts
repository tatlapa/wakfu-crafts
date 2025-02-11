import { defineStore } from "pinia";

export const useItemsStore = defineStore("items-store", {
  state: () => ({
    items: [] as any[], // Liste complète des objets
    craftableItemsIds: new Set<number>(), // Liste des IDs des objets craftables
    itemTypes: new Map<number, string>(), // Map des types d'objets
    selectedItemTypes: new Set<number>(), // Types d'objets sélectionnés
    showCraftableOnly: false, // Toggle pour filtrer les objets craftables
    userLang: "fr",
  }),
  actions: {
    async getItems() {
      try {
        const version = "1.85.1.29";
        const proxyUrl = "http://localhost:8080/"; // Proxy CORS Anywhere
        const itemsUrl = `${proxyUrl}https://wakfu.cdn.ankama.com/gamedata/${version}/items.json`;
        const recipesUrl = `${proxyUrl}https://wakfu.cdn.ankama.com/gamedata/${version}/recipeResults.json`;
        const itemTypesUrl = `${proxyUrl}https://wakfu.cdn.ankama.com/gamedata/${version}/itemTypes.json`;

        console.log("Récupération des items :", itemsUrl);
        console.log("Récupération des recettes :", recipesUrl);
        console.log("Récupération des types d'objets :", itemTypesUrl);

        // Récupération des objets
        this.items = await $fetch(itemsUrl, {
          headers: { "x-requested-with": "XMLHttpRequest" },
        });

        // Récupération des recettes pour identifier les objets craftables
        const recipes = await $fetch<any[]>(recipesUrl, {
          headers: { "x-requested-with": "XMLHttpRequest" },
        });
        this.craftableItemsIds = new Set(
          recipes.map((recipe) => recipe.productedItemId)
        );

        // Récupération des types d'objets
        const itemTypesData = await $fetch<any[]>(itemTypesUrl, {
          headers: { "x-requested-with": "XMLHttpRequest" },
        });

        // Stocker les types d'objets dans une Map (id -> titre)
        this.itemTypes = new Map(
          itemTypesData.map((type) => [
            type.definition.id,
            (type.title?.[this.userLang] ?? "Type inconnu")
              .replace(/{\[~1\]\?s:}/g, "") // Supprime {[~1]?s:}
              .replace(/{\[~1\]\?x:}/g, ""), // Supprime {[~1]?x:}
          ])
        );

        console.log("Types d'objets chargés :", this.itemTypes);

        // Détection automatique de la langue utilisateur
        const browserLang = navigator.language.split("-")[0];
        this.userLang = ["fr", "en", "es", "de"].includes(browserLang)
          ? browserLang
          : "fr";
        console.log("Langue détectée :", this.userLang);
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
      }
    },
    toggleItemTypeFilter(itemTypeId: number) {
      if (this.selectedItemTypes.has(itemTypeId)) {
        this.selectedItemTypes.delete(itemTypeId);
      } else {
        this.selectedItemTypes.add(itemTypeId);
      }
    },
  },
});
