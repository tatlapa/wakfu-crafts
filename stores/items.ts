import { defineStore } from "pinia";
import type { Item } from "~/types/itemTypes";

export const useItemsStore = defineStore("items-store", {
  state: () => ({
    items: [] as Item[], // Liste complète des objets
    itemTypes: [] as any[], // Liste complète des types d'objets
    recipeResults: [] as any[], // Liste des recettes
    jobs: [] as any[], // Liste des métiers
    userLang: "fr", // Langue de l'utilisateur (par défaut : français)
    loading: false,
  }),
  actions: {
    async getItems() {
      this.loading = true;

      try {
        const version = "1.85.1.29";
        const proxyUrl = "http://localhost:8080/";
        const itemsUrl = `${proxyUrl}https://wakfu.cdn.ankama.com/gamedata/${version}/items.json`;

        this.items = await $fetch<any[]>(itemsUrl);
        console.log("Récupération des objets :", this.items);
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
      } finally {
        this.loading = false;
      }
    },
    async getItemTypes() {
      try {
        const version = "1.85.1.29";
        const proxyUrl = "http://localhost:8080/";
        const itemTypesUrl = `${proxyUrl}https://wakfu.cdn.ankama.com/gamedata/${version}/itemTypes.json`;

        this.itemTypes = await $fetch<any[]>(itemTypesUrl);
        console.log("Récupération des types d'objets :", this.itemTypes);
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
      }
    },
    async getJobs() {
      try {
        const version = "1.85.1.29";
        const proxyUrl = "http://localhost:8080/";
        const jobsUrl = `${proxyUrl}https://wakfu.cdn.ankama.com/gamedata/${version}/recipeCategories.json`;

        this.jobs = await $fetch<any[]>(jobsUrl);
        console.log("Récupération des métiers :", this.jobs);
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
      }
    },
    async getUserLang() {
      try {
        const lang = localStorage.getItem("lang");

        if (lang) {
          this.userLang = lang;
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération de la langue de l'utilisateur :",
          error
        );
      }
    },
  },
});
