// Imprime apenas o novo token (para o workflow guardá-lo como segredo).
import { renovarToken } from '../instagram.js';

if (!process.env.IG_ACCESS_TOKEN) throw new Error('Falta o segredo IG_ACCESS_TOKEN.');
process.stdout.write(await renovarToken({ token: process.env.IG_ACCESS_TOKEN }));
