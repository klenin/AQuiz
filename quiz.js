/*
    Copyright © 2010-2013 Alexander S. Klenin
    Copyright © 2013 Natalia D. Zemlyannikova
    Licensed under GPL version 2 or later.
    http://github.com/klenin/AQuiz
*/

"use strict";

function parseArgs() {
    var args = {};
    $.each(document.location.search.substring(1).split(/[&;]/), function (i, s) {
        if (s === '') return;
        s = decodeURIComponent(s);
        var np = s.indexOf('=', s);
        if (np < 0)
            args[s] = null;
        else
            args[s.substring(0, np)] = s.substring(np + 1);
    });
    return args;
}

var Question = $.inherit(
{
    __constructor: function (src) {
        this.text = src.text;
        this.answer = src.answer === undefined ? null : src.answer;
        this.correct = src.correct;
    },

    ui: function () {},

    makeVariants: function (variantUI, variants, makeVariant) {
        var variantTemplate = variantUI.children('.variantTemplate');
        variantUI.children().not('.variantTemplate').remove();
        $.each(variants, function (i, text) {
            var elem = variantTemplate.clone().removeClass('hidden variantTemplate');
            makeVariant(elem, i, text);
            variantUI.append(elem);
        });
        return variantUI;
    },

    show: function () {
        var ui = this.ui();
        ui.children('.questionText').html(this.text);
        ui.show();
    },

    isCorrect: function () { return this.answer == this.correct; },
});


var ChoiceQuestion = $.inherit(Question,
{
    __constructor: function (src) {
        this.__base(src);
        this.variants = [];
    },

    prepareVariant: function (index, elem) {},

    show: function () {
        this.__base();
        var that = this;
        this.makeVariants(this.ui().children('ul'), this.variants,
            function (elem, i, text) {
                elem.children('input').attr('id', i + 1);
                elem.children('label').html(text).attr('for', i + 1);
                that.prepareVariant(i, elem);
            });
    },
});

var SingleChoiceQuestion = $.inherit(ChoiceQuestion,
{
    __constructor: function (src) {
        this.__base(src);
        if (src.variants)
            for (var i = 0; i < src.variants.length; ++i)
                this.variants.push(src.variants[i]);
    },
    
    ui: function () { return $('#singleChoice'); },

    prepareVariant: function (index, elem) {
        elem.children('input')[0].checked = this.answer == index;
    },

    rememberAnswer: function () {
        var that = this;
        this.answer = null;
        $('#singleChoice input').each(function (i) {
            if (this.checked)
                that.answer = this.id - 1;
        });
    },

    answerToText: function (answer) { return answer == undefined ? undefined : answer + 1; },
});

var MultiChoiceQuestion = $.inherit(ChoiceQuestion,
{
    __constructor: function (src) {
        this.__base(src);
        if (src.variants)
            for (var i = 0; i < src.variants.length; ++i)
                this.variants.push(src.variants[i]);
    },

    ui: function () { return $('#multiChoice'); },

    prepareVariant: function (index, elem) {
        if (this.answer !== null)
            elem.children('input')[0].checked = this.answer[index];
    },

    rememberAnswer: function () {
        var answer = [];
        var hasAnswer = false;
        $('#multiChoice input').each(function (i) {
            if (this.id) {
                answer[this.id - 1] = this.checked ? 1 : 0;
                if (this.checked) hasAnswer = true;
            }
        });
        this.answer = hasAnswer ? answer : null;
    },

    answerToText: function (answer) { return answer.join(','); },

    isCorrect: function () {
        for (var i = 0; i < this.answer.length; ++i)
            if (this.answer[i] != this.correct[i])
                return false;
        return true;
    },
});

var DirectInputQuestion = $.inherit(Question,
{
    __constructor: function (src) {
        this.__base(src);
    },
    
    ui: function () { return $('#directInput'); },

    input: function () { return this.ui().children('input')[0]; },

    show: function () {
        this.__base();
        this.input().value = this.answer;
    },

    rememberAnswer: function () {
        this.answer = this.input().value;
        if (!this.answer)   
            this.answer = null;
    },

    answerToText: function (answer) { return answer; },
});

var SortableQuestion = $.inherit(Question,
{
    __constructor: function (src) {
        this.__base(src);
        this.variants = [];
        if (src.variants)
            for (var i = 0; i < src.variants.length; ++i)
                this.variants.push(src.variants[i]);
    },

    ui: function () { return $('#sortable'); },

    show: function () {
        this.__base();
        var answer = this.answer;
        if (answer === null) {
            answer = [];
            for (var i = 0; i < this.variants.length; ++i)
                answer.push(i);
        }
        var that = this;
        this.makeVariants(this.ui().children('ul'), answer, function (elem, i, text) {
            elem.attr('id', text).html(that.variants[text]);
        }).sortable();
    },

    rememberAnswer: function () {
        this.answer = $.map(this.ui().children('ul').children('li'), function (elem) {
            return elem.id ? elem.id : null;
        });
    },

    answerToText: function (answer) {
        var that = this;
        return $.map(answer, function (elem) { return that.variants[elem]}).join(',');
    },

    isCorrect: function () {
        for (var i = 0; i < this.answer.length; ++i)
            if (this.answer[i] != this.correct[i])
                return false;
        return true;
    },
});

var MatchQuestion = $.inherit(Question,
{
    __constructor: function (src) {
        this.__base(src);
        this.lvariants = [];
        this.rvariants = [];
        if (src.variants)
            for (var i = 0; i < src.variants[0].length; ++i) {
                this.lvariants.push(src.variants[0][i]);
                this.rvariants.push(src.variants[1][i]);
            }
    },

    ui: function () { return $('#match'); },

    st: function () { return $('#match #static'); },

    so: function () { return $('#match #sortable'); },

    show: function () {
        this.__base();
        var answer = this.answer;
        if (answer === null) {
            answer = [];
            for (var i = 0; i < this.lvariants.length; ++i)
                answer.push(i);
        }
        this.makeVariants(this.st().children('ul'), this.lvariants, function (elem, i, text) {
            elem.html(text);
        });

        var that = this;
        this.makeVariants(this.so().children('ul'), answer, function (elem, i, text) {
            elem.attr('id', text).html(that.rvariants[text]);
        }).sortable();
    },

    rememberAnswer: function () {
        this.answer = $.map(this.so().children('ul').children('li'), function (elem) {
            return elem.id ? elem.id : null;
        });
    },

    answerToText: function (answer) {
        var that = this;
        return $.map(answer, function (elem) { return that.rvariants[elem]}).join(',');
    },

    isCorrect: function () {
        for (var i = 0; i < this.answer.length; ++i)
            if (this.answer[i] != this.correct[i])
                return false;
        return true;
    },
});

var Quiz = $.inherit(
{
    __constructor: function (quizUrl) {
        this.currentQuestion = 0;
        this.questions = [];
    },

    setQuestionsJSON: function (quizJSON) {
        var questionTypes = {
            sc: SingleChoiceQuestion,
            mc: MultiChoiceQuestion,
            di: DirectInputQuestion,
            sr: SortableQuestion,
            mt: MatchQuestion,
        };
        $('#waiting').hide();
        this.currentQuestion = 0;
        this.questions = $.map(quizJSON, function (v, i) {
            return new questionTypes[v.type](v);
        });
        this.updateGotoButtons();
        this.showCheckSumbitAnswers();
        var that = this;
        $(['prevQuestion', 'nextQuestion', 'checkAnswers', 'submitAnswers']).each(
            function(i, name) { $('#' + name + 'Button').click(function() { that[name]() }); }
        );
        $('#controlButtons').show();
        this.showQuestion();
    },

    load: function (quizUrl) {
        var that = this;
        $.ajax({
            url: quizUrl,
            dataType: 'json',
            timeout: 10000,
            success: function (quizJSON) { that.setQuestionsJSON(quizJSON); },
            error: function (req, textStatus, err) {
                req.abort();
                setTimeout(function (q, url) { q.load(url); }, 4000, that, quizUrl);
            },
        });
    },

    updateAnswered: function (button, question) {
        if (question.answer !== null)
            button.addClass('answered');
        else
            button.removeClass('answered');
    },

    updateGotoButtons: function () {
        var that = this;
        var s = $('#questionNumbers');
        var btnTemplate = s.children('input');
        $.each(this.questions, function (i, q) {
            var b = btnTemplate.clone().val(i + 1);
            b.click(function () { that.gotoButton(this); });
            that.updateAnswered(b, q);
            b.show().appendTo(s);
        });
    },

    showCheckSumbitAnswers: function () {
        if (typeof(quiz_submit_url) == 'function')
            $('#submitAnswersButton').show()[0].disabled = false;
        var show = false;
        for (var i = 0; i < this.questions.length && !show; ++i)
            show = this.questions[i].correct !== undefined;
        if (!show) return;
        $('#checkAnswersButton').show()[0].disabled = false;
        var t = $('#checkAnswers table');
        var rowTemplate = t.children('tr.hidden');
        for (var i = 0; i < this.questions.length; ++i)
            t.append(rowTemplate.clone().show());
    },

    checkAnswers: function () {
        this.leaveQuestion();
        var rows = $('#checkAnswers table tr');
        for (var i = 0; i < this.questions.length; ++i) {
            var r = $(rows[i + 2]);
            var td = r.children('td');
            $(td[0]).text(i + 1);
            var q = this.questions[i];
            $(td[1]).text(q.answer === null ? '?' : q.answerToText(q.answer));
            $(td[2]).text(q.correct === null ? '?' : q.answerToText(q.correct));
            r.removeClass('correct wrong');
            if (q.answer !== null && q.correct !== null) {
                r.addClass(q.isCorrect() ? 'correct' : 'wrong');
            }
        }
        $('#checkAnswers').show();
    },

    submitAnswers: function () {
        this.leaveQuestion();
        if (confirm($('#confirmSubmit').text())) {
            var answers = [];
            $.each(this.questions, function (i, q) {
                answers[i] = q.answer;
            });
            $.post(
                quiz_submit_url(), { answers: JSON.stringify(answers) },
                function () { alert($('#submitSuccess').text()); }
            );
        }
        this.showQuestion();
    },

    gotoButton: function (btn) {
        this.leaveQuestion();
        this.currentQuestion = $(btn).val() - 1;
        this.showQuestion();
    },

    nextOk: function () {
        return this.currentQuestion < this.questions.length - 1;
    },

    prevOk: function () {
        return this.currentQuestion > 0;
    },

    nextQuestion: function () {
        if (!this.nextOk()) return;
        this.leaveQuestion();
        ++this.currentQuestion;
        this.showQuestion();
    },

    prevQuestion: function () {
        if (!this.prevOk()) return;
        this.leaveQuestion();
        --this.currentQuestion;
        this.showQuestion();
    },

    currentGotoButton: function () {
        var v = (this.currentQuestion + 1);
        return $('#questionNumbers input[value=' + v + ']');
    },

    leaveQuestion: function () {
        var q = this.questions[this.currentQuestion];
        q.ui().hide();
        q.rememberAnswer();
        $('#nextQuestionButton')[0].disabled = true;
        $('#prevQuestionButton')[0].disabled = true;
        var b = this.currentGotoButton();
        this.updateAnswered(b, q);
        b[0].disabled = false;
    },

    showQuestion: function () {
        $('#checkAnswers').hide();
        this.questions[this.currentQuestion].show();
        $('#nextQuestionButton')[0].disabled = !this.nextOk();
        $('#prevQuestionButton')[0].disabled = !this.prevOk();
        this.currentGotoButton()[0].disabled = true;
    },
});
