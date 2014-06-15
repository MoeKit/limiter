var Events = require('eventor'),
    $ = require('jquery');

var defaults = {
    counterMode: 'default', // can be a function or existing mode string
    max: 50,
    isCut: false, // if cut text when overflow
    isIgnoreHTML: true,
    rsBox: null,
    rsNormalTpl: '{{remain}}',
    rsOverflowTpl: '-{{remain}}'
};

var triggerEvents = 'keyup.mk-limiter blur.mk-limiter';
var limiter = function (o) {
    var _this = this;
    this.init(o);
    this.on('change', function (length, remain, val) {
        _this.$rsBox.html(_this._compileTpl(length, remain, 'rsNormalTpl'));
    });
    this.on('overflow', function (length, remain, val) {
        _this.$rsBox.html(_this._compileTpl(length, remain, 'rsOverflowTpl'));
        // whether to cut text
        if (_this.o.isCut) {
            val = val.slice(o, _this.o.mode === 'en2half' ? _this.o.max * 2 : _this.o.max);
            _this.$target.val(val).trigger('keyup.mk-limiter');
        }
    });
    return this;
};

// mixin
Events.mixTo(limiter);

var counterMode = {
    'default': function (val) {
        return val.length;
    },
    'en2half': function (val) {
        val = val.replace(/[^\x00-\xff]/g, "**");
        return Math.ceil(val.length / 2);
    }
};

limiter.prototype._compileTpl = function (length, remain, tpl) {
    return this.o[tpl].replace(/{{length}}/g, length).replace(/{{remain}}/g, remain);
};

limiter.prototype.init = function (o) {
    this.o = $.extend(defaults, o);
    var _this = this;
    // get mode
    if (typeof o.mode === 'string') {
        if (counterMode[o.mode]) {
            this.counter = counterMode[o.mode];
        } else {
            this.counter = counterMode['default'];
        }
    } else if (typeof o.mode === 'function') {
        this.counter = o.mode;
    } else {
        this.counter = counterMode['default'];
    }

    this.$target = $(this.o.target);
    this.$rsBox = $(this.o.rsBox);

    this.$target.on(triggerEvents, function () {
        var val = $(this).val();
        var len = _this.getLength(val);

        if (len > _this.o.max) {
            _this.trigger('overflow', len, Math.abs(_this.o.max - len), val);
        } else {
            _this.trigger('change', len, Math.abs(_this.o.max - len), val);
        }
    });

    // has to use setTimeout
    setTimeout(function () {
        _this.$target.trigger('keyup.mk-limiter');
    }, 0);


};

limiter.prototype.getLength = function (val) {
    if (this.o.isIgnoreHTML) {
        val = val.replace(/<[^>]*>/g, "")
    }
    return this.counter(val);
};

limiter.prototype.destroy = function () {
    this.$target.off(triggerEvents);
    this.$rsBox.empty();
};

module.exports = limiter;