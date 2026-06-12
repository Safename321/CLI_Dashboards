/**
 * @typedef {Object} CanonicalWorker
 * @property {string} externalId
 * @property {string} [employeeId]
 * @property {string} [email]
 * @property {string} legalName
 * @property {string} [preferredName]
 * @property {string} [positionTitle]
 * @property {string} [positionExternalId]
 * @property {string} [organizationName]
 * @property {string} [managerExternalId]
 * @property {string} status
 * @property {string} [hireDate]
 * @property {string} [terminationDate]
 */

export class HRISAdapter {
  static id = 'base';
  static name = 'Base Adapter';

  constructor(credentials = {}) {
    this.credentials = credentials;
  }

  async testConnection() {
    throw new Error('testConnection() not implemented');
  }

  async fetchWorkers() {
    throw new Error('fetchWorkers() not implemented');
  }

  async fetchOrganizations() {
    return [];
  }

  async fetchPositions() {
    return [];
  }
}
