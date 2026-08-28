const { MeiliSearch } = require('meilisearch');

const client = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
  apiKey: process.env.MEILISEARCH_API_KEY || 'masterKey',
});

const indexName = 'library_catalog';

async function initMeilisearch() {
  try {
    const index = client.index(indexName);
    
    // Setting up index settings for search
    await index.updateSettings({
      searchableAttributes: [
        'title',
        'authors',
        'isbn13',
        'isbn10',
        'keywords',
        'subjects',
        'category'
      ],
      filterableAttributes: [
        'format',
        'language',
        'available',
        'digitalAvailable'
      ],
      sortableAttributes: [
        'publicationYear',
        'title'
      ]
    });
    
    console.log('Meilisearch library catalog index configured.');
  } catch (error) {
    console.error('Meilisearch init error:', error);
  }
}

async function syncBookToSearch(bookData) {
  try {
    const index = client.index(indexName);
    // Add or update document
    await index.addDocuments([bookData]);
  } catch (error) {
    console.error('Meilisearch sync error:', error);
  }
}

async function searchCatalog(query, filters = {}) {
  try {
    const index = client.index(indexName);
    
    let filterString = [];
    if (filters.format) filterString.push(`format = '${filters.format}'`);
    if (filters.language) filterString.push(`language = '${filters.language}'`);
    if (filters.available !== undefined) filterString.push(`available = ${filters.available}`);
    if (filters.digitalAvailable !== undefined) filterString.push(`digitalAvailable = ${filters.digitalAvailable}`);

    const searchParams = {
      filter: filterString.length > 0 ? filterString.join(' AND ') : undefined,
      limit: filters.limit || 25,
      offset: filters.offset || 0,
    };

    return await index.search(query, searchParams);
  } catch (error) {
    console.error('Meilisearch search error:', error);
    // Fallback structure in case meili is down
    return { hits: [], estimatedTotalHits: 0 };
  }
}

module.exports = { client, initMeilisearch, syncBookToSearch, searchCatalog };
