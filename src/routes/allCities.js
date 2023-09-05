import { Router } from 'express';
import fs from 'fs-extra';

const route = Router();

export default (app) => {
  app.use('/', route);

  route.get('/all-cities', async (req, res, next) => {
    console.log('ALL CITIES');
    let readerStream = fs.createReadStream('../../addresses.json');
    readerStream.setEncoding('UTF8');

    readerStream.on('data', (chunk) => {
      res.write(chunk);
    });

    readerStream.on('end', () => {
      res.status(200).send();
    });

    readerStream.on('error', (err) => {
      res.status(err.code).send(err);
    });
  });
};
