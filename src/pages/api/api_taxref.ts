import TaxonRank from "@/types/TaxonRank";

//TODO: Vérifier types de variables et méthodes

/**
 * Classe qui gère les appels à l'API Taxref
 * @class API_CLASS
 */
export default class API_CLASS {
  TAXREF_API_URL: string;

  /**
   * Constructeur de la classe API_CLASS
   * @memberof API_CLASS
   */
  constructor() {
    this.TAXREF_API_URL = "https://taxref.mnhn.fr/api";
  }

  /**
   * Effectue une recherche de taxon à partir d'un nom vernaculaire
   * @memberof API_CLASS
   */
  async taxon_search(taxon: string, lang: string = "french", rank: TaxonRank = TaxonRank.ES, size: number = 300, version: string = "16.0"): Promise<any> {
    try {
      const url = `${this.TAXREF_API_URL}/taxa/search?version=${version}&${lang}VernacularNames=${taxon}&taxonomicRanks=${rank}&size=${size}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("La réponse réseau n'est pas ok (search)");
      }

      const data = await response.json();
      if (data._embedded && data._embedded.taxa) {
        const taxaMap = new Map(); // Filtrer doublons
        data._embedded.taxa.forEach((taxon: { [x: string]: any; id: any; habitat: any; }) => {
          const fullname = taxon.fullName;
          if (rank == 'ES') {
            if (taxon.parentId !== null) {
              taxaMap.set(fullname, taxon);
            }
          } else {
            taxaMap.set(fullname, taxon)
          }
        });

        const results = Array.from(taxaMap.values()).map((taxon: { [x: string]: any; id: any; fullName: any; authority: any; habitat: any; }) => {
          return {
            id: taxon.id,
            vernacularName: taxon[`${lang}VernacularName`],
            fullname: taxon.fullName,
            authority: taxon.authority,
          };
        })
        // .filter(Boolean); // Filtre les résultats null

        // TODO : trier les résultats par pertinence

        return results;
      } else {
        console.log("La recherche n'a retournée aucun résultat");
        return [];
      }
    } catch (erreur) {
      console.error("Une erreur est survenue lors de la requête taxon_search; taxon: " + taxon + "; erreur: " + erreur);
      throw erreur;
    }
  }

  /**
   * Détails d'un taxon à partir de son id
   * @memberof API_CLASS
   */
  async taxon_details(id: string | undefined, lang: string = "french", minimalReturn: boolean = false) {
    try {
      const url = `${this.TAXREF_API_URL}/taxa/${id}`;
      // console.log(url);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("La réponse réseau n'est pas ok (id_details) Id:" + id);
      }

      //TODO: Gérer ID non existant

      // return response.json();
      // return as a taxon object
      const data = await response.json();

      if (minimalReturn) {
        return {
          id: data.id,
          vernacularName: data[`${lang}VernacularName`],
          fullname: data.fullName,
          rankName: data.rankName,
        };
      } else {
        return {
          // TODO : detailTaxon :filter ce qui n'est pas utilisé ici plus tard
          id: data.id,
          vernacularName: data[`${lang}VernacularName`],
          parentId: data.parentId,
          scientificName: data.scientificName,
          authority: data.authority,
          fullname: data.fullName,
          rankId: data.rankId,
          rankName: data.rankName,
          referenceName: data.referenceName,
          // frenchVernacularName: data.frenchVernacularName,
          // englishVernacularName: data.englishVernacularName,
          genusName: data.genusName,
          familyName: data.familyName,
          orderName: data.orderName,
          className: data.className,
          phylumName: data.phylumName,
          kingdomName: data.kingdomName,
          vernacularGenusName: data.vernacularGenusName,
          vernacularFamilyName: data.vernacularFamilyName,
          vernacularOrderName: data.vernacularOrderName,
          vernacularClassName: data.vernacularClassName,
          vernacularPhylumName: data.vernacularPhylumName,
          vernacularKingdomName: data.vernacularKingdomName,
          vernacularGroup1: data.vernacularGroup1,
          vernacularGroup2: data.vernacularGroup2,
          vernacularGroup3: data.vernacularGroup3,
          habitat: data.habitat,
          // territory: [
          //   data.fr,
          //   data.gf,
          //   data.mar,
          //   data.gua,
          //   data.sm,
          //   data.sb,
          //   data.spm,
          //   data.may,
          //   data.epa,
          //   data.reu,
          //   data.sa,
          //   data.ta,
          //   data.nc,
          //   data.wf,
          //   data.pf,
          //   data.cli
          // ]
        };
      }
    } catch (erreur) {
      console.error("Une erreur est survenue lors de la requête id_details; id: " + id + "; erreur: " + erreur);
      throw erreur;
    }
  }

  /**
   * Détails d'un habitat à partir de son id
   * @memberof API_CLASS
   */
  async habitat_details(id: ErrorOptions | undefined) {
    try {
      const url = `${this.TAXREF_API_URL}/habitats/${id}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("La réponse réseau n'est pas ok (habitat_details) Id:", id);
      }

      const data = await response.json();
      return {
        id: data.id,
        name: data.name,
        definition: data.definition,
      };

    } catch (erreur) {
      console.error("Une erreur est survenue lors de la requête habitat_details; id: " + id + "; erreur: " + erreur);
      throw erreur;
    }
  }

  /**
   * Détails d'une classification à partir de son id
   * @memberof API_CLASS
   */
  async taxon_classification(id: string | undefined, lang: string = "french") {
    try {
      const url = `${this.TAXREF_API_URL}/taxa/${id}/classification`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("La réponse réseau n'est pas ok (classification_details) Id:" + id);
      }

      const data = await response.json();
      if (data._embedded && data._embedded.taxa) {
        const taxaMap = new Map(); // Filtrer doublons
        data._embedded.taxa.forEach((taxon: { [x: string]: any; id: any; habitat: any; vernacularName: any }) => {
          const referenceName = taxon.referenceName;
          taxaMap.set(referenceName, taxon);
        });

        const results = Array.from(taxaMap.values()).map((taxon: { [x: string]: any; id: any; fullName: any; authority: any; habitat: any; }) => {
          return {
            id: taxon.id,
            vernacularName: taxon[`${lang}VernacularName`],
            fullname: taxon.fullName,
            authority: taxon.authority,
            rankName: taxon.rankName,
          };
        })
        // .filter(Boolean); // Filtre les résultats null
        return results;

      } else {
        console.log("La recherche n'a retournée aucun résultat");
        return [];
      }

    } catch (erreur) {
      console.error("Une erreur est survenue lors de la requête classification_details; id: " + id + "; erreur: " + erreur);
      throw erreur;
    }
  }

  /**
   * Détails des statuts d'un taxon à partir de son id
   * @memberof API_CLASS
   */
  async taxon_statuts(id: string | undefined, lang: string = "french") {
    try {
      const url = `${this.TAXREF_API_URL}/taxa/${id}/status/lines`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("La réponse réseau n'est pas ok (taxon_statuts) Id:" + id);
      }

      const data = await response.json();
      if (data._embedded && data._embedded.status) {
        const results = data._embedded.status.reduce((acc: any, status: any) => {
          const statusTypeGroup = status.statusTypeGroup;
          if (!acc[statusTypeGroup]) {
            acc[statusTypeGroup] = [];
          }

          acc[statusTypeGroup].push({
            statusCode: status.statusCode,
            locationId: status.locationId,
            locationName: status.locationName,
            BioGeoStatut: status.statusCode === "P",
            source: status.source,
            shortSource: status.source ? (status.source.match(/<em>(.*?[^<]+)<\/em>/g)?.sort((a: string | any[], b: string | any[]) => b.length - a.length)[0]?.replace(/<em>|<\/em>/g, '').replace(/^\W+/, '') || status.source) : "",
            authorSource: status.source,
            // authorSource: status.source && /\d{4}/.test(status.source)
            //   ? status.source.match(/.*\d{4}/)[0]
            //   : null,
            statusRemarks: status.statusRemarks,
            statusTypeName: status.statusTypeName,
            // statusName: status.statusName,

          });
          return acc;
        }, {});
        return results;
      } else {
        console.log("La recherche taxon_statuts n'a retournée aucun résultat");
        return {};
      }
    } catch (erreur) {
      console.error("Une erreur est survenue lors de la requête taxon_statuts; id: " + id + "; erreur: " + erreur);
      throw erreur;
    }
  }

  /**
   * Liste des liens externes d'un taxon à partir de son id
   * @memberof API_CLASS
   */
  async taxon_externalIds(id: string | undefined) {
    try {
      const url = `${this.TAXREF_API_URL}/taxa/${id}/externalIds`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("La réponse réseau n'est pas ok (classification_details) Id:" + id);
      }

      const data = await response.json();
      const results = data._embedded.externalDb.map((externalId: { [x: string]: any; url: any }) => {
        return {
          externalDbTitle: externalId.externalDbTitle,
          url: externalId.url,
        };
      });
      return results;

    } catch (erreur) {
      console.error("Une erreur est survenue lors de la requête taxon_externalIds; id: " + id + "; erreur: " + erreur);
      throw erreur;
    }
  }

  /**
   * Liste des bibliographies d'un taxon à partir de son id
   * @memberof API_CLASS
   */
  async taxon_bibliographie(id: string | undefined) {
    try {
      const url = `${this.TAXREF_API_URL}/taxa/${id}/sources`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("La réponse réseau n'est pas ok (classification_details) Id:" + id);
      }

      const data = await response.json();
      const results = await Promise.all(data._embedded.taxonSources.map(async (source: { [x: string]: any; url: any }) => {
        return {
          sourceId: source.sourceId,
          source: source.source,
          page: source.page,
          hrefToSelf: source._links.bibliographicResource.href,
          hrefToSource: await this.taxon_bibliographieGetLink(source._links.bibliographicResource.href),
        };
      }));
      console.log(results);
      return results;

    } catch (erreur) {
      console.error("Une erreur est survenue lors de la requête taxon_bibliographie; id: " + id + "; erreur: " + erreur);
      throw erreur;
    }
  }

  /**
   * Récupère le lien vers la bibliographie d'une bibliographie à partir de son url _links.bibliographicResource.href
   * @memberof API_CLASS
   */
  async taxon_bibliographieGetLink(hrefToSelf: string | undefined) {
    try {
      const url = `${hrefToSelf}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("La réponse réseau n'est pas ok (classification_details) Id:" + hrefToSelf);
      }

      const data = await response.json();

      if (data._links && data._links.bibTexFile && data._links.bibTexFile.href) {
        return data._links.bibTexFile.href;
      } else {
        return null;
      }

    } catch (erreur) {
      console.error("Une erreur est survenue lors de la requête taxon_bibliographieGetLink; id: " + hrefToSelf + "; erreur: " + erreur);
      throw erreur;
    }
  }

  /**
   * Permet de faire une recherche globale sur l'API Taxref
   * @memberof API_CLASS
   */
  async searchAll(lang: string = "french", rank: TaxonRank = TaxonRank.ES, size: number = 300, page: number = 1, version: string = "16.0"): Promise<any> {
    try {
      const url = `${this.TAXREF_API_URL}/taxa/search?version=${version}&page=${page}&taxonomicRanks=${rank}&size=${size}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("La réponse réseau n'est pas ok (search)");
      }

      const data = await response.json();
      if (data._embedded && data._embedded.taxa) {
        const taxaMap = new Map(); // Use a map to filter duplicates
        data._embedded.taxa.forEach((taxon: { [x: string]: any; id: any; habitat: any; }) => {
          const fullname = taxon.fullName;
          if (taxon.parentId !== null && taxon.rankId == "ES") {
            taxaMap.set(fullname, taxon);
          }
        });

        const results = Array.from(taxaMap.values()).map((taxon: { [x: string]: any; id: any; fullName: any; authority: any; habitat: any; }) => {
          // Vérifie si l'habitat est null 
          if (taxon.habitat !== null) {
            return {
              id: taxon.id,
              vernacularName: taxon[`${lang}VernacularName`],
              fullname: taxon.fullName,
              authority: taxon.authority,
            };
          }
          return null;
        }).filter(Boolean); // Filtre les résultats null

        // TODO : trier les résultats par pertinence

        return results;
      } else {
        console.log("La recherche n'a retournée aucun résultat");
        return [];
      }
    } catch (erreur) {
      console.error("erreur: " + erreur);
      // TODO : meilleure erreur
      throw erreur;
    }
  }
}