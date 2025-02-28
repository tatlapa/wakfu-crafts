import { defineStore } from "pinia";
import Papa from "papaparse";
import type { Item } from "~/types/itemTypes";

export const useItemsStore = defineStore("items-store", {
  state: () => ({
    items: [] as Item[], // Liste complète des objets
    itemTypes: [] as any[], // Liste complète des types d'objets
    equipmentTypes: [] as any[], // Liste des types d'équipements
    jobs: [] as any[], // Liste des métiers
    itemStatistics: [] as any[], // Liste des statistiques des objets
    userLang: "fr", // Langue de l'utilisateur (par défaut : français)
    loading: false,
    armures: [] as any[], // Stocke les armures
    armes: [] as any[], // Stocke les armes
    accessoires: [] as any[], // Stocke les accessoires
    consommables: [] as any[], // Stocke les consommables
    ressources: [] as any[], // Stocke les ressources
    familiers: [] as any[], // Stocke les familiers
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
        return true;
      } catch (error) {
        console.error("Erreur lors de la récupération des objets :", error);
        return false;
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
        return true;
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des types d'objets :",
          error
        );
        return false;
      }
    },
    async getEquipmentTypes() {
      try {
        const version = "1.85.1.29";
        const proxyUrl = "http://localhost:8080/";
        const equipmentTypesUrl = `${proxyUrl}https://wakfu.cdn.ankama.com/gamedata/${version}/equipmentItemTypes.json`;

        this.equipmentTypes = await $fetch<any[]>(equipmentTypesUrl);
        console.log(
          "Récupération des types d'équipement :",
          this.equipmentTypes
        );
        return true;
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des types d'équipement :",
          error
        );
        return false;
      }
    },
    async getJobs() {
      try {
        const version = "1.85.1.29";
        const proxyUrl = "http://localhost:8080/";
        const jobsUrl = `${proxyUrl}https://wakfu.cdn.ankama.com/gamedata/${version}/recipeCategories.json`;

        this.jobs = await $fetch<any[]>(jobsUrl);
        console.log("Récupération des métiers :", this.jobs);
        return true;
      } catch (error) {
        console.error("Erreur lors de la récupération des métiers :", error);
        return false;
      }
    },
    async getItemStatistics() {
      try {
        const version = "1.85.1.29";
        const proxyUrl = "http://localhost:8080/";
        const itemStatisticsUrl = `${proxyUrl}https://wakfu.cdn.ankama.com/gamedata/${version}/actions.json`;

        this.itemStatistics = await $fetch<any[]>(itemStatisticsUrl);
        console.log(
          "Récupération des statistiques d'items :",
          this.itemStatistics
        );
        return true;
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des statistiques d'items :",
          error
        );
        return false;
      }
    },
    getUserLang() {
      try {
        const savedLang = localStorage.getItem("lang");

        if (savedLang) {
          this.userLang = savedLang;
        } else {
          const browserLang = navigator.language.split("-")[0];
          this.userLang = ["fr", "en", "es", "pt"].includes(browserLang)
            ? browserLang
            : "fr";
          localStorage.setItem("lang", this.userLang);
        }
        return true;
      } catch (error) {
        console.error("Erreur lors de la récupération de la langue :", error);
        return false;
      }
    },

    async loadCSV(
      fileName: string,
      targetArray:
        | "armures"
        | "armes"
        | "accessoires"
        | "consommables"
        | "ressources"
        | "familiers"
    ) {
      try {
        const response = await fetch(`/${fileName}`);
        const csvText = await response.text();

        Papa.parse(csvText, {
          header: true, // Utiliser la première ligne comme en-tête
          skipEmptyLines: true,
          complete: (result) => {
            this[targetArray] = result.data; // Stocker les données dans le bon tableau
          },
        });
      } catch (error) {
        console.error(`Erreur lors du chargement du CSV ${fileName} :`, error);
      }
    },
    async loadAllCSVs() {
      await this.loadCSV("armures.csv", "armures");
      await this.loadCSV("armes.csv", "armes");
      await this.loadCSV("accessoires.csv", "accessoires");
      await this.loadCSV("consommables.csv", "consommables");
      await this.loadCSV("ressources.csv", "ressources");
      await this.loadCSV("familiers.csv", "familiers");
    },
  },
});
