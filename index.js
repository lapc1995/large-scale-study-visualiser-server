import { join,dirname } from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import express from 'express';
import reload from 'reload';
import * as sheetController from './sheetController.js';
import * as cache from './cache.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log(__dirname)   

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.static(join(__dirname, 'public')));

app.get('/', (req, res, next) => {
    res.render('index', { pageTitle: 'Add User' });
});

app.get('/websitesFinished', async (req, res, next) => {
    const websitesFinished = await getWebsitesFinished();
    const finishedCounters = Math.floor((websitesFinished * process.env.TOTAL_NUMBER_OF_COUNTERS) / process.env.TOTAL_NUMBER_OF_WEBSITES);
    const unfinishedCounters = process.env.TOTAL_NUMBER_OF_COUNTERS - finishedCounters;
    return res.render('progressGrid', { finishedCounters, unfinishedCounters });
});

app.get('/crawlerData', async (req, res, next) => {
    const crawlerData = await getCrawlerData();
    console.log('crawlerData');
    return res.render('crawlerGrid', { crawlerData });
});

async function getWebsitesFinished() {
    if(!cache.data) {
        let data = await sheetController.getWebsitesFinished();
        cache.setData(data);
    }

    let websitesFinished = 0;
    for(let key in cache.data) {
        websitesFinished += parseInt(cache.data[key].websitesFinished);
    }
    return websitesFinished;
}

async function getCrawlerData() {
    if(!cache.data) {
        let data = await sheetController.getWebsitesFinished();
        cache.setData(data);
    }
    
    let data = [];
    for(let key in cache.data) {
        data.push({
            "key": key,
            "websitesFinished": cache.data[key].websitesFinished,
            "lastUpdated": cache.data[key].lastUpdated,
        });
    }

    let sortedData = data.sort((a, b) => {
        return a.key - b.key;
    });
    
    return data;
}

/*
app.use((req, res, next) => {
    res.status(404).render('404', { pageTitle: 'Page Not Found' });
});*/

// Reload code here
reload(app).then(function (reloadReturned) {
    // reloadReturned is documented in the returns API in the README
  
    // Reload started, start web server
    app.listen(3333, function () {
      console.log('Server started!')
    })
  }).catch(function (err) {
    console.error('Reload could not start, could not start server/sample app', err)
  })


  var requestLoop = setInterval(async () => {
    try {
        console.log("Requesting");
        let data = await sheetController.getWebsitesFinished();
        cache.setData(data);
    } catch(e) {    
        console.log("Error", e);
    }
  }, 60000);
  