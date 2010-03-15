
var ChoiceQuestion = $.inherit(
{
    __constructor: function(src) {
        this.text = src.text;
        this.variants = new Array();
    },
});

var SingleChoiceQuestion = $.inherit(ChoiceQuestion,
{
    __constructor: function(src) {
        this.__base(src);
        if (src.variants)
            for (var i = 0; i < src.variants.length; ++i)
                this.variants.push(src.variants[i]);
        this.answer = null;
    },
    
    ui: function() { return $('#singleChoice'); },

    show: function() {
        var ui = this.ui();
        ui.children('.questionText').text(this.text);
        var variants = ui.children('ul');
        var variantTemplate = variants.children('.variantTemplate');
        variants.children().not('.variantTemplate').remove();
        for (var i = 0; i < this.variants.length; ++i) {
            var v = variantTemplate.clone().removeClass('hidden variantTemplate');
            v.children('input').attr({ id: i + 1, checked: this.answer == i + 1 });
            v.children('label').text(this.variants[i]).attr('for', i + 1);
            variants.append(v);
        }
        ui.show();
    },

    rememberAnswer: function() {
        var that = this;
        $('#singleChoice input').each(function(i) {
            if (this.checked)
                that.answer = this.id;
        });
    },
});

var MultiChoiceQuestion = $.inherit(ChoiceQuestion,
{
    __constructor: function(src) {
        this.__base(src);
        if (src.variants)
            for (var i = 0; i < src.variants.length; ++i)
                this.variants.push({ text: src.variants[i], checked: false });
    },

    ui: function() { return $('#multiChoice'); },

    show: function() {
        var ui = this.ui();
        ui.children('.questionText').text(this.text);
        var variants = ui.children('ul');
        var variantTemplate = variants.children('.variantTemplate');
        variants.children().not('.variantTemplate').remove();
        for (var i = 0; i < this.variants.length; ++i) {
            var v = variantTemplate.clone().removeClass('hidden variantTemplate');
            v.children('input').attr({ id: i + 1, checked: this.variants[i].checked });
            v.children('label').text(this.variants[i].text).attr('for', i + 1);
            variants.append(v);
        }
        ui.show();
    },

    rememberAnswer: function() {
        var that = this;
        $('#multiChoice input').each(function(i) {
            if (this.id)
                that.variants[this.id - 1].checked = this.checked;
        });
    },
});

var Quiz = $.inherit(
{
    __constructor: function(questions) {
        this.questions = questions;
        this.currentQuestion = 0;
    },

    nextOk: function() {
        return this.currentQuestion < this.questions.length - 1;
    },

    prevOk: function() {
        return this.currentQuestion > 0;
    },

    nextQuestion: function() {
        if (!this.nextOk()) return;
        this.leaveQuestion();
        ++this.currentQuestion;
        this.showQuestion();
    },

    prevQuestion: function() {
        if (!this.prevOk()) return;
        this.leaveQuestion();
        --this.currentQuestion;
        this.showQuestion();
    },

    leaveQuestion: function() {
        var q = this.questions[this.currentQuestion];
        q.ui().hide();
        q.rememberAnswer();
    },

    showQuestion: function() {
        this.questions[this.currentQuestion].show();
        $('nextQuestion').disabled = !this.nextOk();
        $('prevQuestion').disabled = !this.prevOk();
    },
});
