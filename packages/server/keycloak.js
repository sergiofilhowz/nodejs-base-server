const axios = require('axios');
const querystring = require('querystring');
const { UnauthorizedError } = require('./errors');
const { get, isArray, intersection } = require('lodash');
const config = require('./config');

const validateTokenConfig = {
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
};

class KeycloakClient {

  constructor(config) {
    this.keycloakAuthUrl = config.get('KEYCLOAK_AUTH_URL');
    this.clientId = config.get('KEYCLOAK_CLIENT_ID');
    this.clientSecret = config.get('KEYCLOAK_CLIENT_SECRET');
    this.realm = config.get('KEYCLOAK_REALM');

    this.basicAuth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    this.validateUrl = `/realms/${this.realm}/protocol/openid-connect/token/introspect`;
    this.tokenUrl = `/realms/${this.realm}/protocol/openid-connect/token`;
    this.server = axios.create({ baseURL: this.keycloakAuthUrl });
  }

  async validateAccessToken(token) {
    const body = querystring.stringify({
      token,
      client_id: this.clientId,
      client_secret: this.clientSecret
    });
    const { data } = await this.server.post(this.validateUrl, body, validateTokenConfig);
    data.hasRole = roles => {
      if (!isArray(roles)) roles = [roles];
      const tokenRoles = get(data, `resource_access.${this.clientId}.roles`);
      return tokenRoles && intersection(tokenRoles, roles).length > 0;
    };
    return data;
  }

  async interceptExpressRequest(request, role) {
    const bearer = request.headers['authorization'];
    if (!bearer) {
      throw new UnauthorizedError('Not Authorized');
    }

    const tokenData = await this.validateAccessToken(bearer.substr("bearer ".length));
    if (!tokenData.active || !tokenData.hasRole(role)) {
      throw new UnauthorizedError('Not Authorized');
    }
    request.tokenData = tokenData;
  };

  async interceptAxiosError(error) {
    if (error.response.status === 401) {
      await this.interceptAxiosRequest(error.config, true);
      return axios.request(error.config);
    }
    return Promise.reject(error);
  };

  async interceptAxiosRequest(request, renew) {
    if (!this.accessToken || renew) {
      const body = querystring.stringify({ grant_type: 'client_credentials' });
      const { data } = await this.server.post(this.tokenUrl, body, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${this.basicAuth}`
        }
      });

      this.accessToken = data['access_token'];
    }

    request.headers.Authorization = `Bearer ${this.accessToken}`;
    return request;
  }
}

module.exports = new KeycloakClient(config);