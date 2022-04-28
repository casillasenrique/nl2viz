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

import { getAlgoliaResults } from '@algolia/autocomplete-js';

import { Autocomplete } from './Autocomplete';

import '@algolia/autocomplete-theme-classic/dist/theme.css';
import './SearchBar.css';

const appId = 'latency';
const apiKey = '6be0576ff61c053d5f9a3225e2a90f76';
const searchClient = algoliasearch(appId, apiKey);

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

export default function SearchBar({ availableSearches, onSearch }) {
  useEffect(() => {
    console.log('refreshed');
  }, [availableSearches]);

  const [searchState, setSearchState] = useState(() =>
    urlToSearchState(window.location),
  );

  const onSubmit = useCallback(({ state }) => {
    onSearch(state.query);
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

    return [recentSearchesPlugin];
  }, []);

  return (
    <div className="w-[500px] h-12 pr-1 mr-1 bg-transparent">
      {true && (
        <Autocomplete
          
          placeholder="Find query"
          openOnFocus={true}
          onSubmit={onSubmit}
          onReset={onReset}
          plugins={plugins}
          getSources={({ query }) => [
            {
              sourceId: 'products',
              getItems() {
                return availableSearches
                  .map((search) => ({ label: search, url: search }))
                  .filter(({ label }) =>
                    label.toLowerCase().includes(query?.toLowerCase()),
                  );
              },
              getItemUrl({ item }) {
                return item.url;
              },
              templates: {
                item({ item, components }) {
                  // console.log(components);
                  return (
                    // <components.Highlight hit={item} attribute={["label"]} attributes />
                    <span
                      style={{ width: '100%', height: '100%' }}
                      onClick={() => {
                        onSearch(item.label);

                        setSearchState((searchState) => ({
                          ...searchState,
                          query: item.label,
                        }));
                      }}
                    >
                      {item.label}
                    </span>
                  );
                },
              },
            },
          ]}
        />
      )}
    </div>
  );
}
