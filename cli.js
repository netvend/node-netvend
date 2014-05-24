#!/usr/bin/env node


function callback(data) {
    console.log(JSON.stringify(data, null, 4));
    process.exit();
}

var argv = require('minimist')(process.argv.slice(2), {
    "default": {
        'key': '5KJvsngHeMpm884wtkJNzQGaCErckhHJBGFsvd3VyK5qMZXj3hS'
    }
});

if (argv.h || argv.help) {
    console.log("Usage: netvend [-k private_key] [-u netvend_url] command arg1 arg2");
    process.exit();
}

if (!argv._.length) {
    console.log("No command detected. Type netvend --help for usage info.");
    process.exit();
}

var NetVend = require('./main');
var netvend = new NetVend();
netvend.set_key(argv.k || argv.key);
netvend.url = argv.u || argv.url || netvend.url;

if (argv._[0].toLowerCase() == 'post') {
    argv._.splice(0, 1);
    netvend.post(argv._.join(' '), callback);
} else {
    if (argv._[0].toLowerCase() == 'tip') {
        if (argv._.length < 3) {
            console.log("Usage: netvend [-k private_key] [-u netvend_url] tip address amount [optional_data_ids]");
            process.exit();
        }
        if (argv._[3]) {
            netvend.tip(argv._[1], JSON.parse(argv._[2]), JSON.parse(argv._[3]), callback);
        } else {
            netvend.tip(argv._[1], JSON.parse(argv._[2]), null, callback);
        }
    } else {
        if (argv._[0].toLowerCase() == 'query') {
            if (argv._.length < 3) {
                console.log("Usage: netvend [-k private_key] [-u netvend_url] query max_fee sql");
                process.exit();
            }
           var max_fee = JSON.parse(argv._[1]);
           argv._.splice(0, 2);
            netvend.query(argv._.join(' '), max_fee, callback);
        } else {
            if (argv._[0].toLowerCase() == 'withdraw') {
                netvend.withdraw(argv._[1], callback);
            }
        }
    }
}