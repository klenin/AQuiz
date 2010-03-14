function SingleChoiceQuestion(src) {
    this.text = src.text;
    this.variants = new Array();
    if (src.variants)
        for (var i = 0; i < src.variants.length; ++i)
            this.variants.push(src.variants[i]);
    this.answer = null;
    
    this.ui = function () { return $('#singleChoice'); }

    this.show = function () {
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
    };

    this.rememberAnswer = function() {
        var that = this;
        $('#singleChoice input').each(function(i) {
            if (this.checked)
                that.answer = this.id;
        });
    };
}

function MultiChoiceQuestion(src) {
    this.text = src.text;
    this.variants = new Array();
    if (src.variants)
        for (var i = 0; i < src.variants.length; ++i)
            this.variants.push({ text: src.variants[i], checked: false });
    
    this.ui = function () { return $('#multiChoice'); }

    this.show = function () {
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
    };

    this.rememberAnswer = function() {
        var that = this;
        $('#multiChoice input').each(function(i) {
            if (this.id)
                that.variants[this.id - 1].checked = this.checked;
        });
    };

}

function Quiz(questions) {
    this.questions = questions;
    this.currentQuestion = 0;

    this.nextOk = function () {
        return this.currentQuestion < this.questions.length - 1;
    };

    this.prevOk = function () {
        return this.currentQuestion > 0;
    };

    this.nextQuestion = function () {
        if (!this.nextOk()) return;
        this.leaveQuestion();
        ++this.currentQuestion;
        this.showQuestion();
    };

    this.prevQuestion = function () {
        if (!this.prevOk()) return;
        this.leaveQuestion();
        --this.currentQuestion;
        this.showQuestion();
    };

    this.leaveQuestion = function() {
        var q = this.questions[this.currentQuestion];
        q.ui().hide();
        q.rememberAnswer();
    }

    this.showQuestion = function () {
        this.questions[this.currentQuestion].show();
        $('nextQuestion').disabled = !this.nextOk();
        $('prevQuestion').disabled = !this.prevOk();
    };
};
