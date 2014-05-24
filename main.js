var request = require('request'),
    bitcoin = require('bitcoinjs-lib');

var NETVEND_SERVER = 'http://api.netvend.tk/';

function NetVend() {
    this.url = NETVEND_SERVER;
    this._private = null;
    this.compressed_key = false;
}

NetVend.prototype.set_key = function (private_key) {
    this._private = new bitcoin.ECKey(private_key);
};

NetVend.prototype.get_address = function () {
    return this._private.getBitcoinAddress().toString();
};

NetVend.prototype.sign = function (command) {
    return new Buffer(bitcoin.Message.sign(this._private, command)).toString('base64');
};

NetVend.prototype.send = function (commands, callback) {
    request.post(
        this.url, {
            form: {
                'cmds': JSON.stringify(commands)
            }
        },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                callback(body);
            }
        }
    );
};

NetVend.prototype._sign_and_send_single = function (unsigned_command, callback, sql) {
    var command = JSON.stringify(unsigned_command);
    var signature = this.sign(command);
    if (sql) {
        this.send([
            [command, signature, sql]
        ], callback);
    } else {
        this.send([
            [command, signature]
        ], callback);
    }
};

NetVend.prototype.post = function (message, callback) {
    this._sign_and_send_single([0, message], callback);
};

NetVend.prototype.tip = function (address, amount, data_ids, callback) {
    if (data_ids) {
        this._sign_and_send_single([1, address, amount, data_ids], callback);
    } else {
        this._sign_and_send_single([1, address, amount], callback);
    }
};

NetVend.prototype.query = function (sql, max_fee, callback) {
    this._sign_and_send_single([2, max_fee], callback, sql);
};

NetVend.prototype.withdraw = function (amount, callback) {
    if (!amount || amount == 'all') {
        this._sign_and_send_single([3], callback);
    } else {
        this._sign_and_send_single([3, amount], callback);
    }
};

/* Export NetVend API */
module.exports = NetVend;