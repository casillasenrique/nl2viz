import { createQuerySuggestionsPlugin } from '@algolia/autocomplete-plugin-query-suggestions';
import { createLocalStorageRecentSearchesPlugin } from '@algolia/autocomplete-plugin-recent-searches';
import algoliasearch from 'algoliasearch/lite';
import qs from 'qs';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  connectSearchBox,
  Highlight,
  Hits,
  InstantSearch,
  Menu,
  Pagination,
  Panel,
  RefinementList,
} from 'react-instantsearch-dom';

import { Autocomplete } from './Autocomplete';

import '@algolia/autocomplete-theme-classic/dist/theme.css';
import './SearchBar.css';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76',
);

function createURL(searchState) {
  return qs.stringify(searchState, { addQueryPrefix: true });
}

function searchStateToUrl({ location }, searchState) {
  if (Object.keys(searchState).length === 0) {
    return '';
  }

  return `${location.pathname}${createURL(searchState)}`;
}

function urlToSearchState({ search }) {
  return qs.parse(search.slice(1));
}

const VirtualSearchBox = connectSearchBox(() => null);

export default function SearchBar({ availableSearches }) {
  const [searchState, setSearchState] = useState(() =>
    urlToSearchState(window.location),
  );
  const timerRef = useRef(null);

  useEffect(() => {
    clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      window.history.pushState(
        searchState,
        null,
        searchStateToUrl({ location: window.location }, searchState),
      );
    }, 400);
  }, [searchState]);

  const onSubmit = useCallback(({ state }) => {
    setSearchState((searchState) => ({
      ...searchState,
      query: state.query,
    }));
  }, []);
  const onReset = useCallback(() => {
    setSearchState((searchState) => ({
      ...searchState,
      query: '',
    }));
  }, []);
  const plugins = useMemo(() => {
    const recentSearchesPlugin = createLocalStorageRecentSearchesPlugin({
      key: 'search',
      limit: 3,
      transformSource({ source }) {
        return {
          ...source,
          onSelect(params) {
            setSearchState((searchState) => ({
              ...searchState,
              query: params.item.label,
            }));
          },
        };
      },
    });

    return [
      recentSearchesPlugin,
      createQuerySuggestionsPlugin({
        searchClient,
        indexName: 'instant_search_demo_query_suggestions',
        getSearchParams() {
          return recentSearchesPlugin.data.getAlgoliaSearchParams({
            hitsPerPage: 5,
          });
        },
        transformSource({ source }) {
          return {
            ...source,
            onSelect(params) {
              setSearchState((searchState) => ({
                ...searchState,
                query: params.item.query,
              }));
            },
          };
        },
      }),
    ];
  }, []);

  return (
    <div className="container">
      <InstantSearch
        searchClient={searchClient}
        indexName="instant_search"
        searchState={searchState}
        onSearchStateChange={setSearchState}
        createURL={createURL}
      >
        {/* A virtual search box is required for InstantSearch to understand the `query` search state property */}
        <VirtualSearchBox />

        <div className="search-panel">
          <div className="search-panel__results">
            <Autocomplete
              placeholder="Search"
              detachedMediaQuery="none"
              initialState={{
                query: searchState.query,
              }}
              // getSources={() => {
              //   return [
              //     {
              //       sourceId: 'links',
              //       getItems() {
              //         return [
              //           { label: 'Twitter', url: 'https://twitter.com' },
              //           { label: 'GitHub', url: 'https://github.com' },
              //         ];
              //       },
              //       getItemUrl({ item }) {
              //         return item.url;
              //       },
              //       // ...
              //     },
              //   ];
              // }}
              openOnFocus={true}
              onSubmit={onSubmit}
              onReset={onReset}
              plugins={plugins}
            />
          </div>
        </div>
      </InstantSearch>
    </div>
  );
}
