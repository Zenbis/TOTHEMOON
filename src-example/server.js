'use strict'

const Hapi = require('hapi');
const Request = require('request');
const Vision = require('vision');
const Handlebars = require('handlebars');
const LodashFilter = require('lodash.filter');
const LodashTake = require('lodash.take');
const bittrex = require('node.bittrex.api');
const API_KEY = '201058416ba7442287413d19caf0de77';
const API_SECRET = '3622c90e7abb4f49a0f1048a656043f';

const server = new Hapi.Server();

bittrex.options({
  'apikey' : API_KEY,
  'apisecret' : API_SECRET,
  'stream' : true,
  'verbose' : true,
  'cleartext' : true,
  'baseUrl' : 'https://bittrex.com/api/v1.1'
});

bittrex.websockets.subscribe(['BTC-LTC'], function(data) {
  if (data.M === 'updateExchangeState') {
    data.A.forEach(function(data_for) {
      console.log('Market Update for '+ data_for.MarketName, data_for);
    });
  }
});
bittrex.websockets.listen( function( data ) {
  if (data.M === 'updateSummaryState') {
    data.A.forEach(function(data_for) {
      data_for.Deltas.forEach(function(marketsDelta) {
        console.log('Ticker Update for '+ marketsDelta.MarketName, marketsDelta);
      });
    });
  }
});

server.connection({
    host: '127.0.0.1',
    port: 3000
});

// Register vision for our views
server.register(Vision, (err) => {
    server.views({
        engines: {
            html: Handlebars
        },
        relativeTo: __dirname,
        path: './views',
    });
});

server.start((err) => {
    if (err) {
        throw err;
    }

    console.log(`Server running at: ${server.info.uri}`);
});

// Show teams standings
server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        Request.get('https://bittrex.com/api/v1.1/public/getmarkets', function (success, message, result) {
            if (error) {
                throw error;
            }

            const data = JSON.parse(result);
            reply.view('index', { result: data });
        });
    }
});

// A simple helper function that extracts team ID from team URL
Handlebars.registerHelper('teamID', function (teamUrl) {
    return teamUrl.slice(38);
});
