function $(id) {
    if (document.getElementById) return document.getElementById(id);
    else if (document.all) return document.all[id];
    else if (document.layers) return document.layers[id];
}

function childByTag(element, tag) {
    return element.getElementsByTagName(tag)[0];
}

function SingleChoiceQuestion(src) {
    this.text = src.text;
    this.variants = new Array();
    if (src.variants)
        for (var i = 0; i < src.variants.length; ++i)
            this.variants.push(src.variants[i]);
    this.answer = null;
    
    this.variantId = function (index) {
        return 'singleChoice.variant.' + (index + 1);
    };

    this.ui = function () { return $('singleChoice'); }

    this.show = function () {
        this.ui().style.display = 'block';
        $('singleChoice.text').innerHTML = this.text;
        var variants = $('singleChoice.variants').getElementsByTagName('li');
        var variantTemplate = $('singleChoice.variant.template');
        for (var i = variants.length - 1; i >= 0; --i) {
            var v = variants[i];
            if (v != variantTemplate)
                v.parentNode.removeChild(v);
        }
        for (var i = 0; i < this.variants.length; ++i) {
            v = variantTemplate.cloneNode(true);
            v.id = this.variantId(i);
            v.style.display = 'block';
            childByTag(v, 'input').checked = this.answer == i + 1;
            childByTag(v, 'label').innerHTML = this.variants[i];
            variantTemplate.parentNode.appendChild(v);
        }
    };

    this.rememberAnswer = function() {
        for (var i = 0; i < this.variants.length; ++i)
            if (childByTag($(this.variantId(i)), 'input').checked)
                this.answer = i + 1;
    };
}

function MultiChoiceQuestion(src) {
    this.text = src.text;
    this.variants = new Array();
    if (src.variants)
        for (var i = 0; i < src.variants.length; ++i)
            this.variants.push({ text: src.variants[i], checked: false });
    
    this.variantId = function (index) {
        return 'multiChoice.variant.' + (index + 1);
    };

    this.ui = function () { return $('multiChoice'); }

    this.show = function () {
        this.ui().style.display = 'block';
        $('multiChoice.text').innerHTML = this.text;
        var variants = $('multiChoice.variants').getElementsByTagName('li');
        var variantTemplate = $('multiChoice.variant.template');
        for (var i = variants.length - 1; i >= 0; --i) {
            var v = variants[i];
            if (v != variantTemplate)
                v.parentNode.removeChild(v);
        }
        for (var i = 0; i < this.variants.length; ++i) {
            v = variantTemplate.cloneNode(true);
            v.id = this.variantId(i);
            v.style.display = 'block';
            childByTag(v, 'input').checked = this.variants[i].checked;
            childByTag(v, 'label').innerHTML = this.variants[i].text;
            variantTemplate.parentNode.appendChild(v);
        }
    };

    this.rememberAnswer = function() {
        for (var i = 0; i < this.variants.length; ++i)
            this.variants[i].checked =
                childByTag($(this.variantId(i)), 'input').checked;
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
        q.ui().style.display = 'none';
        q.rememberAnswer();
    }

    this.showQuestion = function () {
        this.questions[this.currentQuestion].show();
        $('nextQuestion').disabled = !this.nextOk();
        $('prevQuestion').disabled = !this.prevOk();
    };
};
