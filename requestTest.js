var request = require('request');
var fs = require('fs');
var _ = require('underscore');

// adding a command line interfact through readline
var readline = require('readline');
var rl = readline.createInterface(process.stdin, process.stdout);

var writeToFile = function(url, filename) {
    // Request the large preview image
    var options = {
        url: url,
        encoding: null
    };
    request(options)
        .pipe(fs.createWriteStream(filename))
        .on('error', function(error) {
            console.error('Request to get a preview image failed: ' + error.message);
        });
    console.log('Successfully wrote image to ' + filename);
};

function getRedditImages(subreddit) {
    // First get an access token from Reddit using this OAuth2 workflow
    // https://github.com/reddit/reddit/wiki/OAuth2#application-only-oauth
    var options = {
    // Note: This is clientId:clientSecret@host
    url: 'https://IYBCh0fl0rpf5Q:FdKSuG_iatZ14aP7K1FEyiir-Yk@www.reddit.com/api/v1/access_token',
    method: 'POST',
    headers: {
        'User-Agent': 'request'
    },
    body: 'grant_type=client_credentials&username=&password='
    };
    request(options, function (error, response, body) {
        if (error) {
            console.error('Could not authenticate: ' + error.message);
            callback(error);
        } else {
            var bodyAsJson = JSON.parse(body);
            // We now have an access token
            var access_token = bodyAsJson.access_token;
            console.log('access token is: ' + access_token);
            var data;
            var options = {
                method: 'GET',
                url: 'https://oauth.reddit.com/r/' + subreddit + '/top/.json',
                qs: {
                    count: 0
                },
                headers: {
                    'Authorization': 'bearer ' + access_token,
                    'User-Agent': 'ChangeMeClient/0.1 by YourUsername'
                },
            };
            request(options, function (error, response, body) {
                if (error) {
                    console.error('Failed to get top posts: ' + error.message);
                    process.exit(1);
                } else {
                    data = JSON.parse(body);
                    // Printing out the url of the image
                    console.log(data);
                    // Get the list of previews for the first image, go through the resolutions and pick appropriate sizes
                    var previews = data.data.children[0].data.preview.images[0];
                    var smallPreview = _.find(previews.resolutions, function(item) { return item.width >= 720 || item.height >= 480; });
                    var largePreview = _.find(previews.resolutions, function(item) { return item.width >= 1200 || item.height >= 800; });

                    // If none of the images met the small criteria, choose the first one
                    if (!smallPreview) {
                        smallPreview = _.first(previews.resolutions);
                    }
                    // If none of the images met the large criteria, choose the last one
                    if (!largePreview) {
                        largePreview = _.last(previews.resolutions);
                    }

                    if (smallPreview) {
                        var smallPreviewDecoded = smallPreview.url.replace(/&amp;/g, "&");
                        writeToFile(smallPreviewDecoded, `small${subreddit}.jpg`);
                    }

                    if (largePreview) {
                        var largePreviewDecoded = largePreview.url.replace(/&amp;/g, "&");
                        writeToFile(largePreviewDecoded, `large${subreddit}.jpg`);
                    }
                }
            });
        }
    });
};

getRedditImages('cats');

// rl.question("What subreddit would you like to browse?", function(sub) {
//     getRedditImages(sub);
    
// 	rl.setPrompt("What subreddit would you like to browse?");

// 	rl.prompt();

// 	rl.on('line', function(subreddit) {
//             getRedditImages(subreddit);
// 		    rl.prompt();
// 		}

// 	);

// });