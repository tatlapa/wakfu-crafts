<template>
  <LayoutsDefaultHeader />
  <div class="container mx-auto py-8 xl:py-16 px-4 sm:px-6 lg:px-8">
    <div class="h-full w-full flex flex-row-reverse gap-2 gap-y-4">
      <LayoutsAsideMenuFilter />
      <slot />
    </div>
  </div>
  <LayoutsDefaultFooter />
</template>
