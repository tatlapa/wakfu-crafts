<script setup lang="ts">
import { cn } from "@/lib/utils";
import {
  HoverCardContent,
  type HoverCardContentProps,
  HoverCardPortal,
  useForwardProps,
} from "reka-ui";
import { computed, type HTMLAttributes } from "vue";

const props = withDefaults(
  defineProps<
    HoverCardContentProps & {
      class?: HTMLAttributes["class"];
      borderColor?: string; // Nouvelle prop pour la couleur de bordure
    }
  >(),
  {
    sideOffset: 4,
  }
);

const delegatedProps = computed(() => {
  const { class: _, borderColor: __, ...delegated } = props;
  return delegated;
});

const forwardedProps = useForwardProps(delegatedProps);

// Style dynamique basé sur la couleur de bordure
const contentStyle = computed(() => {
  return props.borderColor ? { borderColor: props.borderColor } : {};
});
</script>

<template>
  <HoverCardPortal>
    <HoverCardContent
      v-bind="forwardedProps"
      :style="contentStyle"
      :class="
        cn(
          'z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          props.class
        )
      "
    >
      <slot />
    </HoverCardContent>
  </HoverCardPortal>
</template>
