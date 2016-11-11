(function () {
    var initialPos = document.body.scrollTop;

    var pages = document.getElementsByClassName('page-pos');
    console.log(pages);

    var timeout = null;
    var scrollByUser = true;
    document.onscroll = function (event) {
        if (scrollByUser) {
            var direction = document.body.scrollTop - initialPos;
            initialPos = document.body.scrollTop;
            console.log(direction);

            var hash = '';
            if (direction > 0) {
                for (var i = 0; i < pages.length; i++) {
                    var diff = document.body.scrollTop - pages[i].offsetTop;
                    if (diff < 0) {
                        console.log(pages[i]);
                        // location.hash = pages[i].name;
                        hash = pages[i].name;
                        break;
                    }
                }
            } else if (direction < 0) {
                for (var j = pages.length - 1; j >= 0; j--) {
                    var diff = document.body.scrollTop - pages[j].offsetTop;
                    if (diff > 0) {
                        console.log(pages[j]);
                        // location.hash = pages[j].name;
                        hash = pages[j].name;
                        break;
                    }
                }
            }

            clearTimeout(timeout);
            timeout = setTimeout(function () {
                if (hash) {
                    location.hash = hash;
                    scrollByUser = false;
                }
            }, 50);
        } else {
            clearTimeout(timeout);
            timeout = setTimeout(function () {
                scrollByUser = true;
            }, 50);
        }
    };
})();