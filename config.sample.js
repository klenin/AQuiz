function quiz_init() {
    var args = parseArgs();
    q.load(unescape(args['url']));
}
