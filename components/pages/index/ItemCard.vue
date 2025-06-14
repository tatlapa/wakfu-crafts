<script setup>
import { Check, ClipboardCopy } from "lucide-vue-next";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const props = defineProps({
  item: Object,
  itemLink: String,
  getItemImage: Function,
  getItemTypeTitle: Function,
  getItemStatistics: Function,
  rarityArray: Array,
  userLang: String,
  copyItemTitle: Function,
  copiedItemId: Number | null,
});

const itemTitle = computed(
  () => props.item?.title?.[props.userLang] || "Nom de l'objet non disponible"
);
</script>

<template>
  <HoverCard>
    <HoverCardTrigger as-child>
      <Card class="p-4 border rounded hover:shadow-md transition-shadow">
        <CardHeader>
          <div class="flex justify-between items-center">
            <img
              :src="getItemImage(item)"
              alt="Item Image"
              referrerpolicy="no-referrer"
              class="w-12 h-12 rounded"
            />
            <a :href="itemLink" target="_blank" rel="noopener noreferrer">
              <img
                src="@/assets/icons/encyclopedia.webp"
                alt="Encyclopedia Icon"
                class="w-12 h-12 cursor-pointer hover:scale-125 hover:bg-black/20 p-1 rounded-full transition-all duration-300"
              />
            </a>
          </div>
          <CardTitle class="flex gap-2 items-center">
            <img
              :src="
                rarityArray.find(
                  (rarity) =>
                    rarity.rarity === item.definition.item.baseParameters.rarity
                )?.icon
              "
              alt="Rarity Icon"
            />
            {{ itemTitle }}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger as-child>
                  <Button
                    variant="ghost"
                    size="sm"
                    class="p-2"
                    @click="copyItemTitle(itemTitle, item.definition.item.id)"
                  >
                    <Check
                      v-if="copiedItemId === item.definition.item.id"
                      class="w-4 h-4 text-green-500"
                    />
                    <ClipboardCopy v-else class="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <span class="text-xs">{{ $t("common.itemsCard.copy") }}</span>
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
    </HoverCardTrigger>
    <HoverCardContent
      :borderColor="
        rarityArray.find(
          (rarity) =>
            rarity.rarity === item.definition.item.baseParameters.rarity
        )?.color
      "
    >
      <div
        v-for="effect in item.definition.equipEffects"
        :key="effect.effect.definition.id"
      >
        {{
          getItemStatistics(
            effect.effect.definition.actionId,
            effect.effect.definition.params
          )
        }}
      </div>
    </HoverCardContent>
  </HoverCard>
</template>
