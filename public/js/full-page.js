(function () {
    var pages = document.getElementsByClassName('page-pos');

    document.onscroll = function (event) {
        for (var i = 0; i < pages.length; i++) {
            if (pages[i].offsetTop - document.body.scrollTop < document.getElementById('buzz-header').offsetHeight) {
                if (pages[i].nextSibling.className.indexOf('with-header') < 0) {
                    pages[i].nextSibling.className += ' ' + 'with-header';
                }
            } else {
                pages[i].nextSibling.className = pages[i].nextSibling.className.replace(/ *with-header */, '');
            }
        }
    };
})();