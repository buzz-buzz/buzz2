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
            fs.stat(file, function(err, stats) {
                if (!err){
                    if(!stats.isDirectory()){
                        let parts = file.split('-');
                        let date = parts.slice(0, 3).join('-');
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
        });

        return history;
    }
};