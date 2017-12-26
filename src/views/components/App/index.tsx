import * as React from 'react';
import { graphql } from 'react-apollo';
import * as gql from 'graphql-tag';

import Header from '../Header';
import SourceTable from '../SourceTable';
import './style.scss';

import ReactTable from 'react-table';
import 'react-table/react-table.css';

const ALL_SOURCES_QUERY = gql`
  query AllSourcesQuery {
    allSources {
      name
      organization
      phone
      email
      notes
    }
  }
`;

const App = props => (
  <div className="container">
    <Header />
    <SourceTable sources={props.allSourcesQuery.allSources} />
  </div>
);

export default graphql(ALL_SOURCES_QUERY, { name: 'allSourcesQuery' })(App);