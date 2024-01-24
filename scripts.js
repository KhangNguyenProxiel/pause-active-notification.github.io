$(document).ready(function (e) {
    if (Notification.permission !== "denied") {
        // We need to ask the user for permission
        Notification.requestPermission();
    }

    if ("serviceWorker" in navigator) {
        // register service worker
        navigator.serviceWorker.register("./sw.js");
    }
});

function notifyMe() {
    // if (!("Notification" in window)) {
    //     // Check if the browser supports notifications
    //     alert("This browser does not support desktop notification");
    // } else if (Notification.permission === "granted") {
    //     // Check whether notification permissions have already been granted;
    //     // if so, create a notification
    //     const notification = new Notification("C'est la pause !", {
    //         badge: "/image.png",
    //         icon: "/image.png",
    //         image: "/image.png",
    //     });
    //     // …
    // }

    navigator.serviceWorker &&
        navigator.serviceWorker
            .register("./sw.js")
            .then(function (registration) {
                console.log(
                    "Excellent, registered with scope: ",
                    registration.scope
                );

                Notification.requestPermission().then((permissionResult) => {
                    if (permissionResult === "granted") {
                        registration.showNotification("La Pause Active", {
                            badge: "/muc-logo128x128.png",
                            actions: [
                                {
                                    action: "view-exercice",
                                    type: "button",
                                    title: "Voir exercice"
                                },
                            ],
                        });
                    }
                });
            });
}

// Create Countdown
let Countdown = {
    // Backbone-like structure
    $el: $(".countdown"),

    // Params
    countdown_interval: null,
    total_seconds: 0,

    // Initialize the countdown
    init: function () {
        let now = new Date();
        let hour = now.getHours();
        hour = 9;
        let minutes = now.getMinutes();
        minutes = 59;
        let seconds = now.getSeconds();
        seconds = 50;
        // DOM
        this.$el
            .find(".bloc-time.hours .figure.hours-1")
            .find("span.bottom, span.bottom-back, span.top, span.top-back")
            .html(hour[0]);
        this.$el
            .find(".bloc-time.hours .figure.hours-2")
            .find("span.bottom, span.bottom-back, span.top, span.top-back")
            .html(hour[1]);

        // this.$el.find(".bloc-time.min .figure.min-1").find('span.bottom, span.bottom-back, span.top, span.top-back').html(minutes[0]);
        // this.$el.find(".bloc-time.min .figure.min-2").find('span.bottom, span.bottom-back, span.top, span.top-back').html(minutes[1]);

        // this.$el.find(".bloc-time.sec .figure.sec-1").find('span.bottom, span.bottom-back, span.top, span.top-back').html(seconds[0]);
        // this.$el.find(".bloc-time.sec .figure.sec-2").find('span.bottom, span.bottom-back, span.top, span.top-back').html(seconds[1]);
        // console.log(this.$el.find(".bloc-time.sec .figure.sec-2").find('span.bottom, span.bottom-back, span.top, span.top-back'))

        this.$ = {
            hours: this.$el.find(".bloc-time.hours .figure"),
            minutes: this.$el.find(".bloc-time.min .figure"),
            seconds: this.$el.find(".bloc-time.sec .figure"),
        };

        this.$.hours.parent().attr("data-init-value", hour);
        this.$.minutes.parent().attr("data-init-value", minutes);
        this.$.seconds.parent().attr("data-init-value", seconds);

        // Init countdown values
        this.values = {
            hours: this.$.hours.parent().attr("data-init-value"),
            minutes: this.$.minutes.parent().attr("data-init-value"),
            seconds: this.$.seconds.parent().attr("data-init-value"),
        };

        // Initialize total seconds
        this.total_seconds =
            this.values.hours * 60 * 60 +
            this.values.minutes * 60 +
            this.values.seconds;

        // Animate countdown to the end
        this.count();
    },

    count: function () {
        let that = this,
            $hour_1 = this.$.hours.eq(0),
            $hour_2 = this.$.hours.eq(1),
            $min_1 = this.$.minutes.eq(0),
            $min_2 = this.$.minutes.eq(1),
            $sec_1 = this.$.seconds.eq(0),
            $sec_2 = this.$.seconds.eq(1);

        this.countdown_interval = setInterval(function () {
            if (
                (that.values.hours == 10 || that.values.hours == 15) &&
                that.values.minutes == 0 &&
                that.values.seconds == 0
            ) {
                notifyMe();
            }

            if (that.total_seconds > 0) {
                ++that.values.seconds;

                if (that.values.minutes >= 0 && that.values.seconds > 59) {
                    that.values.seconds = "00";
                    ++that.values.minutes;
                }

                if (that.values.hours >= 0 && that.values.minutes > 59) {
                    that.values.minutes = "00";
                    ++that.values.hours;
                }

                // Update DOM values
                // Hours
                that.checkHour(that.values.hours, $hour_1, $hour_2);

                // Minutes
                that.checkHour(that.values.minutes, $min_1, $min_2);

                // Seconds
                that.checkHour(that.values.seconds, $sec_1, $sec_2);

                ++that.total_seconds;
            } else {
                clearInterval(that.countdown_interval);
            }
        }, 1000);
    },

    animateFigure: function ($el, value) {
        let that = this,
            $top = $el.find(".top"),
            $bottom = $el.find(".bottom"),
            $back_top = $el.find(".top-back"),
            $back_bottom = $el.find(".bottom-back");

        // Before we begin, change the back value
        $back_top.find("span").html(value);

        // Also change the back bottom value
        $back_bottom.find("span").html(value);

        // Then animate
        TweenMax.to($top, 0.8, {
            rotationX: "-180deg",
            transformPerspective: 300,
            ease: Quart.easeOut,
            onComplete: function () {
                $top.html(value);

                $bottom.html(value);

                TweenMax.set($top, { rotationX: 0 });
            },
        });

        TweenMax.to($back_top, 0.8, {
            rotationX: 0,
            transformPerspective: 300,
            ease: Quart.easeOut,
            clearProps: "all",
        });
    },

    checkHour: function (value, $el_1, $el_2) {
        let val_1 = value.toString().charAt(0),
            val_2 = value.toString().charAt(1),
            fig_1_value = $el_1.find(".top").html(),
            fig_2_value = $el_2.find(".top").html();

        if (value >= 10) {
            // Animate only if the figure has changed
            if (fig_1_value !== val_1) this.animateFigure($el_1, val_1);
            if (fig_2_value !== val_2) this.animateFigure($el_2, val_2);
        } else {
            // If we are under 10, replace first figure with 0
            if (fig_1_value !== "0") this.animateFigure($el_1, 0);
            if (fig_2_value !== val_1) this.animateFigure($el_2, val_1);
        }
    },
};

// Let's go !
Countdown.init();
