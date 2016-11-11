(function () {
    var initialPos = document.body.scrollTop;

    var pages = document.getElementsByClassName('page-pos');

    var timeout = null;
    var scrollByUser = true;
    document.onscroll = function (event) {
        if (scrollByUser) {
            var direction = document.body.scrollTop - initialPos;
            initialPos = document.body.scrollTop;

            var hash = '';
            var page = {};
            if (direction > 0) {
                for (var i = 0; i < pages.length; i++) {
                    var diff = document.body.scrollTop - pages[i].offsetTop;
                    if (diff < 0) {
                        // location.hash = pages[i].name;
                        hash = pages[i].name;
                        page = pages[i];
                        break;
                    }
                }
            } else if (direction < 0) {
                for (var j = pages.length - 1; j >= 0; j--) {
                    var diff = document.body.scrollTop - pages[j].offsetTop;
                    if (diff > 0) {
                        // location.hash = pages[j].name;
                        hash = pages[j].name;
                        page = pages[j];
                        break;
                    }
                }
            }

            clearTimeout(timeout);
            timeout = setTimeout(function () {
                if (!hash) {
                    for (var i = 0; i < pages.length; i++) {
                        if (i === 0) {
                            var diff = document.body.scrollTop - pages[i].offsetTop;
                            if (diff <= 0) {
                                // location.hash = pages[i].name;
                                hash = pages[i].name;
                                page = pages[i];
                                break;
                            }
                        } else {
                            var diff1 = document.body.scrollTop - pages[i - 1].offsetTop;
                            var diff2 = document.body.scrollTop - pages[i].offsetTop;
                            if (diff2 <= 0) {
                                if (Math.abs(diff2) < Math.abs(diff1)) {
                                    hash = pages[i].name;
                                    page = pages[i];
                                } else {
                                    hash = pages[i - 1].name;
                                    page = pages[i - 1];
                                }
                            }

                            break;
                        }
                    }
                }

                if (hash) {
                    // location.hash = hash;
                    $(document.body).animate({
                        scrollTop: page.offsetTop
                    }, 300, function () {
                        location.hash = hash;
                        scrollByUser = false;
                    });
                } else {
                    debugger;
                }

                console.log('scroll end by user.');
            }, 50);
        } else {
            clearTimeout(timeout);
            timeout = setTimeout(function () {
                scrollByUser = true;
                console.log('scroll end by machine');
            }, 50);
        }
    };
})();