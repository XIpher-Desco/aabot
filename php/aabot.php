<?php

include __DIR__.'/vendor/autoload.php';

$tokenStr = file_get_contents("../token.json");
$tokens = json_decode($tokenStr);
$discordToken = $tokens->discordTokenPhp;
$translationToken = $tokens->discordTokenPhp;
$projectId = $tokens->pjid;

# setup discord instance
$discord = new \Discord\Discord([
    'token' => $discordToken, // ←作成したBotのTokenを入力してね
]);

# setup google translate instance
use Google\Cloud\Translate\TranslateClient;

$translate = new TranslateClient();
$translate = new TranslateClient([
    'projectId' => $projectId,
    'key' => $translationToken
]);

$discord->on('ready', function ($discord) {
    echo "Bot is ready.", PHP_EOL;

    // Listen for events here
    $discord->on('message', function ($message){
        var_dump($message->author->username);
        if ({$message->author->username != "AAdiscobot"){
            # 言語検出
            $detectresult = $translate->detectLanguage($massage->content);
            echo "Is {$result[languageCode]}";

            # 翻訳ターゲット選定 ja -> en, Other -> ja
            $translateLanguage = 'ja';
            if ($result['languageCode'] == 'ja'){
                $translateLanguage = 'en';
            }

            # 翻訳後の文字列を発言
            $translatedText = $translate->translate($massage->content);
            $massage->sendMessage($text);
        }
        echo "Recieved a message from {$message->author->username}: {$message->content}", PHP_EOL;
    });
});

$discord->run();