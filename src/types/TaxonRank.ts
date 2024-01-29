enum TaxonRank {
    TOUT = 'TOUT',  // TOUT
    Dumm = 'Dumm',  // Domaine
    KD = 'KD',      // Règne
    PH = 'PH',      // Phylum
    CL = 'CL',      // Classe
    OR = 'OR',      // Ordre
    FM = 'FM',      // Famille
    SBFM = 'SBFM',  // Sous-Famille
    TR = 'TR',      // Tribu
    GN = 'GN',      // Genre
    AGES = 'AGES',  // Agrégat
    ES = 'ES',      // Espèce
    SSES = 'SSES',  // Sous-Espèce
    NAT = 'NAT',    // Natio
    VAR = 'VAR',    // Variété
    SVAR = 'SVAR',  // Sous-Variété
    FO = 'FO',      // Forme
    SSFO = 'SSFO',  // Sous-Forme
    RACE = 'RACE',  // Race
    CAR = 'CAR',    // Cultivar
    AB = 'AB'       // Abberatio
}

export function getDisplayName(rank: TaxonRank): string {
    switch (rank) {
        case TaxonRank.TOUT:
            return 'Aucun filtre';
        case TaxonRank.Dumm:
            return 'Domaine';
        case TaxonRank.KD:
            return 'Règne';
        case TaxonRank.PH:
            return 'Phylum';
        case TaxonRank.CL:
            return 'Classe';
        case TaxonRank.OR:
            return 'Ordre';
        case TaxonRank.FM:
            return 'Famille';
        case TaxonRank.SBFM:
            return 'Sous-Famille';
        case TaxonRank.TR:
            return 'Tribu';
        case TaxonRank.GN:
            return 'Genre';
        case TaxonRank.AGES:
            return 'Agrégat';
        case TaxonRank.ES:
            return 'Espèce';
        case TaxonRank.SSES:
            return 'Sous-Espèce';
        case TaxonRank.NAT:
            return 'Natio';
        case TaxonRank.VAR:
            return 'Variété';
        case TaxonRank.SVAR:
            return 'Sous-Variété';
        case TaxonRank.FO:
            return 'Forme';
        case TaxonRank.SSFO:
            return 'Sous-Forme';
        case TaxonRank.RACE:
            return 'Race';
        case TaxonRank.CAR:
            return 'Cultivar';
        case TaxonRank.AB:
            return 'Abberatio';
    }
}

export default TaxonRank;
