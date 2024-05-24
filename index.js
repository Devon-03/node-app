require('dotenv').config();
const Twitter = require('twitter'); //interacts with twitter API
const SpotifyWebApi = require('spotify-web-api-node'); //interacts with spotify API
const readline = require('readline'); //reading input in command

// Twitter API client configuration
const twitterClient = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

//Spotify API clientn configuration
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

// Retrieve Spotify access token
spotifyApi.clientCredentialsGrant().then(
    function(data) {
        spotifyApi.setAccessToken(data.body['access_token']);
    },
    function(err) {
        console.error('Access token not found', err);
    }
);
// Function to get 20 latest tweets and creation date
function getLatestTweets(username, count = 20) {
    twitterClient.get('statuses/user_timeline', { screen_name: username, count }, function(error, tweets, response) {
        if (error) {
            console.error('Error fetching tweets:', error);
            return;
        }
        tweets.forEach(tweet => {
            console.log(`- ${tweet.text} (Created at: ${tweet.created_at})`);
        });
    });
}
// Function to search for a song on Spotify
function searchSongOnSpotify(songName) {
    spotifyApi.searchTracks(`song:${songName}`).then(
        function(data) {
            const track = data.body.tracks.items[0];
            if (track) {
                console.log(`Artist(s): ${track.artists.map(artist => artist.name).join(', ')}`);
                console.log(`Song: ${track.name}`);
                console.log(`Preview: ${track.preview_url}`);
                console.log(`Album: ${track.album.name}`);
            } else {
                console.log('Song not found try again');
            }
        },
        function(err) {
            console.error('Error fetching:', err);
        }
    );
}
// Interface
const cmd = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

cmd.question('Enter command (tweets <username> <count> or song <song name>): ', (answer) => {
    const [command, ...args] = answer.split(' ');

    if (command === 'tweets') {
        const [username, count] = args;
        getLatestTweets(username, count);
    } else if (command === 'song') {
        const songName = args.join(' ');
        searchSongOnSpotify(songName);
    } else {
        console.log('Unknown command');
    }

    cmd.close();
});
