

googleTranslateApiKey = "AIzaSyCfkTZx1VlMpWNizEDDOtw7lQxzB4By3-k";
const googleTranslate = require('google-translate')(googleTranslateApiKey);

googleTranslate.detectLanguage("test", function(err, detection) {
    var translateLanguage = 'ja';
    if (detection.language == 'ja'){
        translateLanguage = 'en';
    }
});