// ==UserScript==
// @name         PokeLifeScript: AntyBan Edition
// @version      5.6
// @description  Dodatek do gry Pokelife
// @match        https://gra.pokelife.pl/*
// @downloadURL  https://github.com/krozum/pokelife/raw/master/PokeLifeScript.user.js
// @updateURL    https://github.com/krozum/pokelife/raw/master/PokeLifeScript.user.js
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @grant        GM_notification
// @require      https://bug7a.github.io/iconselect.js/sample/lib/control/iconselect.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/blueimp-md5/2.5.0/js/md5.min.js
// @resource     customCSS_global  https://raw.githubusercontent.com/krozum/pokelife/master/assets/global.css?ver=6
// @resource     customCSS_style_1  https://raw.githubusercontent.com/krozum/pokelife/master/assets/style_1.css?ver=1
// @resource     customCSS_style_2  https://raw.githubusercontent.com/krozum/pokelife/master/assets/style_2.css?ver=1
// @resource     customCSS_style_3  https://raw.githubusercontent.com/krozum/pokelife/master/assets/style_3.css?ver=1
// @resource     customCSS_style_4  https://raw.githubusercontent.com/krozum/pokelife/master/assets/style_4.css?ver=1
// ==/UserScript==


// **********************
//
// zmienne globalne
//
// **********************

var config = new Object();
var AutoGoSettings = new Object();
var autoGo;
var previousPageContent = null;
var pokemonData;
var region;
var lastSeeShoutId;
var timeoutMin = 300;
var timeoutMax = 400;


// **********************
//
// funkcja do zapisu do bra1ns.pl
//
// **********************
function requestBra1nsPL(url, callback) {
    $.ajax(url)
        .done(data => callback == null ? "" : callback(data))
        .fail((xhr, status) => console.log('error:', status));
}
requestBra1nsPL("https://bra1ns.pl/pokelife/api/update_user.php?bot_version=" + GM_info.script.version + "&login=" + $('#wyloguj').parent().parent().html().split("<div")[0].trim() + "&poziom=" + $('button[data-original-title="Poziom Trenera Pokemon"]').html(), null);


// **********************
//
// eventy do wykorzystania przy pisaniu dodatków
//
// **********************
window.onReloadSidebarFunctions = [];

function onReloadSidebar(fn) {
    window.onReloadSidebarFunctions.push(fn);
}

window.onReloadMainFunctions = [];

function onReloadMain(fn) {
    window.onReloadMainFunctions.push(fn);
}

window.afterReloadMainFunctions = [];

function afterReloadMain(fn) {
    window.afterReloadMainFunctions.push(fn);
}

function getPreviousPageContent() {
    return previousPageContent;
}


// **********************
//
// loggery
//
// **********************
function updateEvent(text, eventTypeId, dzicz) {
    if (dzicz != null) {
        requestBra1nsPL("https://bra1ns.pl/pokelife/api/update_event.php?login=" + $('#wyloguj').parent().parent().html().split("<div")[0].trim() + "&text=" + text + "&event_type_id=" + eventTypeId + "&dzicz=" + dzicz + "&time=" + Date.now(), function(response) {
            console.log("updateEvent: " + eventTypeId + " => " + text);
        })
    } else {
        requestBra1nsPL("https://bra1ns.pl/pokelife/api/update_event.php?login=" + $('#wyloguj').parent().parent().html().split("<div")[0].trim() + "&text=" + text + "&event_type_id=" + eventTypeId + "&time=" + Date.now(), function(response) {
            console.log("updateEvent: " + eventTypeId + " => " + text);
        })
    }
}

function updateStats(name, value) {
    requestBra1nsPL("https://bra1ns.pl/pokelife/api/update_stats.php?login=" + $('#wyloguj').parent().parent().html().split("<div")[0].trim() + "&stats_name=" + name + "&value=" + value + "&time=" + Date.now(), function(response) {
        console.log("UpdateStats: " + name + " => " + value);
    })
}

function updateStatsDoswiadczenie(json) {
    requestBra1nsPL("https://bra1ns.pl/pokelife/api/update_stats_doswiadczenie.php?login=" + $('#wyloguj').parent().parent().html().split("<div")[0].trim() + "&json=" + json + "&time=" + Date.now(), function(response) {
        console.log("updateStatsDoswiadczenie: " + json);
    })
}


// **********************
//
// nadpisanie glownych funkcji jQuery i funkcji gry
//
// **********************

function reloadMain(selector, url, callback, callback2) {
    previousPageContent = $('body').html();
    $.get(url, function(data) {
        var THAT = $('<div>').append($(data).clone());
        window.onReloadMainFunctions.forEach(function(item) {
            item.call(THAT, url);
        })
        if (callback2 != undefined && callback2 != null) {
            callback2.call(THAT, url);
        }
        var html2 = THAT.html().replace('<script src="js/okno_glowne_reload.js"></script>', "").replace("http://api.jquery.com/scripts/events.js", "https://gra.pokelife.pl/js/zegar.js").replace("$(\"#glowne_okno\").load('gra/stowarzyszenie.php?p=2&id_budynku='++'&pozycja_x='+$( \"#buduj\" ).position().left/16+'&pozycja_y='+$( \"#buduj\" ).position().top/16+'&nic');", "");
        $("" + selector).html(html2);

        if (url.indexOf("napraw") != -1) {
            $("html, body").animate({ scrollTop: 0 }, "fast");
        }
        $.get('inc/stan.php', function(data) {
            $("#sidebar").html(data);
            window.afterReloadMainFunctions.forEach(function(item) {
                item.call();
            })
            if (callback != undefined && callback != null) {
                callback.call();
            }
        });
    });
}

function reloadMainPOST(selector, url, postData, callback, callback2) {
    previousPageContent = $('body').html();
    $.ajax({
        type: 'GET',
        url: url,
        data: {
            postData: postData
        },
        success: function(data) {
            var THAT = $('<div>').append($(data).clone());
            window.onReloadMainFunctions.forEach(function(item) {
                item.call(THAT, url);
            })
            if (callback2 != undefined && callback2 != null) {
                callback2.call(THAT, url);
            }
            $("" + selector).html(THAT.html().replace('<script src="js/okno_glowne_reload.js"></script>', ""));
            $.get('inc/stan.php', function(data) {
                $("#sidebar").html(data);
                window.afterReloadMainFunctions.forEach(function(item) {
                    item.call();
                })
                if (callback != undefined && callback != null) {
                    callback.call();
                }
            });
        }
    });
}

var pa_before = $('#sidebar .progress-bar:contains("PA")').attr("aria-valuenow");
const oldShow = jQuery.fn.html
jQuery.fn.html = function() {
    const ret = oldShow.apply(this, arguments)
    var THAT = this;
    if (this.selector == "#sidebar") {
        var pa_after = this.find('.progress-bar:contains("PA")').attr("aria-valuenow");

        if (Number(pa_after) < Number(pa_before)) {
            updateStats("wyklikanych_pa", Number(pa_before) - Number(pa_after));
        }
        pa_before = pa_after;

        if (typeof window.onReloadSidebarFunctions != undefined) {
            window.onReloadSidebarFunctions.forEach(function(item) {
                item.call(THAT);
            });
        }
    }
    return ret
}


$(document).on('click', '#zaloguj_chat', function(e) {
    $("#shout_refresher").load("gra/chat/shout.php?refresh=0");
})


$(document).off("click", "nav a");
$(document).on("click", "nav a:not('.btn-akcja')", function(event) {
    if ($(this).attr('href').charAt(0) != '#' && !$(this).hasClass("link")) {

        if (event.originalEvent !== undefined && autoGo == true) {
            autoGo = false;
            $('#goAutoButton').html('AutoGO');
            $("#goStopReason").html("Kliknięto w menu").show();
            document.title = "Kliknięto w menu";
        }

        event.preventDefault();

        var new_buffer = $(this).attr('href');
        new_buffer = new_buffer.substr(4);
        remember_back(new_buffer);

        var url = $(this).attr('href');
        if (url.indexOf('index.php?url=') != -1) {
            url = url.replace('index.php?url=', '');
        }
        if (url.indexOf('gra/') == -1) {
            url = 'gra/' + url;
        }

        reloadMain("#glowne_okno", url);

        $('.collapse-hidefix').collapse('hide');
    }
});

var zarobek;

$(document).on("click", function(event) {
    document.title = "PokeLife - Gra Pokemon Online";
})


$(document).off("click", ".btn-akcja");
$(document).on("click", ".btn-akcja", function(event) {
    var url = $(this).attr('href');
    if ($('#hodowla-glowne b').length > 1) {
        zarobek = $('#hodowla-glowne b:nth(1)').html().split("¥")[0].replace('.', '').replace('.', '').replace('.', '');
    }

    if (event.originalEvent !== undefined && autoGo == true) {
        autoGo = false;
        $('#goAutoButton').html('AutoGO');
        $("#goStopReason").html("Kliknięto w menu").show();
        document.title = "Kliknięto w menu";
    }

    event.preventDefault();
    if (this.id != 'back_button') {

    } else {
        if ($(this).prop('prev1') != '') {
            $('#back_button').attr('href', $('#back_button').attr('prev1'));
            $('#back_button').attr('prev1', $('#back_button').attr('prev2'));
            $('#back_button').attr('prev2', $('#back_button').attr('prev3'));
            $('#back_button').attr('prev3', $('#back_button').attr('prev4'));
            $('#back_button').attr('prev4', $('#back_button').attr('prev5'));
            $('#back_button').attr('prev5', '');
        } else {
            $(this).prop('disabled', true);
        }
    }

    if ($('body').hasClass('modal-open')) {
        $('body').removeClass('modal-open');
        $('body').css({ "padding-right": "0px" });
        $('.modal-backdrop').remove();
    }

    $(this).attr("disabled", "disabled");

    if (url.startsWith("hodowla.php?sprzedaj_wszystkie=")) {
        updateStats("zarobki_z_hodowli", zarobek);
    }

    reloadMain("#glowne_okno", 'gra/' + $(this).attr('href'));
});


$(document).off("click", ".btn-edycja-nazwy-grupy");
$(document).on("click", ".btn-edycja-nazwy-grupy", function(event) {
    $("#panel_grupa_id_" + $(this).attr('data-grupa-id')).html('<form action="druzyna.php?p=2&zmien_nazwe_grupy=' + $(this).attr('data-grupa-id') + '" method="post"><div class="input-group"><input type="text" class="form-control" name="grupa_nazwa" value="' + $(this).attr('data-obecna-nazwa') + '"><span class="input-group-btn"><input class="btn btn-primary" type="submit" value="Ok"/></span></div></form>');
});

$(document).off("click", ".nauka-ataku");
$(document).on("click", ".nauka-ataku", function(event) {
    event.preventDefault();

    $("html, body").animate({ scrollTop: 0 }, "slow");

    var naucz_zamiast = $("input[name=nauczZamiast-" + $(this).attr("data-pokemon-id") + "]:checked").val();

    //$("#glowne_okno").html('Wczytywanie...');
    if ($(this).attr("data-tm-zapomniany")) {
        reloadMain("#glowne_okno", 'gra/sala.php?zabezpieczone_id=' + $(this).attr('zabezpieczone-id') + '&p=' + $(this).attr("data-pokemon-id") + '&tm_zapomniany=' + $(this).attr("data-tm-zapomniany") + '&naucz_zamiast=' + naucz_zamiast + '&zrodlo=' + $(this).attr('data-zrodlo'));
    } else if ($(this).attr("data-tm")) {
        reloadMain("#glowne_okno", 'gra/sala.php?zabezpieczone_id=' + $(this).attr('zabezpieczone-id') + '&p=' + $(this).attr("data-pokemon-id") + '&tm=' + $(this).attr("data-tm") + '&naucz_zamiast=' + naucz_zamiast + '&zrodlo=' + $(this).attr('data-zrodlo'));
    } else {
        reloadMain("#glowne_okno", 'gra/sala.php?zabezpieczone_id=' + $(this).attr('zabezpieczone-id') + '&p=' + $(this).attr("data-pokemon-id") + '&nauka_ataku=' + $(this).attr('data-nazwa-ataku') + '&naucz_zamiast=' + naucz_zamiast + '&zrodlo=' + $(this).attr('data-zrodlo'));
    }
});


$(document).off('submit', 'form');
$(document).on('submit', 'form', function(e) {
    if (!$(this).attr("form-normal-submit")) {

        e.preventDefault();

        $("html, body").animate({ scrollTop: 0 }, "fast");

        //Obejście modali
        if ($('body').hasClass('modal-open') && $(this).attr("dont-close-modal") != 1) {
            $('body').removeClass('modal-open');
            $('body').css({ "padding-right": "0px" });
            $('.modal-backdrop').remove();
        } else {
            $(".modal").animate({ scrollTop: 0 }, "fast");
        }

        var postData = $(this).serializeArray();

        if ($(this).attr("form-target")) {
            //$($(this).attr('form-target')).html(loadingbar);
            //$($(this).attr('form-target')).load('gra/'+$(this).attr('action'),  postData );


            reloadMainPOST($(this).attr('form-target'), 'gra/' + $(this).attr('action'), postData);
        } else {
            $("html, body").animate({ scrollTop: 0 }, "fast");
            //$("#glowne_okno").html(loadingbar);
            //$("#glowne_okno").load('gra/'+$(this).attr('action'),  postData );

            //$.post( 'gra/'+$(this).attr('action') , postData , function( data ) {
            //	alert( "Data Loaded: " + postData );
            //	$( "#glowne_okno" ).html( data );
            //});

            reloadMainPOST("#glowne_okno", 'gra/' + $(this).attr('action'), postData);
        }
        var submit = $(this).closest("form").find(":submit");
        submit.attr("disabled", "disabled");
    }
});


$(document).off("change", ".select-submit");
$(document).on("change", ".select-submit", function(e) {
    e.preventDefault();
    $("html, body").animate({ scrollTop: 0 }, "slow");

    //Obejście modali
    $('body').removeClass('modal-open');
    $('body').css({ "padding-right": "0px" });
    $('.modal-backdrop').remove();

    var postData = $(this).closest('form').serializeArray();

    $("html, body").animate({ scrollTop: 0 }, "fast");

    reloadMainPOST("#glowne_okno", 'gra/' + $(this).closest('form').attr('action'), postData);
});

$(document).off("click", "#zatwierdz_reprezentacje");
$(document).on("click", "#zatwierdz_reprezentacje", function(e) {
    $("html, body").animate({ scrollTop: 0 }, "slow");

    //Obejście modali
    $('body').removeClass('modal-open');
    $('body').css({ "padding-right": "0px" });
    $('.modal-backdrop').remove();

    var postData = $(this).closest('form').serializeArray();
    $("html, body").animate({ scrollTop: 0 }, "fast");


    reloadMainPOST("#glowne_okno", 'gra/' + $(this).closest('form').attr('action'), postData);

    e.preventDefault();
});

$(document).off("click", ".collapse_toggle_icon");
$(document).on("click", ".collapse_toggle_icon", function(e) {
    if ($(".collapse_toggle_icon").hasClass("glyphicon-chevron-down")) {
        $(".collapse_toggle_icon").removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-up");
    } else {
        $(".collapse_toggle_icon").removeClass("glyphicon-chevron-up").addClass("glyphicon-chevron-down");
    }
});



// **********************
//
// initPokeLifeScript
// główna funkcja gry
//
// **********************
function initPokeLifeScript() {



    // **********************
    //
    // initSkins
    // Funkcja dodająca nowe skórki do gry
    //
    // **********************
    function initSkins() {

        var globalCSS = GM_getResourceText("customCSS_global");
        GM_addStyle(globalCSS);

        var newCSS;
        if (window.localStorage.skinStyle == 2) {
            newCSS = GM_getResourceText("customCSS_style_2");
            GM_addStyle(newCSS);
        } else if (window.localStorage.skinStyle == 3) {
            newCSS = GM_getResourceText("customCSS_style_3");
            GM_addStyle(newCSS);
        } else if (window.localStorage.skinStyle == 4) {
            newCSS = GM_getResourceText("customCSS_style_4");
            GM_addStyle(newCSS);
        } else {
            window.localStorage.skinStyle = 1;
            newCSS = GM_getResourceText("customCSS_style_1");
            GM_addStyle(newCSS);
        }

        $('body').append('<div id="changeStyle" class="plugin-button" style="border-radius: 4px;position: fixed;cursor: pointer;bottom: 10px;left: 10px;font-size: 19px;text-align: center;width: 30px;height: 30px;line-height: 35px;z-index: 9999;"></div>');
        $(document).on('click', '#changeStyle', function() {
            console.log(window.localStorage.skinStyle);
            switch (window.localStorage.skinStyle) {
                case "1":
                    window.localStorage.skinStyle = 2;
                    location.reload()
                    break;
                case "2":
                    window.localStorage.skinStyle = 3;
                    location.reload()
                    break;
                case "3":
                    window.localStorage.skinStyle = 4;
                    location.reload()
                    break;
                case "4":
                    window.localStorage.skinStyle = 1;
                    location.reload()
                    break;
                default:
                    window.localStorage.skinStyle = 1;
                    location.reload()
            }
        });
    }
    initSkins();


    // **********************
    //
    // initAutoGo
    // Funkcja dodająca automatyczne klikanie w wyprawy
    //
    // **********************
    function initAutoGo() {

        function getRandomInt(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };

        var clickDelay = getRandomInt(timeoutMin, timeoutMax);
        var minToHeal = getRandomInt(20, 50);

        var blocked = false;
        var autoGoWznawianie;

        window.localStorage.useCzerwoneNapoje == undefined ? window.localStorage.useCzerwoneNapoje = false : "";
        window.localStorage.useNiebieskieNapoje == undefined ? window.localStorage.useNiebieskieNapoje = false : "";
        window.localStorage.useZieloneNapoje == undefined ? window.localStorage.useZieloneNapoje = false : "";
        window.localStorage.useNiebieskieJagody == undefined ? window.localStorage.useNiebieskieJagody = false : "";
        window.localStorage.useCzerwoneJagody == undefined ? window.localStorage.useCzerwoneJagody = false : "";
        window.localStorage.useFontanna == undefined ? window.localStorage.useFontanna = false : "";
        window.localStorage.useOnlyInNight == undefined ? window.localStorage.useOnlyInNight = false : "";


        window.localStorage.pok20 == undefined ? window.localStorage.pok20 = 0 : "";
        window.localStorage.pok40 == undefined ? window.localStorage.pok40 = 0 : "";
        window.localStorage.pok60 == undefined ? window.localStorage.pok60 = 0 : "";
        window.localStorage.pok80 == undefined ? window.localStorage.pok80 = 0 : "";
        window.localStorage.pok100 == undefined ? window.localStorage.pok100 = 0 : "";


        window.localStorage.zatrzymujNiezlapane == undefined ? window.localStorage.zatrzymujNiezlapane = true : "";

        function initGoButton() {
            $('body').append('<div id="goSettingsAutoGo" style="position: fixed;cursor: pointer;top: 20px;right: 275px;font-size: 20px;text-align: center;width: 25px;height: 25px;line-height: 25px;z-index: 9999;"><span style="color: ' + $('.panel-heading').css('background-color') + ';" class="glyphicon glyphicon-cog" aria-hidden="true"></span></div>');
            $('body').append('<div id="goButton" style="opacity: 0.3;border-radius: 4px;position: fixed; cursor: pointer; top: 5px; right: 10px; font-size: 36px; text-align: center; width: 100px; height: 48px; line-height: 48px; background: ' + $('.panel-heading').css('background-color') + '; z-index: 9999">GO</div>');
            $('body').append('<div id="goAutoButton" style="border-radius: 4px;position: fixed; cursor: pointer; top: 5px; right: 122px; font-size: 36px; text-align: center; width: 140px; height: 48px; line-height: 48px; background: ' + $('.panel-heading').css('background-color') + '; z-index: 9999">AutoGO</div>');
            $('body').append('<div id="goStopReason" style="position: fixed; cursor: pointer; top: 12px; right: 271px; z-index: 99999; background: rgb(231, 201, 216); padding: 7px; border: 1px solid rgb(225, 187, 206); border-radius: 3px; display: none;"></div>');
        }
        initGoButton();

        function initPokemonIcon() {
            $('#setPokemon').remove();
            $('body').append('<div id="setPokemon" style="position: fixed; cursor: pointer; top: 0; left: 10px; z-index: 9999"></div>');

            IconSelect.COMPONENT_ICON_FILE_PATH = "";

            AutoGoSettings.iconPokemon = new IconSelect("setPokemon", {
                'selectedIconWidth': 48,
                'selectedIconHeight': 48,
                'selectedBoxPadding': 1,
                'iconsWidth': 48,
                'iconsHeight': 48,
                'boxIconSpace': 1,
                'vectoralIconNumber': 1,
                'horizontalIconNumber': 6
            });

            var selectPokemon = [];
            let i = 0;
            $.each($('.stan-pokemon'), function(index, item) {
                let src = $(item).find('img').attr('src');
                if (src != "undefined" && src != undefined) {
                    selectPokemon.push({
                        'iconFilePath': $(item).find('img').attr('src'),
                        'iconValue': function() {
                            return "&wybierz_pokemona=" + AutoGoSettings.iconPokemon.getSelectedIndex();
                        }
                    });
                    i = i + 1;
                }
            });

            selectPokemon.push({
                'iconFilePath': 'https://cdn0.iconfinder.com/data/icons/seo-smart-pack/128/grey_new_seo-05-512.png',
                'iconValue': function() {
                    if (Number($('#glowne_okno .dzikipokemon-background-normalny b').html().split(': ')[1]) <= 20) {
                        return "&wybierz_pokemona=" + window.localStorage.pok20;
                    }
                    if (Number($('#glowne_okno .dzikipokemon-background-normalny b').html().split(': ')[1]) <= 40) {
                        return "&wybierz_pokemona=" + window.localStorage.pok40;
                    }
                    if (Number($('#glowne_okno .dzikipokemon-background-normalny b').html().split(': ')[1]) <= 60) {
                        return "&wybierz_pokemona=" + window.localStorage.pok60;
                    }
                    if (Number($('#glowne_okno .dzikipokemon-background-normalny b').html().split(': ')[1]) <= 80) {
                        return "&wybierz_pokemona=" + window.localStorage.pok80;
                    }
                    return "&wybierz_pokemona=" + window.localStorage.pok100;
                }
            });

            AutoGoSettings.iconPokemon.refresh(selectPokemon);
            AutoGoSettings.iconPokemon.setSelectedIndex(window.localStorage.pokemonIconsIndex);

            document.getElementById('setPokemon').addEventListener('changed', function(e) {
                window.localStorage.pokemonIconsIndex = AutoGoSettings.iconPokemon.getSelectedIndex();
            });
        }
        initPokemonIcon();


        function initPokeballIcon() {
            $('body').append('<div id="setPokeball" style="position: fixed; cursor: pointer; top: 0; left: 60px; z-index: 9999"></div>');

            AutoGoSettings.iconPokeball = new IconSelect("setPokeball", {
                'selectedIconWidth': 48,
                'selectedIconHeight': 48,
                'selectedBoxPadding': 1,
                'iconsWidth': 48,
                'iconsHeight': 48,
                'boxIconSpace': 1,
                'vectoralIconNumber': 1,
                'horizontalIconNumber': 6
            });

            var selectPokeball = [{
                    'iconFilePath': "images/pokesklep/pokeballe.jpg",
                    'iconValue': function() {
                        return '&zlap_pokemona=pokeballe';
                    }
                },
                {
                    'iconFilePath': "images/pokesklep/greatballe.jpg",
                    'iconValue': function() {
                        return '&zlap_pokemona=greatballee';
                    }
                },
                {
                    'iconFilePath': "images/pokesklep/nestballe.jpg",
                    'iconValue': function() {
                        return '&zlap_pokemona=nestballe';
                    }
                },
                {
                    'iconFilePath': "images/pokesklep/friendballe.jpg",
                    'iconValue': function() {
                        return '&zlap_pokemona=friendballe';
                    }
                },
                {
                    'iconFilePath': "images/pokesklep/nightballe.jpg",
                    'iconValue': function() {
                        return '&zlap_pokemona=nightballe';
                    }
                },
                {
                    'iconFilePath': "images/pokesklep/cherishballe.jpg",
                    'iconValue': function() {
                        return '&zlap_pokemona=cherishballe';
                    }
                },
                {
                    'iconFilePath': "images/pokesklep/lureballe.jpg",
                    'iconValue': function() {
                        return '&zlap_pokemona=lureballe';
                    }
                },
                {
                    'iconFilePath': "https://raw.githubusercontent.com/krozum/pokelife/master/assets/nb1.jpg",
                    'iconValue': function() {
                        let pokeLvlNumber = $('#glowne_okno i:nth("1")').parent().html().split("(")[1].split(" poz")[0];
                        if (pokeLvlNumber < 15) {
                            return '&zlap_pokemona=nestballe';
                        } else {
                            return '&zlap_pokemona=greatballee';
                        }
                    }
                },
                {
                    'iconFilePath': "https://raw.githubusercontent.com/krozum/pokelife/master/assets/nb2.png",
                    'iconValue': function() {
                        var d = new Date();
                        var h = d.getHours();
                        if (h >= 22 || h < 6) {
                            return '&zlap_pokemona=nightballe';
                        }
                        let pokeLvlNumber = $('#glowne_okno i:nth("1")').parent().html().split("(")[1].split(" poz")[0];
                        if (pokeLvlNumber < 15) {
                            return '&zlap_pokemona=nestballe';
                        } else {
                            return '&zlap_pokemona=greatballee';
                        }
                    }
                },
                {
                    'iconFilePath': "https://raw.githubusercontent.com/krozum/pokelife/master/assets/nb3.jpg",
                    'iconValue': function() {
                        let pokeLvlNumber = $('#glowne_okno i:nth("1")').parent().html().split("(")[1].split(" poz")[0];
                        if (pokeLvlNumber <= 5) {
                            return '&zlap_pokemona=uzyj_swarmballe';
                        } else {
                            var d = new Date();
                            var h = d.getHours();
                            if (h >= 22 || h < 6) {
                                return '&zlap_pokemona=nightballe';
                            }
                            if (pokeLvlNumber > 5 && pokeLvlNumber < 15) {
                                return '&zlap_pokemona=nestballe';
                            } else {
                                return '&zlap_pokemona=greatballee';
                            }
                        }
                    }
                },
                {
                    'iconFilePath': "https://raw.githubusercontent.com/krozum/pokelife/master/assets/nb4.jpg",
                    'iconValue': function() {
                        if ($(previousPageContent).find('.dzikipokemon-background-normalny img[src="images/trudnosc/trudnosc1.png"]').length > 0) {
                            return '&zlap_pokemona=levelballe';
                        } else {
                            var d = new Date();
                            var h = d.getHours();
                            if (h >= 22 || h < 6) {
                                return '&zlap_pokemona=nightballe';
                            }
                            let pokeLvlNumber = $('#glowne_okno i:nth("1")').parent().html().split("(")[1].split(" poz")[0];
                            if (pokeLvlNumber >= 5 && pokeLvlNumber < 15) {
                                return '&zlap_pokemona=nestballe';
                            } else {
                                return '&zlap_pokemona=greatballee';
                            }
                        }
                    }
                },
                {
                    'iconFilePath': "images/pokesklep/safariballe.jpg",
                    'iconValue': function() {
                        if ($('label[data-original-title="Safariball"]').length > 0) {
                            if (Number($('label[data-original-title="Safariball"]').html().split('">')[1].trim()) > 1) {
                                if ($(previousPageContent).find('.dzikipokemon-background-normalny img[src="images/inne/pokeball_miniature2.png"]').length > 0) {
                                    return '&zlap_pokemona=safariballe';
                                } else {
                                    $('button:contains("Pomiń i szukaj dalej")').click();
                                    return "";
                                }
                            } else {
                                $('button:contains("Pomiń i szukaj dalej")').click();
                                return "";
                            }
                        } else {
                            autoGo = false;
                            $('#goAutoButton').html('AutoGO');
                            $("#goStopReason").html("Brak odpowiedniego pokeballa").show();
                            document.title = "Brak odpowiedniego pokeballa";
                        }
                    }
                }

            ];

            AutoGoSettings.iconPokeball.refresh(selectPokeball);
            AutoGoSettings.iconPokeball.setSelectedIndex(window.localStorage.pokeballIconsIndex);

            document.getElementById('setPokeball').addEventListener('changed', function(e) {
                window.localStorage.pokeballIconsIndex = AutoGoSettings.iconPokeball.getSelectedIndex();
            });
        }
        initPokeballIcon();


        function initLocationIcon() {
            $('body').append('<div id="setLocation" style="position: fixed; cursor: pointer; top: 0; left: 117px; z-index: 9999"></div>');

            AutoGoSettings.iconLocation = new IconSelect("setLocation", {
                'selectedIconWidth': 48,
                'selectedIconHeight': 48,
                'selectedBoxPadding': 1,
                'iconsWidth': 48,
                'iconsHeight': 48,
                'boxIconSpace': 1,
                'vectoralIconNumber': 1,
                'horizontalIconNumber': 6
            });

            var icons = [];
            $.each($('#pasek_skrotow li'), function(index, item) {
                if ($(item).find('a').attr('href') != "#" && $(item).find('a').attr('href').substring(0, 9) == "gra/dzicz") {
                    icons.push({
                        'iconFilePath': $(item).find('img').attr('src'),
                        'iconValue': function() {
                            return $(item).find('a').attr('href').substring(28)
                        }
                    });
                }
            });

            AutoGoSettings.iconLocation.refresh(icons);
            AutoGoSettings.iconLocation.setSelectedIndex(window.localStorage.locationIconsIndex);

            document.getElementById('setLocation').addEventListener('changed', function(e) {
                window.localStorage.locationIconsIndex = AutoGoSettings.iconLocation.getSelectedIndex();
            });
        }
        initLocationIcon();

        function click(poLeczeniu) {
            if (poLeczeniu != true) {
                poLeczeniu = false;
            }
            var canRun = true;

            if (blocked) {
                console.log('blocked');
                canRun = false;
            } else {
                blocked = true;
                window.setTimeout(function() { blocked = false }, clickDelay);
            }

            var minHealth = 100;

            $('.stan-pokemon div.progress:first-of-type .progress-bar').each(function(index) {
                var now = $(this).attr("style").replace(/^\D+/g, '').replace('%', '').replace(';', '');
                if (minHealth > Number(now)) {
                    minHealth = Number(now);
                }
            });

            if (Number(minHealth) < Number(minToHeal)) {
                if (!poLeczeniu) {

                    var healOption = 'gra/lecznica.php?wylecz_wszystkie&tylko_komunikat'

                    if (localStorage.getItem("useCzerwoneJagody") == "true") {
                        healOption = 'gra/plecak.php?uzyj&rodzaj_przedmiotu=czerwone_jagody&tylko_komunikat&ulecz_wszystkie&zjedz_max'
                    }

                    $.get(healOption, function(data) {

                        if ($(data).hasClass("alert-danger")) {
                            console.log('Brak czerwonych jagód');
                            localStorage.removeItem("useCzerwoneJagody");
                            window.setTimeout(function() {
                                if (autoGo) {
                                    click(poLeczeniu)
                                }
                            }, clickDelay);
                        };

                        if ($(data).find(".alert-success").length > 0 || $(data).hasClass("alert-success")) {

                            console.log('PokeLifeScript: wyleczono');

                            if ($(data).find(".alert-success strong").length > 0) {
                                var koszt = $(data).find(".alert-success strong").html().split(" ¥")[0];
                                updateStats("koszty_leczenia", koszt.replace(/\./g, ''));
                            }

                            $.get('inc/stan.php', function(data) {
                                $("#sidebar").html(data);
                                $('.btn-wybor_pokemona').attr("disabled", false);
                                $('.btn-wybor_pokemona .progress-bar').css("width", "100%");
                                $('.btn-wybor_pokemona .progress-bar span').html("100% PŻ");
                                window.setTimeout(function() {
                                    if (autoGo) {
                                        click(true)
                                    }
                                }, clickDelay);
                            });
                        }
                    });
                }
                canRun = false;
            }

            if (canRun) {
                if ($('#glowne_okno .panel-heading').length > 0) {
                    if ($('.dzikipokemon-background-shiny').length > 0) {
                        console.log('PokeLifeScript: spotkany Shiny, przerwanie AutoGo');
                        autoGo = false;
                        $('#goAutoButton').html('AutoGO');
                        $("#goStopReason").html("Spotkany shiny pokemon").show();
                        document.title = "Spotkany shiny pokemon";
                        $('#refreshShinyWidget').trigger('click');
                        requestBra1nsPL("https://bra1ns.pl/pokelife/api/update_shiny.php?pokemon_id=" + $('.dzikipokemon-background-shiny .center-block img').attr('src').split('/')[1].split('.')[0].split('s')[1] + "&login=" + $('#wyloguj').parent().parent().html().split("<div")[0].trim() + "&time=" + Date.now(), null);
                    } else if ($('.dzikipokemon-background-normalny img[src="images/inne/pokeball_miniature2.png"]').length > 0 && $('.dzikipokemon-background-normalny img[src="images/trudnosc/trudnoscx.png"]').length < 1 && $('.dzikipokemon-background-normalny .col-xs-9 > b').html().split("Poziom: ")[1] <= 50) {
                        if (window.localStorage.zatrzymujNiezlapane == false || window.localStorage.zatrzymujNiezlapane == "false") {
                            console.log('PokeLifeScript: spotkany niezłapany pokemona');
                            console.log('PokeLifeScript: atakuje pokemona');
                            var url = "dzicz.php?miejsce=" + AutoGoSettings.iconLocation.getSelectedValue().call() + AutoGoSettings.iconPokemon.getSelectedValue().call();
                            if ($('button[href="' + url + '"]').length == 0) {
                                autoGo = false;
                                $('#goAutoButton').html('AutoGO');
                                $("#goStopReason").html("Dzicz została zmieniona").show();
                                document.title = "Dzicz została zmieniona";
                            } else {
                                $('button[href="' + url + '"]').trigger('click');
                            }
                        } else {
                            console.log('PokeLifeScript: spotkany niezłapany pokemona, przerwanie AutoGo');
                            autoGo = false;
                            $('#goAutoButton').html('AutoGO');
                            $("#goStopReason").html("Spotkany niezłapany pokemona").show();
                            document.title = "Spotkany niezłapany pokemona";
                        }
                    } else if ($('.dzikipokemon-background-normalny').length == 1) {
                        console.log('PokeLifeScript: atakuje pokemona');
                        var url = "dzicz.php?miejsce=" + AutoGoSettings.iconLocation.getSelectedValue().call() + AutoGoSettings.iconPokemon.getSelectedValue().call();
                        if ($('button[href="' + url + '"]').length == 0) {
                            autoGo = false;
                            $('#goAutoButton').html('AutoGO');
                            $("#goStopReason").html("Dzicz została zmieniona").show();
                            document.title = "Dzicz została zmienion";
                        } else {
                            $('button[href="' + url + '"]').trigger('click');
                        }
                    } else if ($("form[action='dzicz.php?zlap']").length == 1) {
                        if (AutoGoSettings.iconPokeball.getSelectedValue().call() !== "") {
                            var button = $('label[href="dzicz.php?miejsce=' + AutoGoSettings.iconLocation.getSelectedValue().call() + AutoGoSettings.iconPokeball.getSelectedValue().call() + '"]');
                            if (button.length > 0) {
                                console.log('PokeLifeScript: rzucam pokeballa');
                                $('label[href="dzicz.php?miejsce=' + AutoGoSettings.iconLocation.getSelectedValue().call() + AutoGoSettings.iconPokeball.getSelectedValue().call() + '"]').trigger('click');
                            } else {
                                autoGo = false;
                                $('#goAutoButton').html('AutoGO');
                                $("#goStopReason").html("Brak odpowiedniego pokeballa").show();
                                document.title = "Brak odpowiedniego pokeballa";
                                console.log('PokeLifeScript: brak odpowiedniego balla');
                            }
                        }
                    } else if ($("form[action='dzicz.php?zlap_pokemona=swarmballe&miejsce=" + AutoGoSettings.iconLocation.getSelectedValue().call() + "']").length == 1) {
                        console.log('PokeLifeScript: rzucam 1 swarmballa');
                        $("form[action='dzicz.php?zlap_pokemona=swarmballe&miejsce=" + AutoGoSettings.iconLocation.getSelectedValue().call() + "']").submit();
                    } else {
                        console.log('PokeLifeScript: idę do dziczy ' + AutoGoSettings.iconLocation.getSelectedValue().call() + ".");
                        $('#pasek_skrotow a[href="gra/dzicz.php?poluj&miejsce=' + AutoGoSettings.iconLocation.getSelectedValue().call() + '"] img').trigger('click');
                    }
                }
            }
        }

        $(document).on("click", "#goSettingsAutoGo", function() {
            if ($('#settingsAutoGo').length > 0) {
                $('#settingsAutoGo').remove();
            } else {
                $('body').append('<div id="settingsAutoGo" style="padding: 10px; position:fixed;top: 60px;right: 69px;width: 880px;background: white;opacity: 1;border: 3px dashed #ffed14;z-index: 999;"></div>');
                $('#settingsAutoGo').append('<div class="row"><div class="col-sm-6 wznawianieSettings"><table> <tr> <th></th> <th></th> <th></th> </tr></table></div></div>');
                $('#settingsAutoGo .wznawianieSettings table').append('<col width="60"><col width="20"><col width="340">');
                $('#settingsAutoGo .wznawianieSettings table').append('<tr><td><img style="width: 40px;" src="images/pokesklep/duzy_napoj_energetyczny.jpg"></td><td><input type="checkbox" id="autoUseCzerwoneNapoje" name="autoUseCzerwoneNapoje" value="1" ' + (window.localStorage.useCzerwoneNapoje == "true" ? "checked" : "") + ' style=" margin: 0; line-height: 50px; height: 50px; "></td><td><label style=" margin: 0; height: 50px; line-height: 44px; font-size: 14px; ">Używaj czerwonych napojów gdy zabraknie PA</label></td> </tr>');
                $('#settingsAutoGo .wznawianieSettings table').append('<tr><td><img style="width: 40px;" src="images/pokesklep/napoj_energetyczny.jpg"></td><td><input type="checkbox" id="autoUseNiebieskieNapoje" name="autoUseNiebieskieNapoje" value="1" ' + (window.localStorage.useNiebieskieNapoje == "true" ? "checked" : "") + ' style=" margin: 0; line-height: 50px; height: 50px; "></td><td><label style=" margin: 0; height: 50px; line-height: 44px; font-size: 14px; ">Używaj niebieskich napojów gdy zabraknie PA</label></td> </tr>');
                $('#settingsAutoGo .wznawianieSettings table').append('<tr><td><img style="width: 40px;" src="images/pokesklep/zielony_napoj.jpg"></td><td><input type="checkbox" id="autoUseZieloneNapoje" name="autoUseZieloneNapoje" value="1" ' + (window.localStorage.useZieloneNapoje == "true" ? "checked" : "") + ' style=" margin: 0; line-height: 50px; height: 50px; "></td><td><label style=" margin: 0; height: 50px; line-height: 44px; font-size: 14px; ">Używaj zielonych napojów gdy zabraknie PA</label></td> </tr>');
                $('#settingsAutoGo .wznawianieSettings table').append('<tr><td><img style="width: 40px;" src="images/pokesklep/niebieskie_jagody.jpg"></td><td><input type="checkbox" id="autoUseNiebieskieJagody" name="autoUseNiebieskieJagody" value="1" ' + (window.localStorage.useNiebieskieJagody == "true" ? "checked" : "") + ' style=" margin: 0; line-height: 50px; height: 50px; "></td><td><label style=" margin: 0; height: 50px; line-height: 44px; font-size: 14px; ">Używaj niebieskich jagód gdy zabraknie PA</label></td> </tr>');

                $('#settingsAutoGo .wznawianieSettings').append('<p>Bot będzie starał sie przywrócać PA w kolejności <b>Niebieskie Jagody</b> -> <b>Zielone napoje</b> -> <b>Niebieskie napoje</b> -> <b>Czerwone napoje</b></p>');

                $('#settingsAutoGo .row').append('<div class="col-sm-6 dziczSettings"><table> <tr> <th></th> <th></th> <th></th> </tr></table></div>');
                $('#settingsAutoGo .dziczSettings table').append('<col width="60"><col width="20"><col width="340">');
                $('#settingsAutoGo .dziczSettings table').append('<tr><td><img style="width: 40px;" src="images/pokesklep/czerwone_jagody.jpg"></td><td><input type="checkbox" id="autoUseCzerwoneJagody" name="autoUseCzerwoneJagody" value="1" ' + (window.localStorage.useCzerwoneJagody == "true" ? "checked" : "") + ' style=" margin: 0; line-height: 50px; height: 50px; "></td><td><label style=" margin: 0; height: 50px; line-height: 44px; font-size: 14px; ">Używaj czerwonych jagód do leczenia</label></td> </tr>');
                $('#settingsAutoGo .dziczSettings table').append('<tr><td></td><td><input type="checkbox" id="zatrzymujNiezlapane" name="zatrzymujNiezlapane" value="1" ' + (window.localStorage.zatrzymujNiezlapane == "true" ? "checked" : "") + ' style=" margin: 0; line-height: 50px; height: 50px; "></td><td><label style=" margin: 0; height: 50px; line-height: 44px; font-size: 14px;">Zatrzymuj gdy spotkasz niezłapane pokemony</label></td> </tr></tbody></table>');
                $('#settingsAutoGo .dziczSettings table').append('<tr><td></td><td><input type="checkbox" id="useOnlyInNight" name="useOnlyInNight" value="1" ' + (window.localStorage.useOnlyInNight == "true" ? "checked" : "") + ' style=" margin: 0; line-height: 50px; height: 50px; "></td><td><label style=" margin: 0; height: 50px; line-height: 44px; font-size: 14px; ">Używaj wznawiania PA tylko pomiędzy 22-6</label></td> </tr>');

                $('#settingsAutoGo').append('<div id="exp_mod_settings" class="row"><hr><div class="col-sm-6 first"></div><div class="col-sm-6 second"></div></div>');
                $('#exp_mod_settings .first').append('<p style=" margin: 0 0 5px; ">Pokemony 1-20</p><select data-order-id="20" style="width: 100%; padding: 5px;margin-bottom: 10px;" class="list_of_poks_in_team"></select>');
                $('#exp_mod_settings .second').append('<p style=" margin: 0 0 5px; ">Pokemony 21-40</p><select data-order-id="40" style="width: 100%; padding: 5px;margin-bottom: 10px;" class="list_of_poks_in_team"></select>');
                $('#exp_mod_settings .first').append('<p style=" margin: 0 0 5px; ">Pokemony 41-60</p><select data-order-id="60" style="width: 100%; padding: 5px;margin-bottom: 10px;" class="list_of_poks_in_team"></select>');
                $('#exp_mod_settings .second').append('<p style=" margin: 0 0 5px; ">Pokemony 61-80</p><select data-order-id="80" style="width: 100%; padding: 5px;margin-bottom: 10px;" class="list_of_poks_in_team"></select>');
                $('#exp_mod_settings .first').append('<p style=" margin: 0 0 5px; ">Pokemony 81-100</p><select data-order-id="100" style="width: 100%; padding: 5px;margin-bottom: 10px;" class="list_of_poks_in_team"></select>');

                $.each($('#sidebar .stan-pokemon:odd()'), function(index, item) {
                    $('.list_of_poks_in_team').append('<option value="' + index + '">' + $(item).find('b').html() + '</option>');
                })

                $('.list_of_poks_in_team[data-order-id="20"] option[value="' + window.localStorage.pok20 + '"]').prop("selected", true);
                $('.list_of_poks_in_team[data-order-id="40"] option[value="' + window.localStorage.pok40 + '"]').prop("selected", true);
                $('.list_of_poks_in_team[data-order-id="60"] option[value="' + window.localStorage.pok60 + '"]').prop("selected", true);
                $('.list_of_poks_in_team[data-order-id="80"] option[value="' + window.localStorage.pok80 + '"]').prop("selected", true);
                $('.list_of_poks_in_team[data-order-id="100"] option[value="' + window.localStorage.pok100 + '"]').prop("selected", true);
            }
        });

        $(document).on("change", ".list_of_poks_in_team", function(event) {
            var orderId = $(this).data('order-id');
            if (orderId == 20) {
                window.localStorage.pok20 = Number($(this).val());
            }
            if (orderId == 40) {
                window.localStorage.pok40 = Number($(this).val());
            }
            if (orderId == 60) {
                window.localStorage.pok60 = Number($(this).val());
            }
            if (orderId == 80) {
                window.localStorage.pok80 = Number($(this).val());
            }
            if (orderId == 100) {
                window.localStorage.pok100 = Number($(this).val());
            }
        });

        $(document).on("click", "#zatrzymujNiezlapane", function(event) {
            var isChecked = $('#zatrzymujNiezlapane').prop('checked');
            window.localStorage.zatrzymujNiezlapane = isChecked;
        });

        $(document).on("click", "#autoUseNiebieskieJagody", function(event) {
            var isChecked = $('#autoUseNiebieskieJagody').prop('checked');
            window.localStorage.useNiebieskieJagody = isChecked;
        });

        $(document).on("click", "#autoUseCzerwoneJagody", function(event) {
            var isChecked = $('#autoUseCzerwoneJagody').prop('checked');
            window.localStorage.useCzerwoneJagody = isChecked;
        });

        $(document).on("click", "#autoUseNiebieskieNapoje", function() {
            var isChecked = $('#autoUseNiebieskieNapoje').prop('checked');
            window.localStorage.useNiebieskieNapoje = isChecked;
        });

        $(document).on("click", "#autoUseZieloneNapoje", function() {
            var isChecked = $('#autoUseZieloneNapoje').prop('checked');
            window.localStorage.useZieloneNapoje = isChecked;
        });

        $(document).on("click", "#autoUseCzerwoneNapoje", function() {
            var isChecked = $('#autoUseCzerwoneNapoje').prop('checked');
            window.localStorage.useCzerwoneNapoje = isChecked;
        });

        $(document).on("click", "#useOnlyInNight", function() {
            var isChecked = $('#useOnlyInNight').prop('checked');
            window.localStorage.useOnlyInNight = isChecked;
        });


        $(document).on("click", "#goButton", function() {
            click();
        });

        $(document).on("click", '#goAutoButton', function() {
            if (autoGo) {
                autoGo = false;
                autoGoWznawianie = false;
                $('#goAutoButton').html('AutoGO');
            } else {
                autoGo = true;
                autoGoWznawianie = false;
                $('#goAutoButton').html('STOP');
                click();
            }
        });

        $(window).keypress(function(e) {
            if (e.key === ' ' || e.key === 'Spacebar') {
                if ($('input:focus').length == 0 && $('textarea:focus').length == 0 && $('#glowne_okno .panel-heading').length == 0) {
                    e.preventDefault();
                    click();
                } else if ($('input:focus').length == 0 && $('textarea:focus').length == 0 && $('#glowne_okno .panel-heading').html() !== "Poczta" && !$('#glowne_okno .panel-heading').html().startsWith("Stowarzyszenie")) {
                    e.preventDefault();
                    click();
                }
            }
        });

        onReloadMain(function() {
            if (autoGo && !autoGoWznawianie) {
                if (this.find(".panel-body > p.alert-danger").length > 0) {
                    console.log(this.find('.panel-body > p.alert-danger').html());
                    if (this.find(".panel-body > p.alert-danger:contains('Posiadasz za mało punktów akcji')").length > 0) {
                        przerwijAutoGoZPowoduBrakuPA(true);
                    } else if (this.find(".panel-body > p.alert-danger:contains('Nie masz wystarczającej ilości Punktów Akcji')").length > 0) {
                        przerwijAutoGoZPowoduBrakuPA(true);
                    } else if (this.find('.panel-body > p.alert-danger').html() == "Nie masz wystarczającej ilośći Punktów Akcji.") {
                        przerwijAutoGoZPowoduBrakuPA(true);
                    } else if (this.find('.panel-body > p.alert-danger').html() == "Baterie w twojej latarce się wyczerpały, kup nowe.") {
                        przerwijAutoGoZPowoduBrakuPA(false);
                        $("#goStopReason").html("Brak baterii").show();
                        document.title = "Brak baterii";
                    }
                }
            }
        })


        function probujWznowicAutoGo(array, autoGoBefore) {
            if (autoGoBefore) {
                if (array.length > 0) {
                    var text = array.pop();
                    switch (text) {
                        case "useNiebieskieJagody":
                            console.log('Próbuje przywrócić PA za pomocą niebieskich jagód');
                            if ($("a[href='gra/statystyki.php']").length > 0 && autoGo) {
                                reloadMain("#glowne_okno", "gra/statystyki.php", function() {
                                    window.setTimeout(function() {
                                        if ($("#statystyki b:contains('Niebieskie Jagody:')").parent().next().html().split('/')[0].trim() != $("#statystyki b:contains('Niebieskie Jagody:')").parent().next().html().split('/')[1].trim()) {
                                            if ($("a[href='gra/plecak.php']").length > 0 && autoGo) {
                                                reloadMain("#glowne_okno", "gra/plecak.php", function() {
                                                    if ($('.thumbnail-plecak[data-target="#plecak-49"] h5').length > 0) {
                                                        var ile = $('.thumbnail-plecak[data-target="#plecak-49"] h5').html().split(' x Niebieskie')[0];

                                                        if (ile > 40) {
                                                            ile = 40;
                                                        }
                                                        window.setTimeout(function() {
                                                            if (autoGo) {
                                                                reloadMain("#glowne_okno", "gra/plecak.php?uzyj&p=3&postData%5B0%5D%5Bname%5D=rodzaj_przedmiotu&postData%5B0%5D%5Bvalue%5D=niebieskie_jagody&postData%5B1%5D%5Bname%5D=ilosc&postData%5B1%5D%5Bvalue%5D=" + ile, function() {
                                                                    $('#goAutoButton').html('STOP');
                                                                    console.log('Przywrócono PA');
                                                                    window.setTimeout(function() {
                                                                        if (autoGo) {
                                                                            autoGoWznawianie = false;
                                                                            click();
                                                                        }
                                                                    }, 1000);
                                                                });
                                                            }
                                                        }, 1000);
                                                    } else {
                                                        console.log('Brak jagód');
                                                        window.setTimeout(function() {
                                                            if (autoGo) {
                                                                probujWznowicAutoGo(array, autoGoBefore);
                                                            }
                                                        }, 1000);
                                                    }
                                                })
                                            }
                                        } else {
                                            console.log('Wykorzystałeś limit niebieskich jagód na dzisiaj');
                                            window.setTimeout(function() {
                                                if (autoGo) {
                                                    probujWznowicAutoGo(array, autoGoBefore);
                                                }
                                            }, 1000);
                                        }
                                    }, 1000);
                                });
                            }
                            break;
                        case "useZieloneNapoje":
                            console.log('Próbuje przywrócić PA za pomocą zielonych napojów');
                            if ($("a[href='gra/statystyki.php']").length > 0 && autoGo) {
                                reloadMain("#glowne_okno", "gra/statystyki.php", function() {
                                    window.setTimeout(function() {
                                        var ileJuzWypitych = Number($("#statystyki b:contains('Napoje Energetyczne:')").parent().next().html().split('/')[0].trim());
                                        var ileMozna = (Number($("#statystyki b:contains('Napoje Energetyczne:')").parent().next().html().split('/')[1].trim()) - 1);
                                        if (ileJuzWypitych < ileMozna) {
                                            if ($("a[href='gra/plecak.php']").length > 0 && autoGo) {
                                                reloadMain("#glowne_okno", "gra/plecak.php", function() {
                                                    if ($('.thumbnail-plecak[data-target="#plecak-1"] h5').length > 0) {
                                                        window.setTimeout(function() {
                                                            if (autoGo) {
                                                                var maxPA = $('#sidebar .progress-bar:contains(" PA")').attr('aria-valuemax');
                                                                var ile = Math.floor($('#sidebar .progress-bar:contains(" PA")').attr('aria-valuemax') / 100);
                                                                var iloscNapojow = Number($('.thumbnail-plecak[data-target="#plecak-1"] h5').html().split(' x ')[0]);

                                                                var maxDoLimitow = ileMozna - ileJuzWypitych;

                                                                if (ile > iloscNapojow) {
                                                                    ile = iloscNapojow;
                                                                }

                                                                if (ile > maxDoLimitow) {
                                                                    ile = maxDoLimitow;
                                                                }

                                                                reloadMain("#glowne_okno", "gra/plecak.php?uzyj&p=1&postData%5B0%5D%5Bname%5D=rodzaj_przedmiotu&postData%5B0%5D%5Bvalue%5D=zielony_napoj&postData%5B1%5D%5Bname%5D=ilosc&postData%5B1%5D%5Bvalue%5D=" + ile, function() {
                                                                    $('#goAutoButton').html('STOP');
                                                                    console.log('Przywrócono PA');
                                                                    window.setTimeout(function() {
                                                                        if (autoGo) {
                                                                            autoGoWznawianie = false;
                                                                            click();
                                                                        }
                                                                    }, 1000);
                                                                });
                                                            }
                                                        }, 1000);
                                                    } else {
                                                        console.log('Brak napojów');
                                                        window.setTimeout(function() {
                                                            if (autoGo) {
                                                                probujWznowicAutoGo(array, autoGoBefore);
                                                            }
                                                        }, 1000);
                                                    }
                                                })
                                            }
                                        } else {
                                            console.log('Wykorzystałeś limit napojów na dzisiaj');
                                            window.setTimeout(function() {
                                                if (autoGo) {
                                                    probujWznowicAutoGo(array, autoGoBefore);
                                                }
                                            }, 1000);
                                        }
                                    }, 1000);
                                });
                            }
                            break;
                        case "useNiebieskieNapoje":
                            console.log('Próbuje przywrócić PA za pomocą niebieskich napojów');
                            if ($("a[href='gra/statystyki.php']").length > 0 && autoGo) {
                                reloadMain("#glowne_okno", "gra/statystyki.php", function() {
                                    window.setTimeout(function() {
                                        if (Number($("#statystyki b:contains('Napoje Energetyczne:')").parent().next().html().split('/')[0].trim()) < (Number($("#statystyki b:contains('Napoje Energetyczne:')").parent().next().html().split('/')[1].trim()) - 1)) {
                                            if ($("a[href='gra/plecak.php']").length > 0 && autoGo) {
                                                reloadMain("#glowne_okno", "gra/plecak.php", function() {
                                                    if ($('.thumbnail-plecak[data-target="#plecak-4"] h5').length > 0) {
                                                        window.setTimeout(function() {
                                                            if (autoGo) {
                                                                reloadMain("#glowne_okno", "gra/plecak.php?uzyj&p=1&postData%5B0%5D%5Bname%5D=rodzaj_przedmiotu&postData%5B0%5D%5Bvalue%5D=napoj_energetyczny&postData%5B1%5D%5Bname%5D=ilosc&postData%5B1%5D%5Bvalue%5D=1", function() {
                                                                    $('#goAutoButton').html('STOP');
                                                                    console.log('Przywrócono PA');
                                                                    window.setTimeout(function() {
                                                                        if (autoGo) {
                                                                            autoGoWznawianie = false;
                                                                            click();
                                                                        }
                                                                    }, 1000);
                                                                });
                                                            }
                                                        }, 1000);
                                                    } else {
                                                        console.log('Brak napojów');
                                                        window.setTimeout(function() {
                                                            if (autoGo) {
                                                                probujWznowicAutoGo(array, autoGoBefore);
                                                            }
                                                        }, 1000);
                                                    }
                                                })
                                            }
                                        } else {
                                            console.log('Wykorzystałeś limit napojów na dzisiaj');
                                            window.setTimeout(function() {
                                                if (autoGo) {
                                                    probujWznowicAutoGo(array, autoGoBefore);
                                                }
                                            }, 1000);
                                        }
                                    }, 1000);
                                });
                            }
                            break;
                        case "useCzerwoneNapoje":
                            console.log('Próbuje przywrócić PA za pomocą czerwonych napojów');
                            if ($("a[href='gra/statystyki.php']").length > 0 && autoGo) {
                                reloadMain("#glowne_okno", "gra/statystyki.php", function() {
                                    window.setTimeout(function() {
                                        if ($("a[href='gra/plecak.php']").length > 0 && autoGo) {
                                            reloadMain("#glowne_okno", "gra/plecak.php", function() {
                                                if ($('.thumbnail-plecak[data-target="#plecak-5"] h5').length > 0) {
                                                    window.setTimeout(function() {
                                                        if (autoGo) {
                                                            reloadMain("#glowne_okno", "gra/plecak.php?uzyj&p=1&postData%5B0%5D%5Bname%5D=rodzaj_przedmiotu&postData%5B0%5D%5Bvalue%5D=duzy_napoj_energetyczny&postData%5B1%5D%5Bname%5D=ilosc&postData%5B1%5D%5Bvalue%5D=1", function() {
                                                                $('#goAutoButton').html('STOP');
                                                                console.log('Przywrócono PA');
                                                                window.setTimeout(function() {
                                                                    if (autoGo) {
                                                                        autoGoWznawianie = false;
                                                                        click();
                                                                    }
                                                                }, 1000);
                                                            });

                                                        }
                                                    }, 1000);
                                                } else {
                                                    console.log('Brak napojów');
                                                    window.setTimeout(function() {
                                                        if (autoGo) {
                                                            probujWznowicAutoGo(array, autoGoBefore);
                                                        }
                                                    }, 1000);
                                                }
                                            })
                                        }
                                    }, 1000);
                                });
                            }
                            break;
                        default:
                            // code block
                    }
                } else {
                    autoGoWznawianie = false;
                    autoGo = false;
                    $('#goAutoButton').html('AutoGO');
                    $("#goStopReason").html("Brak PA").show();
                    document.title = "Brak PA";
                }
            } else {
                autoGoWznawianie = false;
                autoGo = false;
                $('#goAutoButton').html('AutoGO');
            }
        }

        $(document).on("click", "#goStopReason", function() {
            $(this).hide();
        })


        function przerwijAutoGoZPowoduBrakuPA(wznawiaj) {
            var autoGoBefore = autoGo;
            autoGoWznawianie = true;
            console.log('PokeLifeScript: brak PA, próbuje wznowić');

            if (wznawiaj) {
                var array = [];
                if (window.localStorage.useCzerwoneNapoje == "true" || window.localStorage.useCzerwoneNapoje == true) {
                    array.push("useCzerwoneNapoje");
                }
                if (window.localStorage.useNiebieskieNapoje == "true" || window.localStorage.useNiebieskieNapoje == true) {
                    array.push("useNiebieskieNapoje");
                }
                if (window.localStorage.useZieloneNapoje == "true" || window.localStorage.useZieloneNapoje == true) {
                    array.push("useZieloneNapoje");
                }
                if (window.localStorage.useNiebieskieJagody == "true" || window.localStorage.useNiebieskieJagody == true) {
                    array.push("useNiebieskieJagody");
                }
                if (window.localStorage.useOnlyInNight == "true" || window.localStorage.useOnlyInNight == true) {
                    var d = new Date();
                    var h = d.getHours();
                    if (h >= 22 || h < 6) {
                        window.setTimeout(function() {
                            probujWznowicAutoGo(array, autoGoBefore);
                        }, 1000);
                    } else {
                        autoGoWznawianie = false;
                        autoGo = false;
                        $('#goAutoButton').html('AutoGO');
                        $("#goStopReason").html("Brak PA").show();
                        document.title = "Brak PA";
                    }
                } else {
                    window.setTimeout(function() {
                        probujWznowicAutoGo(array, autoGoBefore);
                    }, 1000);
                }
            } else {
                autoGoWznawianie = false;
                autoGo = false;
                $('#goAutoButton').html('AutoGO');
            }
        }


        afterReloadMain(function() {
            if (autoGo && !autoGoWznawianie) {
                window.setTimeout(function() {
                    if (autoGo) {
                        click();
                    }
                }, clickDelay);
                clickDelay = getRandomInt(timeoutMin, timeoutMax);
            }
        })
    }
    initAutoGo();



    // **********************
    //
    // initVersionInfo
    // Funkcja dodająca numer wersji na dole strony
    //
    // **********************
    function initVersionInfo() {
        $('body').append('<div id="newVersionInfo" style="border-radius: 4px; position: fixed; cursor: pointer; bottom: 10px; right: 20px; font-size: 19px; text-align: center; width: auto; height: 30px; line-height: 35px; z-index: 9998; text-align: right;"><a style="color: yellow !important;text-decoration:none;" target="_blank" href="https://github.com/krozum/pokelife#user-content-changelog">' + 'v' + GM_info.script.version + '</a></div>');
    };
    initVersionInfo();





    // **********************
    //
    // initAutouzupelnianiePol
    // Funkcja dodająca logowanie tego co wyświetla sie na ekranie
    //
    // **********************
    function initAutouzupelnianiePol() {

        $(document).on("click", "#plecak-jagody .thumbnail-plecak, .thumbnail-plecak[data-target='#plecak-11'], .thumbnail-plecak[data-target='#plecak-14'], .thumbnail-plecak[data-target='#plecak-15'], .thumbnail-plecak[data-target='#plecak-8'], .thumbnail-plecak[data-target='#plecak-7'], .thumbnail-plecak[data-target='#plecak-19'], .thumbnail-plecak[data-target='#plecak-16']", function(event) {
            var id = $(this).data("target");
            var ilosc = $(this).find("h5").html().split(" ")[0];
            $(id + ' input[name="ilosc"]').val(ilosc);
        });

        onReloadMain(function() {
            if (this.find('.panel-heading').html() === "Centrum wymiany Punktów Zasług") {
                var dostepne = Number(this.find('.panel-body big').html().split(" ")[0]);
                var cena_zakupu = Number(this.find('#target0').parent().find("b").html().split("¥")[0].replace(/\./g, ''));
                var ilosc_yenow = Number($('a[href="http://pokelife.pl/pokedex/index.php?title=Pieniądze"]').parent().html().split("</a>")[1].split("<a")[0].replace(/\./g, ''));

                var ile_moge_kupic = Number((ilosc_yenow / cena_zakupu).toFixed());

                if (ile_moge_kupic > dostepne) {
                    ile_moge_kupic = dostepne;
                }

                console.log('PokeLifeScript: dostępnych PZ do kupienia: ' + ile_moge_kupic);
                this.find('#target0').attr("value", ile_moge_kupic);
            }
        })
    }
    initAutouzupelnianiePol();




    // **********************
    //
    // initShinyWidget
    // Funkcja pokazująca ostatnie 3 złapane shiny na rynku
    //
    // **********************

    function initShinyWidget() {
        var shinyWidget;

        function refreshShinyWidget() {
            var api = "https://bra1ns.pl/pokelife/api/get_shiny.php?login=" + $('#wyloguj').parent().parent().html().split("<div")[0].trim();
            $.getJSON(api, {
                format: "json"
            }).done(function(data) {
                var html = '<div class="panel panel-primary"><div class="panel-heading">Ostatnio spotkane shiny<div class="navbar-right"><span id="refreshShinyWidget" style="color: white; top: 4px; font-size: 16px; right: 3px;" class="glyphicon glyphicon-refresh" aria-hidden="true"></span></div></div><table class="table table-striped table-condensed"><tbody><tr>';
                $.each(data.list, function(key, value) {
                    var wystepowanie = "";
                    var nazwa = "";
                    if (pokemonData != undefined) {
                        if (pokemonData['kanto'][value['pokemon_id']] != undefined) {
                            wystepowanie = "Kanto, " + pokemonData['kanto'][value['pokemon_id']].wystepowanie;
                            nazwa = pokemonData['kanto'][value['pokemon_id']].name;
                        } else if (pokemonData['johto'][value['pokemon_id']] != undefined) {
                            wystepowanie = "Johto, " + pokemonData['johto'][value['pokemon_id']].wystepowanie;
                            nazwa = pokemonData['johto'][value['pokemon_id']].name;
                        } else if (pokemonData['hoenn'][value['pokemon_id']] != undefined) {
                            wystepowanie = "Hoenn, " + pokemonData['hoenn'][value['pokemon_id']].wystepowanie;
                            nazwa = pokemonData['hoenn'][value['pokemon_id']].name;
                        } else if (pokemonData['sinnoh'][value['pokemon_id']] != undefined) {
                            wystepowanie = "Sinnoh, " + pokemonData['sinnoh'][value['pokemon_id']].wystepowanie;
                            nazwa = pokemonData['sinnoh'][value['pokemon_id']].name;
                        } else if (pokemonData['unova'][value['pokemon_id']] != undefined) {
                            wystepowanie = "Unova, " + pokemonData['unova'][value['pokemon_id']].wystepowanie;
                            nazwa = pokemonData['unova'][value['pokemon_id']].name;
                        }
                    }
                    html = html + "<td data-toggle='tooltip' data-placement='top' title='' data-original-title='Spotkany : " + value['creation_date'] + "' style='text-align: center;'><a target='_blank' href='https://pokelife.pl/pokedex/index.php?title=" + nazwa + "'><img src='pokemony/srednie/s" + value['pokemon_id'] + ".png' style='width: 40px; height: 40px;'></a></td>";
                });
                html = html + '</tr></tbody></table></div>';
                shinyWidget = html;
                $.get('inc/stan.php', function(data) { $("#sidebar").html(data); });
            });
        }
        refreshShinyWidget();

        onReloadSidebar(function() {
            this.find(".panel-heading:contains('Drużyna')").parent().before(shinyWidget);
            $('[data-toggle="tooltip"]').tooltip();
        })

        $(document).on("click", "#refreshShinyWidget", function(event) {
            refreshShinyWidget();
        });
    }
    initShinyWidget();




    // **********************
    //
    // initPlecakTMView
    // Funkcja dodająca nowy widok do zakładki z TM w plecaku
    //
    // **********************

    function initPlecakTMView() {
        var tmData;

        var api = "https://raw.githubusercontent.com/krozum/pokelife/master/tm.json";
        $.getJSON(api, {
            format: "json"
        }).done(function(data) {
            tmData = data;
        });

        onReloadMain(function() {
            if (this.find('.panel-heading').html() === "Plecak") {
                this.find('#plecak-tm > .row > div.col-xs-4').each(function(index, val) {
                    var id = $(this).find('h3').html().split(" ")[1];
                    $(this).find("br").remove();
                    if (tmData["tm"][id - 1]["category_id"] == 1) {
                        $(this).children().css("background-color", "#f9856e");
                    }
                    if (tmData["tm"][id - 1]["category_id"] == 2) {
                        $(this).children().css("background-color", "#4d98b0");
                    }
                    if (tmData["tm"][id - 1]["category_id"] == 3) {
                        $(this).children().css("background-color", "#bdbcbb");
                    }
                    $(this).children().prepend('<br><img src="https://pokelife.pl/images/typy/' + tmData["tm"][id - 1]["type_id"] + '.png" style="width: 40px;">');
                });
            }
        })
    }
    initPlecakTMView();




    // **********************
    //
    // initPlecakTrzymaneView
    // Funkcja zmieniająca wygląd plecaka
    //
    // **********************
    function initPlecakTrzymaneView() {
        onReloadMain(function() {
            if (this.find('.panel-heading').html() === "Plecak") {
                var DATA = this;
                var arrayUzywane = [];
                var arrayJajka = [];
                var arrayMega = [];
                var arrayInne = [];
                var arrayInne2 = [];
                var arrayInne3 = [];
                var arrayInne4 = [];
                var arrayInne5 = [];
                var arrayModal = [];
                $.each(this.find('#plecak-trzymane > .row > div'), function(index, item) {
                    if ($(item).find(".modal-dialog").length > 0) {
                        arrayModal.push(item)
                    } else if ($(item).find(".caption .text-center:contains('Używa: ')").length > 0) {
                        arrayUzywane.push($(item));
                    } else if ($(item).find("img[src='images/przedmioty/100x100/lucky_egg.png']").length > 0) {
                        arrayJajka.push($(item));
                    } else if ($(item).find(".caption:contains('ite V')").length > 0) {
                        arrayMega.push($(item));
                    } else if ($(item).find(".caption:contains('ite X V')").length > 0) {
                        arrayMega.push($(item));
                    } else if ($(item).find(".caption:contains('ite Y V')").length > 0) {
                        arrayMega.push($(item));
                    } else if ($(item).find(".caption:contains(' V')").length > 0) {
                        arrayInne5.push($(item));
                    } else if ($(item).find(".caption:contains(' IV')").length > 0) {
                        arrayInne4.push($(item));
                    } else if ($(item).find(".caption strong:contains(' III')").length > 0) {
                        arrayInne3.push($(item));
                    } else if ($(item).find(".caption strong:contains(' II')").length > 0) {
                        arrayInne2.push($(item));
                    } else {
                        arrayInne.push($(item));
                    }
                    item.remove();
                })

                if (arrayUzywane.length > 0) {
                    var html = "<div class='row'><div class='col-xs-12'><h3 style='text-align: center;'>Używane</h3>";
                    $.each(arrayUzywane, function(index, item) {
                        html = html + '<div class="col-xs-4 col-sm-3 col-md-3 col-lg-3" style="margin: 0; padding: 0;">' + item.html() + '</div>';
                    })
                    html = html + "</div></div>"
                    this.find('#plecak-trzymane > .row').append(html);
                }

                if (arrayJajka.length > 0) {
                    html = "<div class='row'><div class='col-xs-12'><h3 style='text-align: center;'>Szczęśliwe jajko</h3>";
                    $.each(arrayJajka, function(index, item) {
                        html = html + '<div class="col-xs-4 col-sm-3 col-md-3 col-lg-3" style="margin: 0; padding: 0;">' + item.html() + '</div>';
                    })
                    html = html + "</div></div>"
                    this.find('#plecak-trzymane > .row').append(html);
                }

                if (arrayMega.length > 0) {
                    html = "<div class='row'><div class='col-xs-12'><h3 style='text-align: center;'>Mega kamienie</h3>";
                    $.each(arrayMega, function(index, item) {
                        html = html + '<div class="col-xs-4 col-sm-3 col-md-3 col-lg-3" style="margin: 0; padding: 0;">' + item.html() + '</div>';
                    })
                    html = html + "</div></div>"
                    this.find('#plecak-trzymane >.row').append(html);
                }

                if (arrayInne5.length > 0) {
                    html = "<div class='row'><div class='col-xs-12'><h3 style='text-align: center;'>Inne V</h3>";
                    $.each(arrayInne5, function(index, item) {
                        html = html + '<div class="col-xs-4 col-sm-3 col-md-3 col-lg-3" style="margin: 0; padding: 0;">' + item.html() + '</div>';
                    })
                    html = html + "</div></div>"
                    this.find('#plecak-trzymane > .row').append(html);
                }

                if (arrayInne4.length > 0) {
                    html = "<div class='row'><div class='col-xs-12'><h3 style='text-align: center;'>Inne IV</h3>";
                    $.each(arrayInne4, function(index, item) {
                        html = html + '<div class="col-xs-4 col-sm-3 col-md-3 col-lg-3" style="margin: 0; padding: 0;">' + item.html() + '</div>';
                    })
                    html = html + "</div></div>"
                    this.find('#plecak-trzymane > .row').append(html);
                }

                if (arrayInne3.length > 0) {
                    html = "<div class='row'><div class='col-xs-12'><h3 style='text-align: center;'>Inne III</h3>";
                    $.each(arrayInne3, function(index, item) {
                        html = html + '<div class="col-xs-4 col-sm-3 col-md-3 col-lg-3" style="margin: 0; padding: 0;">' + item.html() + '</div>';
                    })
                    html = html + "</div></div>"
                    this.find('#plecak-trzymane > .row').append(html);
                }

                if (arrayInne2.length > 0) {
                    html = "<div class='row'><div class='col-xs-12'><h3 style='text-align: center;'>Inne II</h3>";
                    $.each(arrayInne2, function(index, item) {
                        html = html + '<div class="col-xs-4 col-sm-3 col-md-3 col-lg-3" style="margin: 0; padding: 0;">' + item.html() + '</div>';
                    })
                    html = html + "</div></div>"
                    this.find('#plecak-trzymane > .row').append(html);
                }

                if (arrayInne.length > 0) {
                    html = "<div class='row'><div class='col-xs-12'><h3 style='text-align: center;'>Inne</h3>";
                    $.each(arrayInne, function(index, item) {
                        html = html + '<div class="col-xs-4 col-sm-3 col-md-3 col-lg-3" style="margin: 0; padding: 0;">' + item.html() + '</div>';
                    })
                    html = html + "</div></div>"
                    this.find('#plecak-trzymane > .row').append(html);
                }

                var THAT = this;
                $.each(arrayModal, function(index, item) {
                    $(item).appendTo(THAT.find('#plecak-trzymane > .row'));
                })
            }
        })
    }
    initPlecakTrzymaneView();




    // **********************
    //
    // initSzybkieKlikanieWLinkiPromocyjne
    // Funkcja dodająca szybkie klikanie w linki promocyjne
    //
    // **********************
    function initSzybkieKlikanieWLinkiPromocyjne() {

        function clickInLink(number, id) {
            if (number < 6) {
                var w = window.open("", "myWindow", "width=200,height=100");
                w.location.href = 'http://pokelife.pl/index.php?k=' + number + '&g=' + id;
                $(w).load(window.setTimeout(function() {
                    w.close();
                    $('#klikniecie-' + number).html('TAK');
                    console.log('PokeLifeScript: klikam link ' + number);
                    window.setTimeout(function() { clickInLink(number + 1, id); }, 300);
                }, 300));
            } else {
                window.setTimeout(function() {
                    $.get('inc/stan.php', function(data) { $("#sidebar").html(data); });
                }, 100);
            }
        }

        onReloadMain(function() {
            var DATA = this;
            if (DATA.find('.panel-heading').html() === "Promuj stronę") {
                var html = '<div class="col-xs-12" style=" text-align: center; "><button id="clickAllLinks" style=" background-color: ' + $('.panel-heading').css('background-color') + '; border: 1px solid ' + $('.panel-heading').css('background-color') + '; border-radius: 5px; padding: 2px 20px; line-height: 20px; height: 30px; ">Wyklikaj wszystkie</button></div>';
                DATA.find('.panel-body>div:first-of-type').append(html);
            }
        })

        $(document).on("click", "#clickAllLinks", function(event) {
            var id = $('#klikniecie-1').parent().find("a").attr("onclick").split(",")[1].split(")")[0];
            window.setTimeout(function() { clickInLink(1, id); }, 200);
        });
    }
    initSzybkieKlikanieWLinkiPromocyjne();




    // **********************
    //
    // initStatystykiLink
    // Funkcja dodająca link do statystyk
    //
    // **********************
    function initStatystykiLink() {
        $('body').append('<a id="PokeLifeScriptStats" style="color: #333333 !important;text-decoration:none;" target="_blank" href="https://bra1ns.pl/pokelife/stats/"><div class="plugin-button" style="border-radius: 4px;position: fixed;cursor: pointer;top: 15px;left: 220px;font-size: 19px;text-align: center;width: 100px;height: 30px;line-height: 35px;z-index: 9998;text-align: center;line-height: 30px;color: #333333;">Statystyki</div></a>');
        $("#PokeLifeScriptStats").attr("href", "https://bra1ns.pl/pokelife/stats/?login=" + md5($('#wyloguj').parent().parent().html().split("<div")[0].trim()));
    }
    initStatystykiLink();




    // **********************
    //
    // initLogger
    // Funkcja dodająca logowanie tego co wyświetla sie na ekranie
    // eventTypeId:
    // 1 - pusta wyprawa
    // 2 - walka z trenerem wygrana
    // 3 - walka z trenerem przegrana
    // 4 - spotkany pokemon
    // 5 - walka wygrana
    // 6 - walka przegrana
    // 7 - pokemon złapany
    // 8 - pokemon niezłapany
    // 9 - zebrane jagody
    // 10 - event w dziczy
    // **********************
    function initLogger() {
        var aktualnyPokemonDzicz;
        onReloadMain(function(url) {
            var dzicz = null;
            if (url != null && url.indexOf('miejsce=') != -1) {
                dzicz = url.split('miejsce=')[1].split('&')[0];
            }
            var DATA = this;

            if (url == "gra/aktywnosc.php?p=praca&przerwij") {
                if (DATA.find("p.alert-success:contains('Otrzymujesz wynagrodzenie w wysokości')").length > 0) {
                    var yeny = DATA.find("p.alert-success b").html().split(' ')[0].replace(/\./g, '');
                    updateStats("zarobek_z_pracy", yeny);
                }
            }


            if (DATA.find("p.alert-info:contains('Niestety, tym razem nie spotkało cię nic interesującego.')").length > 0) {
                console.log('PokeLifeScript: pusta wyprawa');
                updateEvent("Niestety, tym razem nie spotkało cię nic interesującego", 1, dzicz);
            } else if (DATA.find("p.alert-success:contains('pojedynek')").length > 0) {
                console.log('PokeLifeScript: walka z trenerem');
                updateStats("walki_z_trenerami", 1);
                var pd = 0;
                var json = "";
                if (DATA.find(".alert-success:not(:contains('Moc odznaki odrzutowca sprawia'))").length > 2) {
                    $.each(DATA.find(".alert-success:not(:contains('Moc odznaki odrzutowca sprawia')):nth(2) b").html().split("PD<br>"), function(key, value) {
                        if (value != "") {
                            pd = pd + Number(value.split("+")[1]);
                            json = json + '"' + value.split("+")[0].trim() + '":"' + Number(value.split("+")[1]) + '",';
                        }
                    });
                    pd = pd.toFixed(2);
                    updateStats("zarobki_z_trenerow", DATA.find(".alert-success:not(:contains('Moc odznaki odrzutowca sprawia')):nth(1) b").html().split(" ¥")[0]);
                    updateStats("zdobyte_doswiadczenie", pd);
                    updateEvent("Na twojej drodze staje inny trener pokemon, który wyzywa Cię na pojedynek. Wygrywasz <b>" + DATA.find(".alert-success:not(:contains('Moc odznaki odrzutowca sprawia')):nth(1) b").html().split(" ¥")[0] + "</b> ¥. Zdobyte doświadczenie: <b>" + pd + "</b>", 2, dzicz);
                    updateStatsDoswiadczenie("{" + json.substring(0, json.length - 1) + "}");
                } else {
                    $.each(DATA.find(".alert-success:not(:contains('Moc odznaki odrzutowca sprawia')):nth(1) b").html().split("PD<br>"), function(key, value) {
                        if (value != "") {
                            pd = pd + Number(value.split("+")[1]);
                            json = json + '"' + value.split("+")[0].trim() + '":"' + Number(value.split("+")[1]) + '",';
                        }
                    });
                    pd.toFixed(2);
                    updateStats("zdobyte_doswiadczenie", pd);
                    updateEvent("Na twojej drodze staje inny trener pokemon, który wyzywa Cię na pojedynek ale niestety go przegrywasz. Zdobyte doświadczenie: <b>" + pd + "</b>", 3, dzicz);
                    updateStatsDoswiadczenie("{" + json.substring(0, json.length - 1) + "}");
                }
            } else if (DATA.find(".dzikipokemon-background-normalny").length > 0) {
                console.log('PokeLifeScript: spotkany pokemon');
                updateEvent("Spotkany pokemon <b>" + DATA.find('.panel-primary i').html() + "</b>", 4, dzicz);
                aktualnyPokemonDzicz = DATA.find('.panel-primary i').html();
            } else if (DATA.find("h2:contains('Złap Pokemona')").length > 0) {
                console.log('PokeLifeScript: pokemon pokonany');
                updateStats("wygranych_walk_w_dziczy", 1);
                updateStats("zdobyte_doswiadczenie", DATA.find('p.alert-success:first').html().split("Zwycięstwo! ")[1].split("</b> +")[1].split(' PD')[0]);
                updateStatsDoswiadczenie('{"' + DATA.find('.panel-body b b').html() + '":"' + DATA.find('p.alert-success:first').html().split("Zwycięstwo! ")[1].split("</b> +")[1].split(' PD')[0] + '"}');
                updateEvent("Wygrałeś walke z <b>" + aktualnyPokemonDzicz + "</b>. Zdobyłeś <b>" + DATA.find('p.alert-success:first').html().split("Zwycięstwo! ")[1].split("</b> +")[1].split(' PD')[0] + "</b> punktów doświadczenia", 5, dzicz);
            } else if (DATA.find("h2:contains('Pokemon Ucieka')").length > 0) {
                console.log('PokeLifeScript: pokemon pokonany ale ucieka');
                updateStats("wygranych_walk_w_dziczy", 1);
                updateStats("zdobyte_doswiadczenie", DATA.find('p.alert-success:first').html().split("Zwycięstwo! ")[1].split("</b> +")[1].split(' PD')[0]);
                updateStatsDoswiadczenie('{"' + DATA.find('.panel-body b b').html() + '":"' + DATA.find('p.alert-success:first').html().split("Zwycięstwo! ")[1].split("</b> +")[1].split(' PD')[0] + '"}');
                updateEvent("Wygrałeś walke z <b>" + aktualnyPokemonDzicz + "</b>. Zdobyłeś <b>" + DATA.find('p.alert-success:first').html().split("Zwycięstwo! ")[1].split("</b> +")[1].split(' PD')[0] + "</b> punktów doświadczenia", 5, dzicz);
            } else if (DATA.find(".panel-body > p.alert-success:contains('Udało Ci się złapać')").length > 0) {
                console.log('PokeLifeScript: pokemon złapany');
                updateEvent("Udało ci sie złapać <b>" + aktualnyPokemonDzicz + "</b>.", 7, dzicz);
                updateStats("zlapanych_pokemonow", 1);
                if (DATA.find('p.alert-success:nth(1):contains("nie masz już miejsca")').length > 0) {
                    var zarobek = DATA.find('p.alert-success:nth(1):contains("nie masz już miejsca") strong').html().split(" ")[0].replace(/\./g, '');
                    updateStats("zarobki_z_hodowli", zarobek);
                }
            } else if (DATA.find(".panel-body > p.alert-danger:contains('uwolnił')").length > 0) {
                console.log('PokeLifeScript: pokemon sie uwolnił');
                updateStats("niezlapanych_pokemonow", 1);
                updateEvent("<b>" + aktualnyPokemonDzicz + " się uwolnił.", 8, dzicz);
            } else if (DATA.find(".panel-body > p.alert-danger:contains('Przegrana')").length > 0) {
                console.log('PokeLifeScript: przegrana walka');
                updateStats("przegranych_walk_w_dziczy", 1);
                updateEvent("Przegrana walka z <b>" + aktualnyPokemonDzicz + "</b>. Musisz uciekać. ", 6, dzicz);
            } else if (DATA.find(".panel-body > p.alert-success").length > 0 && DATA.find('.panel-heading').html() == 'Dzicz - wyprawa') {
                console.log('PokeLifeScript: event w dziczy');
                if (DATA.find('p.alert-success:not(:contains("Moc odznaki odrzutowca sprawia")):first').html() != undefined && DATA.find('p.alert-success:not(:contains("Moc odznaki odrzutowca sprawia")):first').html().indexOf("Jagód") != -1) {
                    if (DATA.find('p.alert-success:not(:contains("Moc odznaki odrzutowca sprawia")):first b').html() == "Czerwonych Jagód") {
                        updateStats("zebrane_czerwone_jagody", DATA.find('p.alert-success:not(:contains("Moc odznaki odrzutowca sprawia")):first b:nth(1)').html());
                    } else if (DATA.find('p.alert-success:not(:contains("Moc odznaki odrzutowca sprawia")):first b').html() == "Niebieskich Jagód") {
                        updateStats("zebrane_niebieskie_jagody", DATA.find('p.alert-success:not(:contains("Moc odznaki odrzutowca sprawia")):first b:nth(1)').html());
                    } else if (DATA.find('p.alert-success:not(:contains("Moc odznaki odrzutowca sprawia")):first b').html() == "Fioletowych Jagód") {
                        updateStats("zebrane_fioletowe_jagody", DATA.find('p.alert-success:not(:contains("Moc odznaki odrzutowca sprawia")):first b:nth(1)').html());
                    } else if (DATA.find('p.alert-success:not(:contains("Moc odznaki odrzutowca sprawia")):first b').html() == "Żółtych Jagód") {
                        updateStats("zebrane_zolte_jagody", DATA.find('p.alert-success:not(:contains("Moc odznaki odrzutowca sprawia")):first b:nth(1)').html());
                    } else if (DATA.find('p.alert-success:not(:contains("Moc odznaki odrzutowca sprawia")):first b').html() == "Białych Jagód") {
                        updateStats("zebrane_biale_jagody", DATA.find('p.alert-success:not(:contains("Moc odznaki odrzutowca sprawia")):first b:nth(1)').html());
                    } else if (DATA.find('p.alert-success:not(:contains("Moc odznaki odrzutowca sprawia")):first b:nth(1)').html() == "Czerwonych Jagód") {
                        updateStats("zebrane_czerwone_jagody", DATA.find('p.alert-success:not(:contains("Moc odznaki odrzutowca sprawia")):first b:nth(0)').html());
                    } else if (DATA.find('p.alert-success:not(:contains("Moc odznaki odrzutowca sprawia")):first b:nth(1)').html() == "Niebieskich Jagód") {
                        updateStats("zebrane_niebieskie_jagody", DATA.find('p.alert-success:not(:contains("Moc odznaki odrzutowca sprawia")):first b:nth(0)').html());
                    } else if (DATA.find('p.alert-success:not(:contains("Moc odznaki odrzutowca sprawia")):first b:nth(1)').html() == "Fioletowych Jagód") {
                        updateStats("zebrane_fioletowe_jagody", DATA.find('p.alert-success:not(:contains("Moc odznaki odrzutowca sprawia")):first b:nth(0)').html());
                    } else if (DATA.find('p.alert-success:not(:contains("Moc odznaki odrzutowca sprawia")):first b:nth(1)').html() == "Żółtych Jagód") {
                        updateStats("zebrane_zolte_jagody", DATA.find('p.alert-success:not(:contains("Moc odznaki odrzutowca sprawia")):first b:nth(0)').html());
                    } else if (DATA.find('p.alert-success:not(:contains("Moc odznaki odrzutowca sprawia")):first b:nth(1)').html() == "Białych Jagód") {
                        updateStats("zebrane_biale_jagody", DATA.find('p.alert-success:not(:contains("Moc odznaki odrzutowca sprawia")):first b:nth(0)').html());
                    } else if (DATA.find('p.alert-success:not(:contains("Moc odznaki odrzutowca sprawia")):first b:nth(1)').html().indexOf("Jagód") != -1) {
                        updateStats("zebrane_inne_jagody", DATA.find('p.alert-success:not(:contains("Moc odznaki odrzutowca sprawia")):first b:nth(0)').html());
                    } else {
                        updateStats("zebrane_inne_jagody", DATA.find('p.alert-success:not(:contains("Moc odznaki odrzutowca sprawia")):first b:nth(1)').html());
                    }
                    updateEvent(DATA.find('.panel-body > p.alert-success').html(), 9, dzicz);
                } else if (DATA.find('.panel-heading').html() == 'Dzicz - wyprawa') {
                    updateEvent(DATA.find('.panel-body > p.alert-success').html(), 10, dzicz);
                }
            } else if (DATA.find(".panel-body > p.alert-info").length > 0 && DATA.find('.panel-heading').html() == 'Dzicz - wyprawa') {
                console.log('PokeLifeScript: event w dziczy');
                updateEvent(DATA.find('.panel-body > p.alert-info').html(), 10, dzicz);
            } else if (DATA.find(".panel-body > p.alert-warning").length > 0 && DATA.find('.panel-heading').html() == 'Dzicz - wyprawa') {
                console.log('PokeLifeScript: event w dziczy');
                updateEvent(DATA.find('.panel-body > p.alert-warning').html(), 10, dzicz);
            }
        })
    }
    initLogger();






    // **********************
    //
    // initWbijanieSzkoleniowca
    // Funkcja automatycznie przechodząca po przechowalni i zwiększaniu treningów do miniumum 7 w każdą statystyke
    //
    // **********************
    function initWbijanieSzkoleniowca() {
        var array = [];
        var affected = 0;
        var price = 0;
        var max = 0;
        var now = 0;

        //$('#pasek_skrotow > .navbar-nav').append('<li><a id="skrot_szkoleniowiec" href="#" data-toggle="tooltip" data-placement="top" title="" data-original-title="Wbijaj osiągnięcie szkoleniowca"><div class="pseudo-btn"><img src="https://raw.githubusercontent.com/krozum/pokelife/master/assets/3b79fd270c90c0dfd90763fcf1b54346-trofeo-de-campe--n-estrella-by-vexels.png"></div></a></li>');

        onReloadMain(function() {
            array = [];
            if (this.find('.panel-heading').html() === "Pokemony") {
                this.find('#pokemony-przechowalnia select[name="kolejnosc"]').parent().prepend('<button class="plugin-button" id="wbijajSzkoleniowca" style="padding: 5px 10px; border-radius: 3px; margin-bottom: 15px">Wbijaj szkoleniowca</button><br>');
                $.each(this.find('#pokemony-przechowalnia .btn-podgladpoka'), function(index, item) {
                    if (Number($(item).parent().data('poziom')) >= 5) {
                        array.push($(item).data('id-pokemona'));
                    }
                })
            }
        })


        $(document).on('click', '#skrot_szkoleniowiec', function() {
            reloadMain("#glowne_okno", 'gra/druzyna.php?p=3', function() {
                $('#wbijajSzkoleniowca').trigger('click');
            });
        });

        $(document).on('click', '#wbijajSzkoleniowca', function() {
            max = array.length;
            now = 0;
            wbijajSzkoleniowca(array);
        });

        function trenuj(array, callback) {
            if (array.length > 0) {
                window.setTimeout(function() {
                    reloadMain("#glowne_okno", "gra/" + array.pop(), function() {
                        price = Number(price) + Number($('.alert-success b:nth(1)').html().split(" ¥")[0].replace(/\./g, ''));
                        trenuj(array, callback);
                    })
                }, 1000);
            } else {
                callback.call();
            }
        }

        function wbijajSzkoleniowca(array) {
            if (array.length > 0) {
                if ($('#szkoleniowiec_progress').length < 1) {
                    $('body').append('<div id="szkoleniowiec_progress" class="" style="position: fixed;bottom: 60px;width: 500px;height: auto;z-index: 999;margin: 0 auto;left: 0;right: 0;background-color: inherit;border: none;"><div class="progress" style="margin:0;box-shadow: none;border-radius: 0; border: 1px solid black"><div class="progress-bar progress-bar-danger" role="progressbar" style="border-radius: 0; width: ' + Number((((max - array.length) * 100) / max)).toFixed(0) + '%;"> <span>' + Number((((max - array.length) * 100) / max)).toFixed(0) + '%</span></div></div></div>');
                } else {
                    $('#szkoleniowiec_progress .progress-bar').css('width', Number((((max - array.length) * 100) / max)).toFixed(0) + '%');
                    $('#szkoleniowiec_progress .progress-bar span').html(Number((((max - array.length) * 100) / max)).toFixed(0) + '%');
                }
                var id = array.pop();
                now++;

                window.setTimeout(function() {
                    reloadMain("#glowne_okno", "gra/sala.php?p=" + id + "&zrodlo=rezerwa", function() {
                        var treningi = [];
                        var i;
                        for (var j = 1; j <= 6; j++) {
                            var count = Number($('.sala_atrybuty_tabelka .row:nth(' + j + ') > div:nth(2)').html());
                            var ile = 0;
                            if (j != 6) {
                                ile = 7 - count;
                            } else {
                                ile = 35 - count;
                                ile = ile / 5;
                            }
                            if (ile > 0) {
                                affected = affected + ile;
                                treningi.push($('.sala_atrybuty_tabelka .row:nth(' + j + ') > div:nth(3) > form').attr('action') + "&postData%5B0%5D%5Bname%5D=ilosc&postData%5B0%5D%5Bvalue%5D=" + ile);
                            }
                        }
                        trenuj(treningi, function() { wbijajSzkoleniowca(array) });
                    })
                }, 1000);
            } else {
                $('#szkoleniowiec_progress').remove();
                reloadMain("#glowne_okno", 'gra/druzyna.php?p=3', function() {
                    $('#pokemony-przechowalnia select[name="kolejnosc"]').parent().prepend('<p class="alert alert-success text-center">Wykonano <b>' + affected + '</b> treningów o łącznej wartości <b>' + price + ' ¥</b></p>');
                    price = 0;
                    affected = 0;
                });
            }
        }
    }
    initWbijanieSzkoleniowca();





    // **********************
    //
    // initChat
    // Funkcja automatycznie przechodząca po przechowalni i zwiększaniu treningów do miniumum 7 w każdą statystyke
    //
    // **********************
    function initChat() {
        window.localStorage.max_chat_id = 0;

        $('#chat-inner > ul').append('<li role="presentation" data-toggle="tooltip" data-placement="top" title="" data-original-title="Pokój widoczny wyłącznie dla użytkowników bota"><a href="#room-99999" aria-controls="room-99999" role="tab" data-toggle="tab" class="showRoomBot" data-room="99999" aria-expanded="true">Bot</a></li>');
        $('#shout_list').after('<ol style="list-style: none; display: none; margin: 0; padding: 0" id="bot_list"></ol>');
        $('#shoutbox-panel-footer').after('<div style="display: none;background: none;" id="shoutbox-bot-panel-footer" class="panel-footer input-group"><input id="shout_bot_message" type="text" class="form-control" placeholder="Wiadomość" name="message"> <span class="input-group-btn"> <button id="shout_bot_button" class="btn btn-primary" type="button">Wyślij</button> </span> </div>');


        $("a[href='#room-99999']").click(function() {
            $('#bot-chat-counter').css("display", "none");
            $('#bot-chat-counter').html(0);
        });

        $('.showRoomBot').click(function() {
            $('#shout_list').hide();
            $('#shoutbox-panel-footer').hide();
            $('#bot_list').show();
            $('#shout_refresher').hide();
            $('#shoutbox-bot-panel-footer').show();



            if ($('#shout_refresher:contains("tymczasowo wyłączony")').length > 0 && $('#bot_list li').length == 0) {
                $('#shouts').append("<button style='text-align: center; margin: 0 auto; display: block; margin-top: 20px;' class='btn btn-primary' id='zaloguj_czat_bot'>Zaloguj</button>");
            }
        });

        $('.showRoom').click(function() {
            $('#bot_list').hide();
            $('#shout_refresher').show();
            $('#shoutbox-bot-panel-footer').hide();
            $('#shout_list').show();
            $('#zaloguj_czat_bot').remove();
            $('#shoutbox-panel-footer').show();
        });

        var interval;

        $(document).on('click', '#zaloguj_chat,#zaloguj_czat_bot', function(e) {
            $('#zaloguj_czat_bot').remove();
            var url = 'https://bra1ns.pl/pokelife/api/get_czat.php?czat_id=' + window.localStorage.max_chat_id;
            $.getJSON(url, {
                format: "json"
            }).done(function(data) {
                if (data['list'] != undefined) {
                    var messages = data['list'].reverse();
                    $.each(messages, function(key, value) {
                        if (value['false_login'] == "bot") {
                            $("#bot_list").append('<li style="word-break: break-word;text-align: center;border-bottom: 2px dashed #aa1c00;padding-top: 3px;padding-bottom: 3px;color: #aa1c00;font-size: 18px;font-family: Arial;"><span>' + value["message"] + '</span></li>');
                        } else {
                            $("#bot_list").append('<li style="word-break: break-word;padding: 1px 5px 1px 5px;font-family: Georgia, \'Times New Roman\', Times, serif; font-size: 14px;"><span class="shout_post_date">(' + value["creation_date"].split(" ")[1] + ') </span><span class="shout_post_name2">' + value["false_login"] + '</span>: ' + value["message"] + '</li>');
                        }
                        window.localStorage.max_chat_id = value["czat_id"];
                    });
                    $('#shouts').animate({ scrollTop: $('#shouts').prop("scrollHeight") }, 500);
                }

                if (interval == undefined) {
                    interval = setInterval(function() {
                        var url = 'https://bra1ns.pl/pokelife/api/get_czat.php?czat_id=' + window.localStorage.max_chat_id;
                        $.getJSON(url, {
                            format: "json"
                        }).done(function(data) {
                            if (data['list'] != undefined) {
                                var messages = data['list'].reverse();
                                $.each(messages, function(key, value) {
                                    if (value['false_login'] == "bot") {
                                        $("#bot_list").append('<li style="word-break: break-word;text-align: center;border-bottom: 2px dashed #aa1c00;padding-top: 3px;padding-bottom: 3px;color: #aa1c00;font-size: 18px;font-family: Arial;"><span>' + value["message"] + '</span></li>');
                                    } else {
                                        $("#bot_list").append('<li style="word-break: break-word;padding: 1px 5px 1px 5px;font-family: Georgia, \'Times New Roman\', Times, serif; font-size: 14px;"><span class="shout_post_date">(' + value["creation_date"].split(" ")[1] + ') </span><span class="shout_post_name2">' + value["false_login"] + '</span>: ' + value["message"] + '</li>');
                                    }
                                    window.localStorage.max_chat_id = value["czat_id"];
                                });
                                $('#shouts').animate({ scrollTop: $('#shouts').prop("scrollHeight") }, 500);
                            }
                        });
                    }, 2500);
                }
            })
        })

        function wyslij() {
            var msg = $("#shout_bot_message").val();
            var value = $("#shout_button").val();
            if (msg.length > 255) {
                alert("Wiadomość za długa o " + (msg.length - 255));
            } else {
                $("#shout_button").val('Wysyłanie...');

                var url = 'https://bra1ns.pl/pokelife/api/update_czat.php';
                $.getJSON(url, {
                    format: "json",
                    message: msg,
                    login: $('#wyloguj').parent().parent().html().split("<div")[0].trim()
                }).done(function(data) {
                    $("#shout_bot_button").val(value);
                    $("#shout_bot_message").val('');
                });
            }
        }

        $('#shout_bot_message').keypress(function(event) {
            if (event.keyCode == 13) {
                wyslij();
            }
        });

        $("#shout_bot_button").click(function() {
            wyslij();
        });
    }
    initChat();





    // **********************
    //
    // initPokemonGracza
    // Funkcja zapisuje pokemony gracza w lizde
    //
    // **********************
    function initPokemonGracza() {
        onReloadMain(function() {
            var THAT = this;
            if (this.find('.panel-heading').html() === "Liga - pojedynek") {
                $.each(this.find('.pokazpoka[data-ignoruj-ukrycie="1"]'), function(index, item) {
                    var pokemon_id = $(item).data('id-pokemona');
                    var nazwa = $(item).val();
                    var gracz_id = THAT.find('input[name="walcz"]').val();
                    var login = THAT.find('big:nth(1)').html();
                    var url = 'https://bra1ns.pl/pokelife/api/update_pokemon_gracza.php';
                    $.getJSON(url, {
                        pokemon_id: pokemon_id,
                        gracz_id: gracz_id,
                        login: login,
                        nazwa: nazwa,
                    }).done(function(data) {});
                })
            }
        })
    }
    initPokemonGracza();



    // **********************
    //
    // initZadaniaWidget
    // Funkcja pokazująca aktualne zadania w sidebar
    //
    // **********************

    function initZadaniaWidget() {
        var d = new Date();
        var today = d.getFullYear() + "" + d.getMonth() + "" + d.getDate();
        var zadaniaWidget;

        function refreshZadaniaWidget() {
            $.ajax({
                type: 'POST',
                url: "gra/zadania.php"
            }).done(function(response) {
                var html = '<div class="panel panel-primary"><div data-time="' + today + '" class="panel-heading">Zadania<div class="navbar-right"><span id="refreshZadaniaWidget" style="color: white; top: 4px; font-size: 16px; right: 3px;" class="glyphicon glyphicon-refresh" aria-hidden="true"></span></div></div><table class="table table-striped table-condensed"><tbody>';
                $.each($(response).find('#zadania_codzienne .panel-primary .panel-heading'), function(key, value) {
                    if ($(value).html().split("<div")[0] !== "brak zadania") {
                        html = html + '<tr><td>' + $(value).html().split("<div")[0];
                    }
                    if ($(value).parent().find(".text-center").html() != undefined) {
                        $.each($(value).parent().find(".text-center p"), function(key2, value2) {
                            html = html + " - " + $(value2).html().trim();
                        })
                    }
                    html = html + '</tr></td>';
                });
                html = html + '</tbody></table></div>';
                zadaniaWidget = html;
                window.localStorage.zadaniaWidget = html;
                $.get('inc/stan.php', function(data) { $("#sidebar").html(data); });
            })
        }
        if (window.localStorage.zadaniaWidget == undefined || !window.localStorage.zadaniaWidget.includes(today)) {
            refreshZadaniaWidget();
        } else {
            zadaniaWidget = window.localStorage.zadaniaWidget;
        }

        onReloadSidebar(function() {
            if (zadaniaWidget != undefined && zadaniaWidget.length > 140) {
                this.find(".panel-heading:contains('Drużyna')").parent().after(zadaniaWidget);
            }
        })

        onReloadMain(function() {
            var THAT = this;
            if (this.find('.panel-heading').html() === "Zadania") {
                var html = '<div class="panel panel-primary"><div class="panel-heading">Zadania<div class="navbar-right"><span id="refreshZadaniaWidget" style="color: white; top: 4px; font-size: 16px; right: 3px;" class="glyphicon glyphicon-refresh" aria-hidden="true"></span></div></div><table class="table table-striped table-condensed"><tbody>';
                $.each(THAT.find('#zadania_codzienne .panel-primary .panel-heading'), function(key, value) {
                    if ($(value).html().split("<div")[0] !== "brak zadania") {
                        html = html + '<tr><td>' + $(value).html().split("<div")[0];
                    }
                    if ($(value).parent().find(".text-center").html() != undefined) {
                        $.each($(value).parent().find(".text-center p"), function(key2, value2) {
                            html = html + " - " + $(value2).html().trim();
                        })
                    }
                    html = html + '</tr></td>';
                });
                html = html + '</tbody></table></div>';
                zadaniaWidget = html;
            }
        })

        $(document).on("click", "#refreshZadaniaWidget", function(event) {
            refreshZadaniaWidget();
            $.get('inc/stan.php', function(data) { $("#sidebar").html(data); });
        });
    }
    initZadaniaWidget();



    // **********************
    //
    // initPokemonDniaWidget
    // Funkcja dodająca pokemona dnia do sidebaru
    //
    // **********************
    function initPokemonDniaWidget() {
        var d = new Date();
        var today = d.getFullYear() + "" + d.getMonth() + "" + d.getDate();
        var hodowlaPokemonDniaImage;
        var hodowlaPokemonDniaStowarzyszenieImage;

        if (window.localStorage.hodowlaPokemonDniaImage == undefined) {
            window.localStorage.hodowlaPokemonDniaImage = "";
            window.localStorage.hodowlaPokemonDniaStowarzyszenieImage = "";
        }

        if (!window.localStorage.hodowlaPokemonDniaImage.includes(today)) {
            $.ajax({
                type: 'POST',
                url: "gra/hodowla.php"
            }).done(function(response) {
                hodowlaPokemonDniaImage = $(response).find('#hodowla-glowne img').attr('src');
                window.localStorage.hodowlaPokemonDniaImage = today + "" + hodowlaPokemonDniaImage;
                hodowlaPokemonDniaStowarzyszenieImage = $(response).find('#hodowla-glowne img:nth(1)').attr('src');
                if ($(response).find('.panel-heading:contains("Pokemon dnia Stowa")').length == 0) {
                    hodowlaPokemonDniaStowarzyszenieImage = undefined;
                }
                window.localStorage.hodowlaPokemonDniaStowarzyszenieImage = today + "" + hodowlaPokemonDniaStowarzyszenieImage;
            });
        } else {
            hodowlaPokemonDniaImage = window.localStorage.hodowlaPokemonDniaImage.replace(today, "");
            hodowlaPokemonDniaStowarzyszenieImage = window.localStorage.hodowlaPokemonDniaStowarzyszenieImage.replace(today, "");
        }

        onReloadSidebar(function() {
            if (hodowlaPokemonDniaStowarzyszenieImage != undefined || hodowlaPokemonDniaStowarzyszenieImage != "undefined") {
                this.find('button[href="raport.php"]').parent().prepend('<img class="btn-akcja" href="hodowla.php?wszystkie&pokemon_dnia" src="https://gra.pokelife.pl/' + hodowlaPokemonDniaStowarzyszenieImage + '" data-toggle="tooltip" data-placement="top" title="" data-original-title="Pokemon Dnia Stowarzyszenia" style="cursor: pointer; width: 50px;margin-left: 10px; float: left; ">');
                this.find('button[href="raport.php"]').parent().css('margin-top', '10px').css('padding-right', '10px');
                $('[data-toggle="tooltip"]').tooltip();
            }
            if (hodowlaPokemonDniaImage != undefined) {
                this.find('button[href="raport.php"]').parent().prepend('<img class="btn-akcja" href="hodowla.php?wszystkie&pokemon_dnia_stow"" src="https://gra.pokelife.pl/' + hodowlaPokemonDniaImage + '" data-toggle="tooltip" data-placement="top" title="" data-original-title="Pokemon Dnia" style="cursor: pointer; width: 50px;margin-left: 10px; float: left; ">');
                this.find('button[href="raport.php"]').parent().css('margin-top', '10px').css('padding-right', '10px');
                $('[data-toggle="tooltip"]').tooltip();
            }
        })
    }
    initPokemonDniaWidget();



    // **********************
    //
    // initPrzypomnienieOPracy()
    // Funkcja dodająca przypomnienie o pracy po wyjściu poza obszar strony
    //
    function initPrzypomnienieOPracy() {
        $('body').append('<div id="jobAlertBox" style="position: fixed; width: 100%; height: 100%; background: linear-gradient(rgba(0, 0, 0, 0.65) 0%, rgba(0, 0, 0, 0) 100%); z-index: 99999; top: 0px; display: none;"><h1 style="text-align: center;color: #dadada;font-size: 90px;vertical-align: middle;">Brak aktywności</h1></div>');

        var addEvent = function(obj, evt, fn) {
            if (obj.addEventListener) {
                obj.addEventListener(evt, fn, false);
            } else if (obj.attachEvent) {
                obj.attachEvent("on" + evt, fn);
            }
        };

        addEvent(document, "mouseout", function(event) {
            event = event ? event : window.event;
            var d = new Date();
            var h = d.getHours();
            var from = event.relatedTarget || event.toElement;
            if ((!from || from.nodeName == "HTML") && event.clientY <= 10 && $('.alert-info a[href="aktywnosc.php"]').length == 0) {
                $("#jobAlertBox").css('display', 'block');
            }
        });

        addEvent(document, "mouseover", function(event) {
            $('#jobAlertBox').css('display', "none");
        });
    }
    initPrzypomnienieOPracy();

    function initSummary(DATA) {
        var summaryCount = 0;
        var summarYen = 0;
        var summaryZas = 0;

        var panel = $(DATA).find(".panel-primary")[0];
        table = $(panel).find("tr");
        $.each($(table), function(index, item) {
            var itemToSell = $(item).find("td");
            if (itemToSell.length > 5) {
                let count = Number.parseInt(itemToSell[1].innerText);
                let yenForEach = Number.parseInt(itemToSell[2].innerText);
                let zasForEach = Number.parseInt(itemToSell[3].innerText);
                if (isNaN(count))
                    count = 0;
                if (isNaN(yenForEach))
                    yenForEach = 0;
                if (isNaN(zasForEach))
                    zasForEach = 0;

                summaryCount = summaryCount + count;
                summarYen = summarYen + (count * yenForEach);
                summaryZas = summaryZas + (count * zasForEach);
            }

        });
        $($(DATA).find(".panel .panel-primary")[0]).after(`<div class="panel panel-primary">
        <div class="panel-heading">Podsumowanie</div>
        <table class="table table-strippedd">
            <tbody>
                <tr>
                    <th>&nbsp;</th>
                    <th>Ilość</th>
                    <th>Cena ¥</th>
                    <th>Cena §</th>
                    <th></th>
                    <th>&nbsp;</th>
                </tr>
                <tr>
                    <td>
                        <img src="images/yen.png" class="visible-lg-inline" style="width: 26px; margin: -6px 0px -6px 10px;">
                    </td>
                    <td id="summaryCount">` + new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(summaryCount) + `</td>
                    <td id="summarYen">` + new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(summarYen) + `</td>
                    <td id="summaryZas">` + new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(summaryZas) + `</td>
    
                    <td></td>
                </tr>
            </tbody>
        </table>
    </div>`)
    }
    // **********************
    //
    // initWystawView()
    // Funkcja pokazuje ceny dla danego przedmiotu
    //
    // **********************
    function initWystawView() {
        onReloadMain(function() {
            var DATA = this;
            if (this.find('.panel-heading').html() === "Targ - Wystaw Przedmioty") {
                $(DATA).find("#targ_wysprz-zwykle input[value='Wystaw']").after('<input type="button" style="width: 25%;margin-left: 3%;" class="check-price form-control btn btn-primary" value="?">');
                $(DATA).find("#targ_wysprz-zwykle input[value='Wystaw']").css("width", "70%");
                if (this.find('.panel-heading').html() === "Targ - Wystaw Przedmioty") {
                    if ($(DATA).find(".panel-primary").length > 0) {
                        initSummary(DATA);
                    }
                }
            }
        })


        $(document).off("click", "#targ_wysprz-zwykle .check-price");
        $(document).on("click", "#targ_wysprz-zwykle .check-price", function() {
            $('#marketTable').remove();
            $('body').append("<div id='marketTable' style='z-index: 999; width: 260px; height: 400px; position: fixed; right: 0; background: white; bottom: 60px;border: 2px dashed; overflow: scroll; overflow-x:hidden'></div>")

            var przedmiot = $(this).parent().parent().find("input[name='nazwa']").val();
            var THAT = $(this).parent().parent();
            THAT.find('input[name="ilosc"]').val(THAT.parent().find("div").html().split('</b> - ')[1].split(' sztuk')[0]);

            $.ajax({
                type: 'POST',
                url: "gra/targ_prz.php"
            }).done(function(response) {
                window.setTimeout(function() {
                    $.ajax({
                        type: 'POST',
                        url: "gra/targ_prz.php?szukaj&przedmiot=" + przedmiot + "&zakladka=0&value587",
                    }).done(function(response) {
                        $.ajax({
                            type: 'POST',
                            url: "gra/targ_prz.php?oferty_strona&&przedmiot=" + przedmiot + "&value587&strona=1",
                        }).done(function(response) {
                            if (response.indexOf("Brak ofert.") < 0) {
                                var max = 1;
                                if ($($(response).find("form span")[2]).html() != "-----") {
                                    var price = Number($($(response).find("form span")[2]).html().split("&nbsp;")[0].replace(/\./g, '')) * max;
                                    THAT.find('input[name="cena_yeny"]').val(price - 1);
                                } else {
                                    THAT.find('input[name="cena_yeny"]').val("brak");
                                }
                            } else {
                                THAT.find('input[name="cena_yeny"]').val("brak");
                            }

                            $(response).find("form[action='targ_prz.php?szukaj&przedmiot=" + przedmiot + "']").each(function(index, val) {
                                var img = $($(this).find("span")[0]);
                                var quantity = $($(this).find("span")[1]);
                                var price = $($(this).find("span")[2]);
                                var pricePZ = $($(this).find("span")[3]);
                                if (price.html() !== "-----") {
                                    var html = '<div style="display: table;width: 100%;height: 30px;padding: 5px;"><div style="display: table-cell;width: 70px;">' + img.html() + '</div><div style="display: table-cell;text-align: left;width: 100px;">' + quantity.html() + '</div><div style="display: table-cell;text-align: left;width: 100px;">' + price.html() + '</div><div style="display: table-cell;text-align: left;width: 70px;">' + pricePZ.html() + '</div></div>';
                                    $('#marketTable').append(html);
                                }
                            });
                        })
                    })
                }, 500);
            })
        });

        $('body').off('click', ':not(#marketTable, #marketTable *)');
        $('body').on('click', ':not(#marketTable, #marketTable *)', function() {
            $('#marketTable').empty().remove()
        });

    }
    initWystawView();

}



$.getJSON("https://raw.githubusercontent.com/krozum/pokelife/master/pokemon.json", {
    format: "json"
}).done(function(data) {
    pokemonData = data;
    if ($('#pasek_skrotow a[href="gra/dzicz.php?poluj&miejsce=las"]').length > 0) {
        region = 'kanto';
    } else if ($('#pasek_skrotow a[href="gra/dzicz.php?poluj&miejsce=puszcza"]').length > 0) {
        region = 'johto';
    } else if ($('#pasek_skrotow a[href="gra/dzicz.php?poluj&miejsce=opuszczona_elektrownia"]').length > 0) {
        region = 'hoenn';
    } else if ($('#pasek_skrotow a[href="gra/dzicz.php?poluj&miejsce=koronny_szczyt"]').length > 0) {
        region = 'sinnoh';
    } else if ($('#pasek_skrotow a[href="gra/dzicz.php?poluj&miejsce=ranczo"]').length > 0) {
        region = 'unova';
    } else if ($('#pasek_skrotow a[href="gra/dzicz.php?poluj&miejsce=francuski_labirynt"]').length > 0) {
        region = 'kalos';
    }
    console.log("Wykryty region: " + region);

    var blob = new Blob([
        'var timers={};function fireTimeout(e){this.postMessage({id:e}),delete timers[e]}this.addEventListener("message",function(e){var t=e.data;switch(t.command){case"setTimeout":var i=parseInt(t.timeout||0,10),s=setTimeout(fireTimeout.bind(null,t.id),i);timers[t.id]=s;break;case"clearTimeout":(s=timers[t.id])&&clearTimeout(s),delete timers[t.id]}});'
    ])

    var timeoutId = 0;
    var timeouts = {};

    var worker = new Worker(window.URL.createObjectURL(blob));

    worker.addEventListener("message", function(evt) {
        var data = evt.data,
            id = data.id,
            fn = timeouts[id].fn,
            args = timeouts[id].args;

        fn.apply(null, args);
        delete timeouts[id];
    });

    window.setTimeout = function(fn, delay) {
        var args = Array.prototype.slice.call(arguments, 2);
        timeoutId += 1;
        delay = delay || 0;
        var id = timeoutId;
        timeouts[id] = { fn: fn, args: args };
        worker.postMessage({ command: "setTimeout", id: id, timeout: delay });
        return id;
    };

    window.clearTimeout = function(id) {
        worker.postMessage({ command: "clearTimeout", id: id });
        delete timeouts[id];
    };

    initPokeLifeScript();
})
