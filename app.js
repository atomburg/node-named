var DNSPORT=5003
var DNSADDR='0.0.0.0'
var CONTRACT_ADDRESS="0xf952432902d9ff4d7f365e597856e0e8ca845994";
var UPSTREAM_RESOLVER="1.1.1.1"

var abicode = require('./abicode.js');
var named = require('./lib');
var server = named.createServer();
var dnsclient = require('dns'); dnsclient.setServers(["1.1.1.1", "8.8.8.8:53"]);
var Web3 = require('web3');

var web3 = new Web3("https://ropsten-rpc.linkpool.io");
var contract = new web3.eth.Contract(abicode.ABI, CONTRACT_ADDRESS);

function is_onelettertld(domain){
    if (!domain) return false;
    if (domain.length == 0) return false;
    var fs = domain.split('.');
    if (fs.length > 1 && fs[fs.length-1].length == 1) return true;
    return false;
} 

server.on('clientError', function(error) {
        console.log("there was a clientError: %s", error);
});

server.on('uncaughtException', function(error) {
        console.log("there was an excepton: %s", error.message());
});

server.listen(DNSPORT, DNSADDR, function() {
        console.log('DNS server started on port ' + DNSPORT);
});

function do_blockchain_resolve(query, domain, type){
    var dom = domain.split('.').slice(-2).join('.');
    var host = domain.split('.').length == 2 ? "@" : domain.split('.').slice(0, -2).join('.');
    //console.log(dom); console.log(host);
    contract.methods.record_get(dom, type, host).call(function(error, r) {
        if (error || typeof(r) == 'undefined' || !r){
            server.send(query);
            return ;
        }

        //console.log(r);
        try{ r = JSON.parse(r); }catch(e){}

        switch (type) {
            case 'A':{
                for( i in r){
                    var record = new named.ARecord(r[i]['a']);
                    query.addAnswer(domain, record, r[i]['ttl']);
                }
            } break;
        /*    case 'AAAA':{
                for( i in r){
                    var record = new named.AAAARecord(r[i]);
                    query.addAnswer(domain, record, 300);
                }
            } break;
            case 'CNAME':{
                for( i in r){
                    var record = new named.CNAMERecord(r[i]);
                    query.addAnswer(domain, record, 300);
                }
            } break;
            case 'MX':{
                for( i in r){
                    var record = new named.MXRecord(r[i]["exchange"]);
                    query.addAnswer(domain, record, 300);
                }
            } break;
            case 'SOA':{
                    var record = new named.SOARecord(r["nsname"]);
                    query.addAnswer(domain, record, 300);
            } break;
            case 'SRV':{
                for( i in r){
                    var record = new named.SRVRecord(r[i]['name'], r[i]['port']);
                    query.addAnswer(domain, record, 300);
                }
            } break;
            case 'TXT': {
                for( i in r){
                    var record = new named.TXTRecord(r[i].join(""));
                    query.addAnswer(domain, record, 300);
                }
            } break;
         */
        }; // switch
        server.send(query);
    });
}

function do_upstream_resolve(query, domain, type){
    dnsclient.resolve(domain, type, function(error, r){
        if (error || typeof(r) == 'undefined' || !r){
            server.send(query);
            return ;
        }

        console.log(r);

        switch (type) {
            case 'A':{
                for( i in r){
                    var record = new named.ARecord(r[i]);
                    query.addAnswer(domain, record, 300);
                }
            } break;
            case 'AAAA':{
                for( i in r){
                    var record = new named.AAAARecord(r[i]);
                    query.addAnswer(domain, record, 300);
                }
            } break;
            case 'CNAME':{
                for( i in r){
                    var record = new named.CNAMERecord(r[i]);
                    query.addAnswer(domain, record, 300);
                }
            } break;
            case 'MX':{
                for( i in r){
                    var record = new named.MXRecord(r[i]["exchange"]);
                    query.addAnswer(domain, record, 300);
                }
            } break;
            case 'SOA':{
                    var record = new named.SOARecord(r["nsname"]);
                    query.addAnswer(domain, record, 300);
            } break;
            case 'SRV':{
                for( i in r){
                    var record = new named.SRVRecord(r[i]['name'], r[i]['port']);
                    query.addAnswer(domain, record, 300);
                }
            } break;
            case 'TXT': {
                for( i in r){
                    var record = new named.TXTRecord(r[i].join(""));
                    query.addAnswer(domain, record, 300);
                }
            } break;
        }; // switch
        server.send(query);
    });
}

server.on('query', function(query) {
        var domain = query.name()
        var type = query.type();
        console.log('DNS Query: (%s) %s', type, domain);
        if (is_onelettertld(domain)){
            return do_blockchain_resolve(query, domain, type);
        }else{
            return do_upstream_resolve(query, domain, type);
        }
});

