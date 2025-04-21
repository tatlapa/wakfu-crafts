export default defineEventHandler(async (event) => {
  const { path } = event.context.params!;

  try {
    // 1. Récupère la version actuelle via config.json
    const config = await $fetch<{ version: string }>(
      "https://wakfu.cdn.ankama.com/gamedata/config.json"
    );
    const version = config.version;

    // 2. Construit l’URL du fichier demandé
    const url = `https://wakfu.cdn.ankama.com/gamedata/${version}/${path}`;

    // 3. Fait le fetch et retourne le résultat
    const res = await $fetch(url);
    return res;
  } catch (err) {
    console.error("[Proxy error]", err);
    return { error: "Erreur proxy : impossible de récupérer la ressource." };
  }
});
