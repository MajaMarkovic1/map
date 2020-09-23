const stagingPattern = /staging-\S+.map2web.(eu|ro)/;
const prodPattern= /\S+.map2web.(eu|ro)/;

export class M2wApi {
  static domain = M2wApi.parseDomain();
  static host_address = M2wApi.parseApiHostname();
  static base_address = M2wApi.host_address + "apiv2/project/";

  static async get_project_info() {
    const response = await fetch(M2wApi.base_address + M2wApi.domain);
    return await response.json();
  }

  static async get_project_pois(lang) {
    let url = M2wApi.base_address + M2wApi.domain + "/pois";
    if (lang) url += `?lang=${lang}`;

    const response = await fetch(url);
    return await response.json();
  }

  static async get_single_poi(id, lang, parent) {
    let url = M2wApi.base_address + M2wApi.domain + `/pois/${id}?`;
    if (lang) url += `lang=${lang}&`;
    if (parent) url += `parent=${parent}`;

    const response = await fetch(url);
    return await response.json();
  }

  static async get_streets() {
    const response = await fetch(M2wApi.base_address + M2wApi.domain + "/streets");
    return await response.json();
  }

  static async get_single_street(id) {
    const response = await fetch(M2wApi.base_address + M2wApi.domain + `/streets/${id}`);
    return await response.json();
  }

  static async get_search_results(term, page, pagesize, location, lang) {
    const l = location.split(",");
    let url = M2wApi.base_address + M2wApi.domain + `/search?q=${term}&page=${page}&count=${pagesize}&x=${l[0]}&y=${l[1]}`;
    if (lang) url += `&lang=${lang}`;
    const response = await fetch(url);
    return await response.json();
  }
  static async get_closest_poi(coordinates, lang) {
    let url = M2wApi.base_address + M2wApi.domain + `/near_me?x=${coordinates[0]}&y=${coordinates[1]}`;
    if (lang) url += `&lang=${lang}`;
    const response = await fetch(url);
    return await response.json();
  }

  static parseDomain(){
    if(stagingPattern.test(window.location.hostname))
      return window.location.hostname.substr("staging-".length);
    if(prodPattern.test(window.location.hostname))
      return window.location.hostname;

    // Fallback
    return "st-poelten.map2web.eu";

  }

  static parseApiHostname(){
    let hostname = window.location.hostname;
    if(prodPattern.test(hostname) || stagingPattern.test(hostname))
      return "https://api.map2web.eu/";
    return "http://staging-api.map2web.eu:7000/";
  }
}
