<template>
  <LayoutsDefaultHeader />
  <div class="container mx-auto py-16">
    <div class="h-full w-full flex flex-row-reverse gap-2 gap-y-4">
      <LayoutsAsideMenuFilter />
      <slot />
    </div>
  </div>
  <LayoutsDefaultFooter />
</template>
