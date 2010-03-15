var Question = $.inherit(
{
    __constructor: function(src) {
        this.text = src.text;
    },

    ui: function() {},

    show: function() {
        var ui = this.ui();
        ui.children('.questionText').text(this.text);
        ui.show();
    }
});


var ChoiceQuestion = $.inherit(Question,
{
    __constructor: function(src) {
        this.__base(src);
        this.variants = [];
    },

    prepareVariant: function(index, elem) {},
    
    show: function() {
        this.__base();
        var variants = this.ui().children('ul');
        var variantTemplate = variants.children('.variantTemplate');
        variants.children().not('.variantTemplate').remove();
        var that = this;
        $.each(this.variants, function(i, text) {
            var elem = variantTemplate.clone().removeClass('hidden variantTemplate');
            elem.children('input').attr('id', i + 1);
            elem.children('label').text(text).attr('for', i + 1);
            that.prepareVariant(i, elem);
            variants.append(elem);
        });
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

    prepareVariant: function(index, elem) {
        elem.children('input')[0].checked = this.answer == index + 1;
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
        this.answer = [];
        if (src.variants)
            for (var i = 0; i < src.variants.length; ++i) {
                this.variants.push(src.variants[i]);
                this.answer.push(false);
            }
    },

    ui: function() { return $('#multiChoice'); },

    prepareVariant: function (index, elem) {
        elem.children('input')[0].checked = this.answer[index];
    },

    rememberAnswer: function() {
        var that = this;
        $('#multiChoice input').each(function(i) {
            if (this.id)
                that.answer[this.id - 1] = this.checked;
        });
    },
});

var DirectInputQuestion = $.inherit(Question,
{
    __constructor: function(src) {
        this.__base(src);
        this.answer = null;
    },
    
    ui: function() { return $('#directInput'); },

    input: function() { return this.ui().children('input')[0]; },

    show: function() {
        this.__base();
        this.input().value = this.answer;
    },

    rememberAnswer: function() {
        this.answer = this.input().value;
    },
});

var Quiz = $.inherit(
{
    __constructor: function(quizUrl) {
        this.currentQuestion = 0;
        var that = this;
        var questionTypes = {
            sc: SingleChoiceQuestion,
            mc: MultiChoiceQuestion,
            di: DirectInputQuestion,
        };
        $.getJSON(quizUrl, null, function(quizJSON) {
            that.questions = $.map(quizJSON, function(v, i) {
                return new questionTypes[v.type](v);
            });
        });
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
        $('#nextQuestion')[0].disabled = !this.nextOk();
        $('#prevQuestion')[0].disabled = !this.prevOk();
    },
});
