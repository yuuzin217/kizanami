import rawNews from './articles.json';
import { validateNewsItems } from './newsModel';

// Validate on import during static generation; a bad article fails the build.
export const newsArticles = validateNewsItems(rawNews);
