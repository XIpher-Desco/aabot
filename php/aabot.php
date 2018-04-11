<?php

include __DIR__.'/vendor/autoload.php';

$tokenStr = file_get_contents("../token.json");
$discordToken = json_decode($tokenStr)->discordTokenPhp;

$discord = new \Discord\Discord([
    'token' => $discordToken, // ←作成したBotのTokenを入力してね
]);

$discord->on('ready', function ($discord) {
    echo "Bot is ready.", PHP_EOL;

    // Listen for events here
    $discord->on('message', function ($message) {
        echo "Recieved a message from {$message->author->username}: {$message->content}", PHP_EOL;
    });
});

$discord->run();