(function () {
    var pages = document.getElementsByClassName('page-pos');

    var page2Header = document.getElementById('page-2-header');
    var page2 = document.getElementsByClassName('page-pos')[1].nextSibling;
    var originalPos = page2Header.parentNode;
    var moved = false;

    function adjustPage2Header(event) {
        var scrollTop = event.pageY || document.body.scrollTop || window.pageYOffset;

        if (scrollTop > document.getElementById('buzz-header').offsetHeight) {
            if (!moved) {
                page2.insertBefore(page2Header, page2.firstChild);
                moved = true;
            }
        } else {
            originalPos.appendChild(page2Header);
            moved = false;
        }
    }

    function handleClassName(event) {
        for (var i = 0; i < pages.length; i++) {
            var scrollTop = event.pageY || document.body.scrollTop || window.pageYOffset;

            if (pages[i].offsetTop - scrollTop < document.getElementById('buzz-header').offsetHeight) {
                if (pages[i].nextSibling.className.indexOf('with-header') < 0) {
                    pages[i].nextSibling.className += ' ' + 'with-header';
                }
            } else {
                pages[i].nextSibling.className = pages[i].nextSibling.className.replace(/ *with-header */, '');
            }
        }
    }

    function handlePageScroll(event) {
        var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        console.log('height = ', h);
        adjustPage2Header(event);
        handleClassName(event);
    }

    document.onscroll = handlePageScroll;
})();