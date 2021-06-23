import React from 'react';
import {Redirect, RouteComponentProps } from 'react-router-dom';
import SwaggerUI from 'swagger-ui-react';
import {ApiTestPageProps} from './ApiTestPageProps';
import './ApiTestPage.scss';
import Config from '../../api/config';

function ApiTestPage(props: RouteComponentProps<ApiTestPageProps>) {
  const params = props.match?.params;
  const queryParams = props.location?.search != null ? new URLSearchParams(props.location.search) : undefined;
  if (params == null || queryParams == null) {
    return <Redirect to="/not-found" />;
  }
  const apiBasePath = decodeURIComponent(queryParams.get('basePath') ?? '');
  return (
      <div
          className="api-test-page"
          data-testid="api-test-page"
      >
        <SwaggerUI
            url={`${Config.API_URL}app-source/spec/${params.apiId}`}
            requestInterceptor={(req) => {
              if (!req.url.startsWith(`${Config.API_URL}app-source/spec`)) {
                req.url = req.url.replace(/^https?:\/\/[^#?\/]+/, `${apiBasePath}`);
              }
              return req;
            }}
        />
      </div>
  );
}

export default ApiTestPage;
