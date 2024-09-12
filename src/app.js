const { algoliasearch, instantsearch } = window;

const searchClient = algoliasearch(
  '2281D49FQH',
  'c585b6abfc131b46f3475ae1ed346bee'
);

const search = instantsearch({
  indexName: 'tectonica_index_descr',
  searchClient,
  future: { preserveSharedStateOnUnmount: true },
  queryLanguages: ['es'],
  searchParameters: {
    removeStopWords: true,  // Activa la eliminación de stop words
  }
});

search.addWidgets([
  instantsearch.widgets.searchBox({
    container: '#searchbox',
    placeholder: 'Busca en Tectónica...',
    searchAsYouType: false, // Desactiva las búsquedas mientras escribes
    searchOnEnterKeyPressOnly: true
  }),
  // Widget para mostrar los filtros seleccionados
  instantsearch.widgets.currentRefinements({
    container: '#current-refinements',
    transformItems(items) {
      return items.map(item => {
        if (item.attribute === 'categorias_unicas') {
          return {
            ...item,
            label: 'CATEGORIAS',
          };
        } else if (item.attribute === 'type') {
          return {
            ...item,
            label: 'TIPO DE CONTENIDO',
          };
        }
        return item;
      });
    },
    templates: {
      item: ({ label, refinements, createURL, refine }) =>
        refinements
          .map(
            (refinement) => `
              <span class="filter-label">${label}:</span>
              <span class="selected-filter">
                ${refinement.label}
                <a href="${createURL(refinement)}" class="remove-filter" data-refine="${refinement.value}">
                  ✕
                </a>
              </span>
            `
          )
          .join(''),
    },
  }),
  instantsearch.widgets.hits({
    container: '#hits',
    templates: {
      item: (hit, { html, components }) => html`
        <article class="search-result ${hit.type.replace(/\s+/g, '-').toLowerCase()}">
          <a href="${hit.full_url}" class="hit-link" target="_blank"> <!-- Enlace al full_url -->
            <img 
              src="${hit.headerImage_url ? hit.headerImage_url : 'ruta/a/imagen_por_defecto.jpg'}" 
              alt="${hit.title}" />
            <div>
              <h1>${components.Highlight({ hit, attribute: 'title' })}</h1>
              <p class="result-type">
                <span class="${hit.type.replace(/\s+/g, '-').toLowerCase()}">
                  ${components.Highlight({ hit, attribute: 'type' })}
                </span>
              </p>
              <p>${components.Highlight({ hit, attribute: 'description_limpia' })}</p>
            </div>
          </a>
          <a href="javascript:void(0);" class="leer-mas">Leer más</a> <!-- Botón para expandir -->
        </article>
      `,
    },
  }),
  instantsearch.widgets.configure({
    hitsPerPage: 12,
    query:"",
  }),
  instantsearch.widgets.panel({
    templates: { header: () => 'TIPO DE CONTENIDO' },
  })(instantsearch.widgets.refinementList)({
    container: '#type-list',
    attribute: 'type',
  }),
  instantsearch.widgets.panel({
    templates: { header: () => 'CATGEORIAS' },
  })(instantsearch.widgets.refinementList)({
    container: '#categorias_unicas-list',
    attribute: 'categorias_unicas',
    limit:15,
    showMore: true,
    showMoreLimit: 25
  }),
  instantsearch.widgets.pagination({
    container: '#pagination',
  }),
]);
// Añadir un evento a todos los enlaces "leer más"
// Evitar la redirección cuando se hace clic en "Leer más"
document.addEventListener('click', function (e) {
  if (e.target && e.target.classList.contains('leer-mas')) {
    e.preventDefault(); // Evitar redirigir al hacer clic en "Leer más"
    
    const parentItem = e.target.closest('.ais-Hits-item');
    if (parentItem) {
      parentItem.classList.toggle('expanded'); // Alternar la clase "expanded"
      
      // Cambiar el texto del botón "Leer más" según el estado
      if (parentItem.classList.contains('expanded')) {
        e.target.innerText = 'Leer menos';
      } else {
        e.target.innerText = 'Leer más';
      }
    }
  }
});
document.getElementById('filtersToggle').addEventListener('click', function() {
  const filtersContainer = document.getElementById('filtersContainer');
  filtersContainer.classList.toggle('filters-collapsed');
  filtersContainer.classList.toggle('filters-expanded');
});




search.start();
