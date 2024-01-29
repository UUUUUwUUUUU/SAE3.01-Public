// Interface qui définit la structure d'un taxon
interface Taxon {
  id: number;
  vernacularName: string;
  fullname: string;
  habitat?: string;
  parentId?: number;
  scientificName?: string;
  authority?: string;
  fullName?: string;
  rankId?: number;
  rankName?: string;
  referenceName?: string;
  // frenchVernacularName?: string;
  // englishVernacularName?: string;
  genusName?: string;
  familyName?: string;
  orderName?: string;
  className?: string;
  phylumName?: string;
  kingdomName?: string;
  vernacularGenusName?: string;
  vernacularFamilyName?: string;
  vernacularOrderName?: string;
  vernacularClassName?: string;
  vernacularPhylumName?: string;
  vernacularKingdomName?: string;
  vernacularGroup1?: string;
  vernacularGroup2?: string;
  vernacularGroup3?: string;

}

export default Taxon;