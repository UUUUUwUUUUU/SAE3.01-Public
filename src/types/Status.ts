interface Status {
    statusCode: string;
    locationId: string;
    locationName: string;
    BioGeoStatut: boolean;
    source?: string;
    shortSource?: string;
    authorSource?: string;
    statusRemarks?: string;
    statusTypeName?: string;
}

export default Status;