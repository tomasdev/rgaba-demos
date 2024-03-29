/**
 * @author: Tomas Roggero, designed by Andres Pagella
 * CURRENT STATUS
 *
 * - Currently using REST API
 * - Slider by dates (10 days setup)
 * - Plenty of TODOs
 */

// TODO: you should be able to add as many twitter accounts / lists as you want ;) #POSTPONED
// TODO: throttle requests ?

var USERNAMES = {
    tech: ['gizmodo', 'verge', 'techcrunch', 'engadget', 'mashable', 'wired', 'lifehacker', 'smashingmag', 'RWW']
};

var SELECTED = USERNAMES.tech;

(function(window, jQuery) {

    var $terms,
        $second,
        $range,
        run,
        createDates,
        perDate,
        createMarkup,
        updateView,
        getData,
        parseTweets,
        smallDate,
        onDocumentReady,
        collection;

    var DAY = 24 * 60 * 60 * 1000,
        PREV_DAYS = 7;

    run = function() {
        if (!localStorage.getItem('collection')) {
            for (var i = 0, blog; blog = SELECTED[i++]; ) {
                getData(blog, function(response) {
                    parseTweets(response);
                });
            }
        } else {
            collection = JSON.parse(localStorage.getItem('collection'));
        }

        createDates();
        updateView();
    };

    createDates = function() {
        var updateDates = function( event, ui ) {
                var now = +new Date(),
                    start = smallDate(now - (PREV_DAYS - ui.values[0]) * DAY),
                    end = smallDate(now - (PREV_DAYS - ui.values[1]) * DAY);
                $( '#amount' ).text( start + ' - ' + end );
                // console.log(ui.values);
            };
        $range.slider({
            range: true,
            min: 0,
            max: PREV_DAYS,
            values: [0, PREV_DAYS],
            slide: updateDates,
            change: updateView
        });
        updateDates(null, {values:[0, PREV_DAYS]});
    };

    perDate = {
        init: function() {
            var range = $range.slider('values'),
                now = +new Date(),
                minDate = now - (PREV_DAYS - range[0]) * DAY,
                maxDate = now - (PREV_DAYS - range[1]) * DAY;
            // console.log(range, 'range');
            return function(element) {
                // TODO: resolve this properly #POSTPONED
                var d = +new Date(element.date);
                return (minDate != maxDate) ?
                            (d >= minDate && d <= maxDate) :
                            (d >= minDate && d <= (minDate + DAY));
            };
        }
    };

    createMarkup = function(arr, item, property) {
        arr.push('<li class="hidden">');
        arr.push('<blockquote class="twitter-tweet">');
        arr.push('<p>' + item.tweet + '</p>');
        arr.push('&mdash; ' + item.user + ' (@' + item.username + ')');
        arr.push('<a href="https://twitter.com/' + item.username + '/status/' + item.id + '" data-datetime="' + item.date + '"></a>');
        arr.push('</blockquote>');
        arr.push('</li>');
    };

    updateView = function() {
        // TODO: animate tweets moving #IMPROVE
        // TODO: only 1 tweet per blog ?? #OPTIMIZE
        if (collection.length) {
            var influential = [];
            var influentialDone = [];
            var done = {};
            collection = collection.filter(perDate.init());
            // console.log(collection.length);
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
                createMarkup(influential, item, 'followers');
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
                createMarkup(relevant, item, 'retweets');
            }

            $('#influential')
                .find('li').addClass('remove').end()
                .append(influential.join(''))
                .find('li').fadeIn(300);
            $('#relevant')
                .find('li').addClass('remove').end()
                .append(relevant.join(''))
                .find('li').fadeIn(300);

            twttr.widgets && twttr.widgets.load();

            setTimeout(function() {
                $('li.remove').remove();
            }, 300);

            $('.first').fadeOut(300);
            $second.parent().show();
            $second.not(':visible') && $second.fadeIn(300);

            collection = JSON.parse(localStorage.getItem('collection'));
        } else {
            // TODO: get more tweets? #POSTPONED
            setTimeout(updateView, 5000);
        }
    };

    getData = function(username, callback) {
        $.getJSON('http://api.twitter.com/1/statuses/user_timeline.json?exclude_replies=true&include_rts=true&screen_name=' + username + '&callback=?&count=100', function(response) {
            // console.log(response);
            callback(response);
        });
    };

    parseTweets = function(arrTweets) {
        for (var i = 0, item; item = arrTweets[i++]; ) {
            // console.log(item);
            collection.push({
                id: item.id_str,
                username: item.user.screen_name,
                user: item.user.name,
                date: item.created_at,
                avatar: item.user.profile_image_url,
                followers: item.user.followers_count,
                tweet: item.text,
                retweets: item.retweet_count || 0
            });
        }
        localStorage.setItem('collection', JSON.stringify(collection));
    };

    smallDate = function(timestamp) {
        var d = new Date(timestamp);
        return d.getDate() + '/' + (d.getMonth()+1) + '/' + d.getFullYear();
    };

    onDocumentReady = function() {
        collection = [];
        $second = $('.second .row');
        $range = $('#range');
        run();
    };

    $(onDocumentReady);

}(window, $));