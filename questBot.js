// ChatWars QuestBot (c) 2017 d0as8
(function QuestBot() {
    'use strict';



    var SCRIPT_NAME = 'QuestBot v2';



    Date._align = function(value) {
        return (0 <= value && 9 >= value) ?
            '0' + value :
            value;
    };

    Date.prototype.getTimeString = function() {
        return Date._align(this.getHours()) + ':' + Date._align(this.getMinutes()) + ':' + Date._align(this.getSeconds());
    };

    Date.prototype.setDelayInSecs = function(secs) {
        this.setTime(this.getTime() + 1000 * secs);

        return this;
    };

    Date.prototype.getDiffInSecs = function(date) {
        return Math.round((this.getTime() - date.getTime()) / 1000);
    };



    // todo add modules

    // todo DI
    function Log() {}

    Log.script = SCRIPT_NAME;

    Log.info = function() {
        Array.prototype.unshift.call(
            arguments,
            new Date().getTimeString(),
            Log.script + ':');

        console.info.apply(this, arguments);
    };

    Log.debug = function() {
        Array.prototype.unshift.call(
            arguments,
            new Date().getTimeString(),
            Log.script + ':');

        console.debug.apply(this, arguments);
    };




    function Timeout() {}

    Timeout.formula = function(rand, base, delta, offset) {
        return Math.round(base * (1 + rand / delta) + offset);
    };

    Timeout.generator = function(base, delta, offset) {
        return function() {
            return Timeout.formula(Math.random(), base, delta || 999, offset || 0);
        }
    };




    function Tools() {}

    Tools.isFunction = function(expression) {
        return 'function' == typeof(expression);
    };

    Tools.selectAny = function(elements) {
        return elements[Math.floor(Math.random() * elements.length)];
    };


    Tools.fixedCharCodeAt = function fixedCharCodeAt(str, idx) {
        // например, fixedCharCodeAt('\uD800\uDC00', 0); // 65536
        // например, fixedCharCodeAt('\uD800\uDC00', 1); // false
        idx = idx || 0;
        var code = str.charCodeAt(idx);
        var hi, low;

        // Старшая часть суррогатной пары (последнее число можно изменить на 0xDB7F,
        // чтобы трактовать старшую часть суррогатной пары в частной плоскости как
        // одиночный символ)
        if (0xD800 <= code && code <= 0xDBFF) {
            hi = code;
            low = str.charCodeAt(idx + 1);
            if (isNaN(low)) {
                throw 'Старшая часть суррогатной пары без следующей младшей в fixedCharCodeAt()';
            }
            return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
        }
        if (0xDC00 <= code && code <= 0xDFFF) { // Младшая часть суррогатной пары
            // Мы возвращаем false, чтобы цикл пропустил эту итерацию, поскольку суррогатная пара
            // уже обработана вsit в предыдущей итерации
            return false;
            /*hi = str.charCodeAt(idx - 1);
            low = code;
            return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;*/
        }
        return code;
    }

    Tools.cmp = function(a, b) {
        var as = Tools.sign(a);
        var bs = Tools.sign(b);

        Log.debug(a, as.join(','));
        Log.debug(b, bs.join(','));

        return Tools.correlation(as, bs);
    }

    Tools.sign = function(a) {
        var s = [];
        for (var i = 0; i < a.length; i++) {
            s.push(Tools.fixedCharCodeAt(a, i));
        }

        return s;
    }

    Tools.correlation = function(p1, p2) {
        if (p1.length > p2.length) {
            var c = p1;
            p1 = p2;
            p2 = c;
        }

        var m = 0;
        for (var i = 0; i < p1.length; i++) {
            for (var j = 0; j < p2.length; j++) {
                if (p1[i] == p2[j]) {
                    m++;
                    p2.splice(j, 1);

                    break;
                }
            }
        }

        m = (m / p1.length ).toFixed(3);

        Log.debug(100 * m + '%');

        return m;
    }


    function ChatWars() {}

    ChatWars.battleHours = [-1, 3, 7, 11, 15, 19, 23];
    ChatWars.safeMinutes = [8, 45];
    ChatWars.isBattleTime = function(date) {
        var hour = date.getHours();
        var min = date.getMinutes();

        return (-1 != ChatWars.battleHours.indexOf(hour) && min >= ChatWars.safeMinutes[1]) ||
            (-1 != ChatWars.battleHours.indexOf(hour - 1) && min <= ChatWars.safeMinutes[0]);
    };

    ChatWars.arenaStopDay = 3; // Wednesday
    ChatWars.arenaStopHour = 20;
    ChatWars.arenaStopMinutes = [0, 40];
    ChatWars.isArenaStopTime = function(date) {
        var day = date.getDay();
        var hour = date.getHours();
        var min = date.getMinutes();

        return ChatWars.arenaStopDay == day &&
            ChatWars.arenaStopHour == hour &&
            min >= ChatWars.arenaStopMinutes[0] &&
            min <= ChatWars.arenaStopMinutes[1];
    };

    ChatWars.pubHours = [8, 20];
    ChatWars.isPubTime = function(date) {
        var hour = date.getHours();

        return ChatWars.pubHours[0] >= hour || ChatWars.pubHours[1] <= hour;
    };

    ChatWars.dayHours = [9, 23];
    ChatWars.isDay = function(date) {
        var hour = date.getHours();

        return ChatWars.dayHours[0] <= hour && ChatWars.dayHours[1] >= hour;
    };

    ChatWars.castles = {
        white: "🇨🇾",
        black: "🇬🇵",
        yellow: "🇻🇦",
        red: "🇮🇲",
        blue: "🇪🇺"
    };







    function Telegram() {}

    Telegram.composerArea = function() {
        return $('div.composer_rich_textarea');
    };

    Telegram.sendButton = function() {
        return $('button[type=submit]');
    };

    Telegram.controlPanel = function() {
        return $('div.im_send_keyboard_wrap');
    };

    Telegram.controlButtons = function() {
        return $('div.im_send_keyboard_wrap button.btn.reply_markup_button');
    };

    Telegram.messages = function() {
        return $('div.im_history_message_wrap div.im_message_text');
    };



    function View() {}

    View.searchControl = function(name) {
        var control = false;
        var max = 0;

        Telegram.controlButtons().each(function() {
            var c = Tools.cmp($(this).text(), name);
            Log.debug('COMPARE "' + $(this).text() + '" WITH "' + name + '" - ' + 100 * c + '%');

            if (max < c) {
                control = $(this);
                max = c;
            }
        });

        return 0.8 < max
            ? control
            : false;
    };

    View.searchAllControls = function() {
        var controls = [];

        Telegram.controlButtons().each(function() {
            controls.push($(this));
        });

        return controls;
    };

    View.controlPanelIsVisible = function() {
        return Telegram.controlPanel().is(':visible');
    };

    View.clickControl = function(control, isOptional) {
        if (!control) return isOptional;

        control.css('background-color', 'green');
        control.click();
        Log.debug('Click control "' + control.text() + '"');

        return true;
    };

    View.click = function(name, isOptional) {
        return View.clickControl(View.searchControl(name), isOptional);
    };

    View.clickGenerator = function(name, isOptional) {
        return function() {
            return View.click(name, isOptional);
        }
    };

    View.executeCommand = function(name, isOptional) {
        if (!Telegram.composerArea() || !Telegram.sendButton())
            return isOptional;

        Telegram.composerArea().text(name);
        Telegram.sendButton().trigger('mousedown');

        Log.debug('Execute command "' + name + '"');

        return true;
    };

    View.executeCommandGenerator = function(name, isOptional) {
        return function() {
            return View.executeCommand(name, isOptional);
        }
    };


    View.searchAllMessages = function() {
        return Telegram.messages();
    };








    function Action(name, handler, timeout) {
        this.name = name;

        this.handler = Tools.isFunction(handler) ?
            handler :
            function() {
                return !!handler
            };

        this.timeout = Tools.isFunction(timeout) ?
            timeout :
            function() {
                return timeout
            };
    }

    Action.prototype.getTimeout = function() {
        return this.timeout();
    };

    Action.prototype.execute = function() {
        return this.handler();
    };




    function Statistics() {
        this.start = new Date();
        this.m = {};
    }

    Statistics.prototype.update = function(category, name, last) {
        if (!this.m.hasOwnProperty(category))
            this.m[category] = {};

        if (!this.m[category].hasOwnProperty(name))
            this.m[category][name] = {
                count: 0,
                last: []
            };

        this.m[category][name].count++;
        this.m[category][name].last.unshift(last);

        if (5 < this.m[category][name].last.length)
            this.m[category][name].last.pop();
    };

    Statistics.prototype.get = function() {
        var res = '\nWas started at ' + this.start + ' (' + (new Date().getDiffInSecs(this.start) / 60 / 60).toFixed(2) + ' hours ago)\n';
        for (var cat in this.m) {
            res += '"' + cat + '":\n';

            for (var i in this.m[cat]) {
                res += '\t"' + i + '" - ' + this.m[cat][i].count + ' (' +
                    this.m[cat][i].last.map(function(e) {
                        return e.getTimeString();
                    }).join(', ') + ')\n';
            }
        }

        return res;
    };




    function Scenario(name, trigger, actions) {
        this.name = name;
        this.trigger = Tools.isFunction(trigger) ?
            trigger :
            function() {
                return !!trigger
            };

        this.actions = actions;
        this.current = 0;
        this.lastExecute = new Date().setDelayInSecs(-60 * 60); // 1 hour ago
    }

    Scenario.prototype.canBeTriggered = function(currentDate) {
        return this.trigger(this.lastExecute, currentDate);
    };

    Scenario.prototype.currentAction = function() {
        return this.actions[this.current];
    };

    Scenario.prototype.isLastAction = function() {
        return this.current == this.actions.length - 1;
    };

    Scenario.prototype.nextAction = function() {
        this.current = this.actions.length <= this.current + 1 ?
            0 :
            this.current + 1;

        return this.actions[this.current];
    };




    function Application(scenarios, statistics) {
        this.mark = new Date();

        this.scenarios = scenarios;
        this.currentScenario = null;

        this.statistics = statistics;
    }

    Application.asyncRun = function(application, delay, firstDelay) {
        delay = delay || 1000;
        firstDelay = firstDelay || delay;

        setTimeout(function _iteration() {

            application.run();

            setTimeout(_iteration, delay);
        }, firstDelay);
    };

    Application.prototype._pickScenario = function(currentDate) {

        var scenario = Tools.selectAny(this.scenarios);
        Log.debug('Attempt scenario "' + scenario.name + '"');

        if (scenario.canBeTriggered(currentDate)) {
            this.currentScenario = scenario;

            Log.info('Select new scenario "' + scenario.name + '"');
        }

    };

    Application.prototype._unpickScenario = function(currentDate) {

        this.currentScenario.lastExecute = currentDate;
        this.currentScenario = null;

    };

    Application.prototype.run = function() {

        var currentMark = new Date();

        if (!this.currentScenario)
            this._pickScenario(currentMark);

        if (this.currentScenario && 0 <= currentMark.getDiffInSecs(this.mark)) {

            var action = this.currentScenario.currentAction();
            var isLast = this.currentScenario.isLastAction();

            Log.debug('Execute action "' + action.name + '"');
            if (action.execute()) {
                if (this.statistics)
                    this.statistics.update('Actions', action.name, currentMark);

                var timeout = action.getTimeout();
                this.mark = currentMark.setDelayInSecs(timeout);

                this.currentScenario.nextAction();

                if (isLast) {
                    if (this.statistics)
                        this.statistics.update('Scenarios', this.currentScenario.name, currentMark);

                    this._unpickScenario(currentMark);

                    Log.info('Waiting next scenario...');
                } else {
                    Log.debug('Awake in ' + timeout + ' secs and execute action "' + this.currentScenario.currentAction().name + '" (' + this.mark.getTimeString() + ')');
                }
            } else {
                Log.debug('Bad handler response from action "' + action.name + '". Wait');
            }
        } else {
            Log.debug(this.mark.getDiffInSecs(currentMark) + ' secs left. Skip');
        }
    };




    var stats = new Statistics();




    // todo new class

    var timeout = Timeout.generator(3, 2)();

    function battle(statistics) {
        if (0 < timeout) {
           timeout--;
           return false;
        }

        if (View.controlPanelIsVisible()) {
            //Log.info('VISIBLE');

            if (View.searchControl('Герой')) return true;

            //Log.info('NO HERO');
            var controls = View.searchAllControls();
            //Log.info('CONTROLS', controls.length, controls);
            if (-1 != [3, 6].indexOf(controls.length)) {
                //Log.info('PROCESS');

                var group = 6 == controls.length ? 'first step' : 'second step';
                var gain = Tools.selectAny(controls);
                View.clickControl(gain);
                timeout = Timeout.generator(2, 0.5)();

                if (statistics)
                    statistics.update('Battle ' + group, gain.text(), new Date());

            }
        }

        return false;
    }


    function castle(flag, statistics) {
        if (!View.controlPanelIsVisible()) return false;

        if (View.searchControl('Герой')) return true;

        var controls = View.searchAllControls();
        if (controls.length) {
            var control = false;
            var max = 0;

            for (var i in controls) {
                var c = Tools.cmp(controls[i].text(), ChatWars.castles[flag]);
                Log.debug('COMPARE "' + controls[i].text() + '" WITH "' + ChatWars.castles[flag] +  '" - ' + 100 * c + '%');

                if (max < c) {
                    control = controls[i];
                    max = c;
                }
            }

            if (0.8 < max) {
                View.clickControl(control);

                if (statistics)
                    statistics.update('Castle', control.text(), new Date());
            }

        }

        return false;
    }


    function stock(statistics) {
        if (!View.controlPanelIsVisible()) return false;

        if (View.searchControl('Герой')) return true;

        var controls = View.searchAllControls();
        if (controls.length) {
            var control = Tools.selectAny(controls);

            View.clickControl(control);

            if (statistics)
                statistics.update('Stock', control.text(), new Date());

            return true;
        }

        return false;
    }

    function go(statistics) {
        View.searchAllMessages().each(function() {
            if (!$(this)[0].__seen_go) {
                $(this)[0].__seen_go = true;

                var m = $(this).text().match(/^Ты заметил (.*?)\.\s*(Он пытается ограбить КОРОВАН.*?)$/)
                if (m) {
                    View.executeCommand('/go', true);

                    if (statistics)
                        statistics.update('GO', m[1], new Date());
                }
            }
       });

       return true;
    }





    var statsScenario = new Scenario(
        'Статистика',
        function(last, current) {
            return 60 * 30 <= current.getDiffInSecs(last);
        }, [
            new Action('Статистика', function() { Log.info(stats.get()); return true; }, Timeout.generator(2, 1))
        ]);

    var forestScenario = new Scenario(
        'Лес',
        function(last, current) {
            return Timeout.generator(60 * 60, 10)() <= current.getDiffInSecs(last) &&
                ChatWars.isDay(current) &&
                !ChatWars.isBattleTime(current);
        }, [
            new Action('Назад', View.clickGenerator('Назад', true), Timeout.generator(2, 1)),
            new Action('Квесты', View.clickGenerator('Квесты'), Timeout.generator(2, 1)),
            new Action('Лес', View.clickGenerator('Лес'), Timeout.generator(300, 5)),
            new Action('Герой', View.clickGenerator('Герой', true), Timeout.generator(2, 1))
        ]);

    var caveScenario = new Scenario(
        'Пещера',
        function(last, current) {
            return Timeout.generator(60 * 60 * 2, 10)() <= current.getDiffInSecs(last) &&
                !ChatWars.isBattleTime(current) &&
                !ChatWars.isDay(current);
        }, [
            new Action('Назад', View.clickGenerator('Назад', true), Timeout.generator(2, 1)),
            new Action('Квесты', View.clickGenerator('Квесты'), Timeout.generator(2, 1)),
            new Action('Пещера', View.clickGenerator('Пещера'), Timeout.generator(300, 5)),
            new Action('Герой', View.clickGenerator('Герой', true), Timeout.generator(2, 1))
        ]);

    var caravanScenario = new Scenario(
        'Караван',
        function(last, current) {
            return Timeout.generator(60 * 60 * 2, 10)() <= current.getDiffInSecs(last) &&
                !ChatWars.isBattleTime(current) &&
                !ChatWars.isDay(current);
        }, [
            new Action('Назад', View.clickGenerator('Назад', true), Timeout.generator(2, 1)),
            new Action('Квесты', View.clickGenerator('Квесты'), Timeout.generator(2, 1)),
            new Action('Караван', View.clickGenerator('КОРОВАН'), Timeout.generator(300, 5)),
            new Action('Герой', View.clickGenerator('Герой', true), Timeout.generator(2, 1))
        ]);

    var arenaScenario = new Scenario(
        'Арена',
        function(last, current) {
            return Timeout.generator(60 * 60, 10)() <= current.getDiffInSecs(last) &&
                ChatWars.isDay(current) &&
                !ChatWars.isBattleTime(current) &&
                !ChatWars.isArenaStopTime(current);
        }, [
            new Action('Назад', View.clickGenerator('Назад', true), Timeout.generator(2, 1)),
            new Action('Замок', View.clickGenerator('Замок'), Timeout.generator(2, 1)),
            new Action('Арена', View.clickGenerator('Арена'), Timeout.generator(2, 1)),
            new Action('Поиск соперника', View.clickGenerator('Поиск соперника'), Timeout.generator(2, 1)),
            new Action('Бой', function() { return battle(stats); }, Timeout.generator(7, 1)),
            new Action('Герой', View.clickGenerator('Герой', true), Timeout.generator(2, 1))
        ]);

    var defenceScenario = new Scenario(
        'Защита',
        function(last, current) {
            var hour = current.getHours();
            var min = current.getMinutes();

            return 60 * 55 <= current.getDiffInSecs(last) &&
                -1 != ChatWars.battleHours.indexOf(hour) &&
                min >= ChatWars.safeMinutes[1];
        }, [
            new Action('Назад', View.clickGenerator('Назад', true), Timeout.generator(2, 1)),
            new Action('Защита', View.clickGenerator('Защита'), Timeout.generator(2, 1)),
            new Action('Замок', function() { return castle('white', stats); }, Timeout.generator(2, 1)),
        ]);

    var reportScenario = new Scenario(
        'Отчет',
        function(last, current) {
            var hour = current.getHours();
            var min = current.getMinutes();

            return 60 * 55 <= current.getDiffInSecs(last) &&
                -1 != ChatWars.battleHours.indexOf(hour - 1) &&
                min >= 3 &&
                min <= ChatWars.safeMinutes[0];
        }, [
            new Action('Отчет', View.executeCommandGenerator('/report', true), Timeout.generator(2, 1))
        ]);

    var stockScenario = new Scenario(
        'Склад',
        function(last, current) {
            return Timeout.generator(60 * 60 * 3.2, 10)() <= current.getDiffInSecs(last) &&
                !ChatWars.isBattleTime(current)
        }, [
            new Action('Склад', View.executeCommandGenerator('/stock', true), Timeout.generator(2, 1)),
            new Action('Полка', function() { return stock(stats); }, Timeout.generator(2, 1)),
            new Action('Назад', View.clickGenerator('Назад', true), Timeout.generator(2, 1))
        ]);

    var bonesScenario = new Scenario(
        'Кости',
        function(last, current) {
            return Timeout.generator(60 * 60 * 2.5, 10)() <= current.getDiffInSecs(last) &&
                !ChatWars.isBattleTime(current) &&
                ChatWars.isPubTime(current) &&
                ChatWars.isDay(current);
        }, [
            new Action('Назад', View.clickGenerator('Назад', true), Timeout.generator(2, 1)),
            new Action('Замок', View.clickGenerator('Замок'), Timeout.generator(2, 1)),
            new Action('Таверна', View.clickGenerator('Таверна'), Timeout.generator(2, 1)),
            new Action('Кости', View.clickGenerator('кости'), Timeout.generator(300, 5)),
        ]);

    var cupScenario = new Scenario(
        'Кружка',
        function(last, current) {
            return Timeout.generator(60 * 60 * 2.5, 10)() <= current.getDiffInSecs(last) &&
                !ChatWars.isBattleTime(current) &&
                ChatWars.isPubTime(current) &&
                ChatWars.isDay(current);
        }, [
            new Action('Назад', View.clickGenerator('Назад', true), Timeout.generator(2, 1)),
            new Action('Замок', View.clickGenerator('Замок'), Timeout.generator(2, 1)),
            new Action('Таверна', View.clickGenerator('Таверна'), Timeout.generator(2, 1)),
            new Action('Кружка', View.clickGenerator('кружку'), Timeout.generator(300, 5)),
        ]);

    var heroScenario = new Scenario(
        'Герой',
        function(last, current) {
            return Timeout.generator(60 * 45, 0.25)() <= current.getDiffInSecs(last) &&
                ChatWars.isDay(current)
        }, [
            new Action('Назад', View.clickGenerator('Назад', true), Timeout.generator(2, 1)),
            new Action('Герой', View.clickGenerator('Герой', true), Timeout.generator(2, 1)),
        ]);

    var petScenario = new Scenario(
        'Питомец',
        function(last, current) {
            return Timeout.generator(60 * 60 * 1.5, 1)() <= current.getDiffInSecs(last)
        }, [
            new Action('Назад', View.clickGenerator('Назад', true), Timeout.generator(2, 1)),
            new Action('Питомец', View.executeCommandGenerator('/pet'), Timeout.generator(5, 1)),
            new Action('Назад', View.clickGenerator('Назад'), Timeout.generator(2, 1)),
        ]);

    var petFeedScenario = new Scenario(
        'Покормить питомца',
        function(last, current) {
            return Timeout.generator(60 * 60 * 6, 20)() <= current.getDiffInSecs(last)
        }, [
            new Action('Назад', View.clickGenerator('Назад', true), Timeout.generator(2, 1)),
            new Action('Питомец', View.executeCommandGenerator('/pet'), Timeout.generator(2, 1)),
            new Action('Покормить', View.clickGenerator('Покормить'), Timeout.generator(2, 1)),
            new Action('Питомец', View.executeCommandGenerator('/pet', true), Timeout.generator(2, 1)),
            new Action('Назад', View.clickGenerator('Назад'), Timeout.generator(2, 1)),
        ]);

    var petPlayScenario = new Scenario(
        'Поиграть с питомцем',
        function(last, current) {
            return Timeout.generator(60 * 60 * 3, 20)() <= current.getDiffInSecs(last)
        }, [
            new Action('Назад', View.clickGenerator('Назад', true), Timeout.generator(2, 1)),
            new Action('Питомец', View.executeCommandGenerator('/pet'), Timeout.generator(2, 1)),
            new Action('Поиграть', View.clickGenerator('Поиграть'), Timeout.generator(2, 1)),
            new Action('Назад', View.clickGenerator('Назад'), Timeout.generator(2, 1)),
        ]);

    var petCleanScenario = new Scenario(
        'Почистить питомца',
        function(last, current) {
            return Timeout.generator(60 * 60 * 3, 20)() <= current.getDiffInSecs(last)
        }, [
            new Action('Назад', View.clickGenerator('Назад', true), Timeout.generator(2, 1)),
            new Action('Питомец', View.executeCommandGenerator('/pet'), Timeout.generator(2, 1)),
            new Action('Почистить', View.clickGenerator('Почистить'), Timeout.generator(2, 1)),
            new Action('Назад', View.clickGenerator('Назад'), Timeout.generator(2, 1)),
        ]);

    var goScenario = new Scenario(
        'Защита каравана',
        function(last, current) {
            return 60 * 2 <= current.getDiffInSecs(last)
        }, [
            new Action('/go', function() { return go(stats); }, Timeout.generator(2, 1))
        ]);

    Log.info('Start');

    var app = new Application(
        [
            statsScenario,
            forestScenario,
            caveScenario,
            //caravanScenario,
            arenaScenario,
            defenceScenario,
            reportScenario,
            bonesScenario,
            cupScenario,
            heroScenario,
            stockScenario,
            petScenario,
            petFeedScenario,
            petPlayScenario,
            petCleanScenario,
            goScenario,
        ],
        stats);

    Application.asyncRun(app, 1000, 5000);

})();
