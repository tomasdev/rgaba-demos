/**
 * @author: Tomas Roggero, designed by Andres Pagella
 * CURRENT STATUS
 *
 * - Currently using REST API
 * - Tweets dont get updated (no live movement)
 * - Plenty of TODOs
 */

// TODO: you should be able to add as many twitter accounts / lists as you want ;)

var USERNAMES = {
    tech: ['gizmodo', 'verge', 'techcrunch', 'engadget', 'mashable', 'wired', 'lifehacker',
            'smashingmag', 'RWW']
};

var SELECTED = USERNAMES.tech;

// TODO: throttle requests ?
// TODO: save on localstorage!
(function(window, jQuery) {

    var $terms,
        $second,
        run,
        updateView,
        getData,
        parseTweets,
        onDocumentReady,
        collection;

    run = function() {
        for (var i = 0, blog; blog = SELECTED[i++]; ) {
            getData(blog, function(response) {
                parseTweets(response);
            });
        }

        updateView();
    };

    updateView = function() {
        // TODO: order by DATE
        // TODO: add filter by DATE
        // TODO: animate tweets moving
        // TODO: only 1 tweet per blog ??
        // TODO: array texts could look better
        if (collection.length) {
            var influential = [];
            var influentialDone = [];
            var done = {};
            collection.filter(function(a) {
                if (!done[a.user] || done[a.user].followers < a.followers) {
                    done[a.user] = a;
                }
            });
            for (var blog in done) {
                influentialDone.push(done[blog]);
            }
            influentialDone.sort(function(a, b) {
                return b.followers - a.followers;
            });
            for (var i = 0, item; i < 5; i++) {
                item = influentialDone[i];
                if (!item) { continue; }
                // console.log(item);
                influential.push('<li>');
                    influential.push('<img src="' + item.avatar + '" alt="" />');
                    influential.push('<div>');
                        influential.push('<strong>@' + item.user + '</strong>');
                        influential.push('<p>' + item.tweet + '</p>');
                        influential.push('<span>' + item.followers + ' followers</span>');
                    influential.push('</div>');
                influential.push('</li>');
            }

            var relevant = [];
            var relevantDone = [];
            done = {};
            collection.filter(function(a) {
                if (!done[a.user] || done[a.user].retweets < a.retweets) {
                    done[a.user] = a;
                }
            });
            for (var blog in done) {
                relevantDone.push(done[blog]);
            }
            relevantDone.sort(function(a, b) {
                return b.retweets - a.retweets;
            });
            for (var i = 0, item; i < 5; i++) {
                item = relevantDone[i];
                if (!item) { continue; }
                relevant.push('<li>');
                    relevant.push('<img src="' + item.avatar + '" alt="" />');
                    relevant.push('<div>');
                        relevant.push('<strong>@' + item.user + '</strong>');
                        relevant.push('<p>' + item.tweet + '</p>');
                        relevant.push('<span>' + item.retweets + ' retweets</span>');
                    relevant.push('</div>');
                relevant.push('</li>');
            }

            // TODO: make these fancy
            $('#influential').html(influential.join(''));
            $('#relevant').html(relevant.join(''));

            $('.first').fadeOut(300);
            $second.parent().show();
            $second.not(':visible') && $second.fadeIn(300);
        }

        // TODO: get more tweets!
        setTimeout(updateView, 5000);
    };

    getData = function(username, callback) {
        $.getJSON('http://api.twitter.com/1/statuses/user_timeline.json?include_rts=true&screen_name=' + username + '&callback=?&count=100', function(response) {
            // console.log(response);
            callback(response);
        });
    };

    parseTweets = function(arrTweets) {
        for (var i = 0, item; item = arrTweets[i++]; ) {
            // console.log(item);
            collection.push({
                user: item.user.screen_name,
                date: new Date(item.created_at),
                avatar: item.user.profile_image_url,
                followers: item.user.followers_count,
                tweet: item.text,
                retweets: item.retweet_count || 0
            });
        }
        window.collection = collection;
    };

    onDocumentReady = function() {
        collection = [];
        $second = $('.second .row');
        run();
    };

    $(onDocumentReady);

}(window, $));