// ChatWars QuestBot (c) 2017 d0as8
(function QuestBot() {
    'use strict';

    function getTimeString(d) {
        d = d || new Date();
        return d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
    }

    function log() {
        console.info(getTimeString(), 'QuestBot: ', arguments);
    }

    function debug() {
        console.debug(getTimeString(), 'QuestBot: ', arguments);
    }

    function formula(a, b, c) {
        return Math.round(b * (1 + a/c) );
    }

    function timeoutGenerator(a, b) {
        return function () {
            return formula(Math.random(), a, b);
        }
    }

    function checkGW(timeout) {
        var gwHours = [7,11,15,19,23];
        var maxMin = 45;
        var minMin = 7;

        var hour = timeout.getHours();
        var min  = timeout.getMinutes();

        if (-1 != gwHours.indexOf(hour)   && min >= maxMin) {
            timeout.setHours(hour+1, minMin+1)
        }
        else if (-1 != gwHours.indexOf(hour-1) && min <= minMin) {
            timeout.setHours(hour, timeoutGenerator(minMin, 4)());
        }

        return timeout;
    }

    function mainProcess(TASKS) {
        log('Start');

        var TIMEOUT = new Date();

        setTimeout(function run() {
            var current = new Date();

            if (TIMEOUT.getTime() <= current.getTime()) {
                var task = TASKS.shift();

                // true - next
                // false - repeat
                var state = 1;
                if (task.hasOwnProperty('handler')) {
                    log('Execute ' + task.cmd);
                    state = task.handler();
                }

                if (state) {
                    TASKS.push(task);

                    var timeout = ('function' == typeof(task.timeout)
                        ? task.timeout()
                        : task.timeout);

                    TIMEOUT.setTime(new Date().getTime() + 1000 * timeout);
                    TIMEOUT = checkGW(TIMEOUT);

                    log('Awake in ' + timeout + ' secs and execute ' + TASKS[0].cmd, getTimeString(TIMEOUT));
                } else {
                    TASKS.unshift(task);

                    debug('Bad handler response for ' + task.cmd, 'Wait');
                }
            } else {
                debug('Skip, ' + Math.round((TIMEOUT.getTime() - current.getTime()) / 1000) + ' secs left', getTimeString(TIMEOUT));
            }

            setTimeout(run, 1000);
        }, 5000);
    }


    function searchControl(name) {
        var control = false;

        $('div.reply_markup').find('button.btn.reply_markup_button').each(function() {
            if ($(this).text().match(name)) {
                control = $(this);

                return false; // break each loop
            }
        });

        return control;
    }

    function click (name, isOptional) {
        var control = searchControl(name);

        if (!control) return isOptional;

        control.css('background-color', 'green');
        control.click();
        log('CLICK ' + control.text());

        return true;
    }

    function clickGenerator (name, isOptional) {
        return function () {
            return click(name, isOptional);
        }
    }


    function select (options) {
        return options[Math.floor(Math.random() * options.length)];
    }

    var timeout = timeoutGenerator(3, 2)();

    function battle () {
        // battle is over
        if (searchControl('Герой')) return true;

        if ($('div.reply_markup').is(':visible')) {
            // Atack
            if (0<timeout) {
                timeout--;
                return false;
            }

            if (searchControl('в голову')) {
                click(select(['в голову', 'по корпусу', 'по ногам', 'в голову', 'по корпусу', 'по ногам', 'в голову', 'по корпусу', 'по ногам']));
                timeout = timeoutGenerator(2, 0.5)();
            }
            // Def
            else if (searchControl('головы')) {
                click(select(['головы', 'корпуса', 'ног', 'головы', 'корпуса', 'ног', 'головы', 'корпуса', 'ног']));
                timeout = timeoutGenerator(3, 2)();
            }
        }

        // try again
        return false;
    }

    var defenceScenario = [
        {
            cmd: 'Назад',
            handler: clickGenerator('Назад', true),
            timeout: timeoutGenerator(2, 1)
        },
        {
            cmd: 'Защита',
            handler: clickGenerator('Защита'),
            timeout: timeoutGenerator(2, 1)
        },
        {
            cmd: 'Замок',
            handler: clickGenerator(''),
            timeout: timeoutGenerator(2, 1)
        },
        {
            cmd: 'Герой',
            handler: clickGenerator('Герой', true),
            timeout: timeoutGenerator(30, 1)
        }
        ];

    var scenario = [
        {
            cmd: 'Назад',
            handler: clickGenerator('Назад', true),
            timeout: timeoutGenerator(2, 1)
        },
        {
            cmd: 'Герой',
            handler: clickGenerator('Герой', true),
            timeout: timeoutGenerator(2, 1)
        },
        {
            cmd: 'Замок',
            handler: clickGenerator('Замок'),
            timeout: timeoutGenerator(2, 1)
        },
        {
            cmd: 'Арена',
            handler: clickGenerator('Арена'),
            timeout: timeoutGenerator(2, 1)
        },
        {
            cmd: 'Поиск соперника',
            handler: clickGenerator('Поиск соперника'),
            timeout: timeoutGenerator(2, 1)
        },
        {
            cmd: 'Бой',
            handler: battle,
            timeout: timeoutGenerator(7, 1)
        },
        {
            cmd: 'Герой',
            handler: clickGenerator('Герой', true),
            timeout: 0
        },



        {
            cmd: 'Квесты',
            handler: clickGenerator('Квесты'),
            timeout: timeoutGenerator(2, 1)
        },
        {
            cmd: 'Лес',
            handler: clickGenerator('Лес'),
            timeout: timeoutGenerator(300, 5)
        },
        {
            cmd: 'Герой',
            handler: clickGenerator('Герой', true),
            timeout: timeoutGenerator(15, 1)
        },



        {
            cmd: 'SLEEP',
            timeout: timeoutGenerator(60 * 55, 20)
        },
    ];

    mainProcess(scenario);

})();
