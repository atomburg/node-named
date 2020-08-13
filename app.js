var DNSPORT=53
var DNSADDR='0.0.0.0'
var CONTRACT_ADDRESS="0xf952432902d9ff4d7f365e597856e0e8ca845994";
var UPSTREAM_RESOLVER="1.1.1.1"

var abicode = require('./abicode.js');
var named = require('./lib');
var server = named.createServer();
var dnsclient = require('dns');
var Web3 = require('web3');

var web3 = new Web3("https://ropsten-rpc.linkpool.io");
var contract = new web3.eth.Contract(abicode.ABI, CONTRACT_ADDRESS);

if (false){
    contract.methods.domain_owner('a.i').call(function(error, addr) {
        if (!error){ console.log("Owner: <a href='https://ropsten.etherscan.io/address/" + addr + "' target='view_window'>"+addr+"</a>"); }
    });
}

if (false){
    dnsclient.lookup("www.amazon.com", function(err, addr, family){
        console.log('address: ' + addr);
    });
}

function is_onelettertld(domain){
    if (!domain) return false;
    if (domain.length == 0) return false;
    var fs = domain.split('.');
    //console.log(fs);
    if (fs.length > 1 && fs[fs.length-1].length == 1) return true;
    return false;
} 

if (false){
    console.log(is_onelettertld("a.i"));
    console.log(is_onelettertld("www.a.i"));
    console.log(is_onelettertld("www"));
    console.log(is_onelettertld("w"));
    console.log(is_onelettertld("w.com"));
}

server.listen(DNSPORT, DNSADDR, function() {
        console.log('DNS server started on port ' + DNSPORT);
});

server.on('query', function(query) {
        var domain = query.name()
        var type = query.type();
        console.log('DNS Query: (%s) %s', type, domain);
        switch (type) {
        case 'A':
                var record = new named.ARecord('127.0.0.1');
                query.addAnswer(domain, record, 300);
                break;
        case 'AAAA':
                var record = new named.AAAARecord('::1');
                query.addAnswer(domain, record, 300);
                break;
        case 'CNAME':
                var record = new named.CNAMERecord('cname.example.com');
                query.addAnswer(domain, record, 300);
                break;
        case 'MX':
                var record = new named.MXRecord('smtp.example.com');
                query.addAnswer(domain, record, 300);
                break;
        case 'SOA':
                var record = new named.SOARecord('example.com');
                query.addAnswer(domain, record, 300);
                break;
        case 'SRV':
                var record = new named.SRVRecord('sip.example.com', 5060);
                query.addAnswer(domain, record, 300);
                break;
        case 'TXT':
                var record = new named.TXTRecord('hello world');
                query.addAnswer(domain, record, 300);
                break;
        }
        server.send(query);
});

server.on('clientError', function(error) {
        console.log("there was a clientError: %s", error);
});

server.on('uncaughtException', function(error) {
        console.log("there was an excepton: %s", error.message());
});
