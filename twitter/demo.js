/**
 * @author: Tomas Roggero, designed by Andres Pagella
 * CURRENT STATUS
 *
 * - Currently using REST API
 * - Slider by dates (10 days setup)
 * - Plenty of TODOs
 */

// TODO: you should be able to add as many twitter accounts / lists as you want ;) #POSTPONED

var USERNAMES = {
    tech: ['gizmodo', 'verge', 'techcrunch', 'engadget', 'mashable', 'wired', 'lifehacker', 'smashingmag', 'RWW']
// tech: [         'RWW']
};

var SELECTED = USERNAMES.tech;

// TODO: throttle requests ?
// TODO: save on localstorage!
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

    run = function() {
        for (var i = 0, blog; blog = SELECTED[i++]; ) {
            getData(blog, function(response) {
                parseTweets(response);
            });
        }

        createDates();
        updateView();
    };

    createDates = function() {
        var day = 24 * 60 * 60 * 1000,
            prevDays = 10,
            updateDates = function( event, ui ) {
                var now = +new Date(),
                    start = smallDate(now - (prevDays - ui.values[0]) * day),
                    end = smallDate(new Date() - (prevDays - ui.values[1]) * day);
                $( '#amount' ).text( start + ' - ' + end );
                updateView();
                // console.log(ui.values);
            };
        $range.slider({
            range: true,
            min: 0,
            max: prevDays,
            values: [0, prevDays],
            slide: updateDates
        });
        updateDates(null, {values:[0, prevDays]});
    };

    perDate = {
        init: function() {
            $range.slider('values');
            return function() {

            // console.log(range, 'range');
                // TODO: resolve this properly #POSTPONED
            };
        }
    };

    createMarkup = function(arr, item, property) {
        arr.push('<li class="hidden">');
        arr.push('<img src="' + item.avatar + '" alt="" />');
        arr.push('<div>');
        arr.push('<strong>@' + item.user + '</strong>');
        arr.push('<p>' + item.tweet + '</p>');
        arr.push('<span>' + item[property] + ' ' + property + '</span>');
        arr.push('</div>');
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

            setTimeout(function() {
                $('li.remove').remove();
            }, 300);

            $('.first').fadeOut(300);
            $second.parent().show();
            $second.not(':visible') && $second.fadeIn(300);
        } else {
            // TODO: get more tweets? #POSTPONED
            setTimeout(updateView, 5000);
        }
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