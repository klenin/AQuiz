function quiz_init() {
    var args = parseArgs();
    q.load(unescape(args['url']));
}

/*
function quiz_submit_url() {
    return 'ok.html';
}
*/
