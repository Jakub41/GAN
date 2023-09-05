import logger from '../loaders/logger.js';
const log = logger();

export default function authorization(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    log.info('⛔️⛔️⛔️ Access denied ⛔️⛔️⛔️');
    return res.status(401).send({ message: 'Forbidden' });
  }

  // Bearer <token> split
  const token = authHeader.split(' ')[1];

  // Should be not exposed and keep it in an env
  // but for the purposes of the challenge it is hardcoded here
  const validToken = 'dGhlc2VjcmV0dG9rZW4=';

  const isTokenValid = token === validToken;

  if (!isTokenValid) {
    res.status(401).send({ message: 'Unauthorized token.' });
    log.info('⛔️⛔️⛔️ Unauthorized ⛔️⛔️⛔️');
  }
  log.info('✅✅✅ Access granted ✅✅✅');
  next();
}
