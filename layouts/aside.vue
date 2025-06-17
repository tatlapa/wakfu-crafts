<template>
  <LayoutsDefaultHeader />
  <main class="container mx-auto py-16">
    <div class="h-full w-full flex flex-row-reverse gap-2">
      <LayoutsAsideMenuFilter />
      
      <slot />
    </div>
  </main>
  <LayoutsDefaultFooter />
</template>
