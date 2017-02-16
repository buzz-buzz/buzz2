angular.module('educationModule', [])
    .value('GradeDisplay', {
        3: '三年级',
        4: '四年级',
        5: '五年级',
        6: '六年级',
        7: '七年级',
        8: '八年级',
        9: '九年级'
    })
    .value('LevelDisplay', {
        A: '进阶',
        B: '基础'
    })
    .value('Grades', [
        {
            key: '3',
            name: '三年级'
        }, {
            key: '4',
            name: '四年级'
        }, {
            key: '5',
            name: '五年级'
        }, {
            key: '6',
            name: '六年级'
        }, {
            key: '7',
            name: '七年级'
        }, {
            key: '8',
            name: '八年级'
        }, {
            key: '9',
            name: '九年级'
        }
    ])
;