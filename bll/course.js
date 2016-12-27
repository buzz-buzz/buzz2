'use strict';

const fs = require('fs');

module.exports = {
    list: function () {
        let smilPath = __dirname + '/../resource/smil';
        let files = fs.readdirSync(smilPath);

        let history = {
            byDate: {},
            byLevel: {}
        };

        files.map(function (file) {
            var stats = fs.statSync(smilPath + '/' + file);

            if(stats.isFile()) {
                let parts = file.split('-');
                let date = parts.slice(0, 3).join('-');
                if (parts.length == 4) {
                    let level = parts[3].split('.')[0];

                    if (!history.byDate[date]) {
                        history.byDate[date] = [];
                    }

                    history.byDate[date].push(level);

                    if (!history.byLevel[level]) {
                        history.byLevel[level] = [];
                    }

                    history.byLevel[level].push(date);
                }
            }
        });

        return history;
    }
};