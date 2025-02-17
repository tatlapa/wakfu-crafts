<?php

require 'vendor/autoload.php';

use GuzzleHttp\Client;
use Symfony\Component\DomCrawler\Crawler;

$client = new Client([
    'headers' => [
        'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language' => 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer' => 'https://www.google.com/',
        'Connection' => 'keep-alive'
    ],
    'cookies' => true,
    'timeout' => 30, // Ajout d'un timeout pour éviter les requêtes infinies
]);

$base_urls = [
    "familiers" => "https://www.wakfu.com/fr/mmorpg/encyclopedie/familiers",
    "ressources" => "https://www.wakfu.com/fr/mmorpg/encyclopedie/ressources",

];

foreach ($base_urls as $category => $base_url) {
    $current_page = 1;
    $data = [];

    while (true) {
        $url = $current_page == 1 ? $base_url : "{$base_url}?page={$current_page}";
        echo "🔄 Scraping de la page $current_page pour $category...\n";

        try {
            $response = $client->get($url);
            $html = (string) $response->getBody();
            $crawler = new Crawler($html);

            $rows = $crawler->filter('table.ak-table tbody tr');

            if ($rows->count() === 0) {
                echo "🚫 Fin de la pagination pour $category.\n";
                break;
            }

            $rows->each(function (Crawler $row) use (&$data, $client) {
                $imageTag = $row->filter('td img')->first();
                $imageUrl = $imageTag->count() ? $imageTag->attr('src') : "Pas d'image";

                $nameTag = $row->filter('td:nth-child(2) .ak-linker a');
                $name = $nameTag->count() ? trim($nameTag->text()) : "Nom inconnu";
                $link = $nameTag->count() ? "https://www.wakfu.com" . $nameTag->attr('href') : "#";

                echo "🟢 Objet trouvé : $name\n";

                $obtainedOn = "Non";

                if ($link !== "#") {
                    try {
                        $itemResponse = $client->get($link);
                        $itemHtml = (string) $itemResponse->getBody();
                        $itemCrawler = new Crawler($itemHtml);

                        $selectors = [
                            'div.ak-container.ak-panel > div.ak-panel-title:contains("Peut être obtenu sur")',
                        ];

                        foreach ($selectors as $selector) {
                            $obtainedSection = $itemCrawler->filter($selector);
                            if ($obtainedSection->count() > 0) {
                                $nextElement = $obtainedSection->nextAll()->first();
                                if ($nextElement->count() > 0 && trim($nextElement->text()) !== "") {
                                    $obtainedOn = "Oui";
                                    break;
                                }
                            }
                        }

                    } catch (Exception $e) {
                        echo "❌ Erreur lors de la récupération de '$name' : " . $e->getMessage() . "\n";
                    }
                }

                echo "   🏷 Peut être obtenu sur : $obtainedOn\n";

                $data[] = [
                    'Nom' => $name,
                    'Image' => $imageUrl,
                    'Lien' => $link,
                    'Peut être obtenu sur' => $obtainedOn
                ];
            });

            $current_page++;

        } catch (Exception $e) {
            echo "❌ Erreur sur la page $current_page : " . $e->getMessage() . "\n";
            break;
        }
    }

    $filename = "wakfu_{$category}.csv";
    $file = fopen($filename, "w");
    if ($file === false) {
        echo "❌ Erreur lors de l'ouverture du fichier $filename pour écriture.\n";
        continue;
    }

    fputcsv($file, ["Nom", "Image", "Lien", "Peut être obtenu sur"]);
    foreach ($data as $row) {
        fputcsv($file, $row);
    }
    fclose($file);

    echo "✅ Toutes les pages de $category ont été scrappées ! Données enregistrées dans '$filename'\n";
}