'use strict'

const Hapi = require('hapi');
const Request = require('request');
const Vision = require('vision');
const Handlebars = require('handlebars');
const LodashFilter = require('lodash.filter');
const LodashTake = require('lodash.take');
const bittrex = require('node.bittrex.api');
const APIKEY = 'KEY';
const APISECRET = 'SECRET';

const server = new Hapi.Server();

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
        Request.get('http://api.football-data.org/v1/competitions/438/leagueTable', function (error, response, body) {
            if (error) {
                throw error;
            }

            const data = JSON.parse(body);
            reply.view('index', { result: data });
        });
    }
});

// A simple helper function that extracts team ID from team URL
Handlebars.registerHelper('teamID', function (teamUrl) {
    return teamUrl.slice(38);
});
