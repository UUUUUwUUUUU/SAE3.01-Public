import ErrorPageStructure from "@lib/ErrorPageStructure";
import useTranslation from "next-translate/useTranslation";

const ErrorPage404: React.FC = () => {
    const { t } = useTranslation("common");
    return (
        <ErrorPageStructure
            errorCode={404}
            OppsText={t("OPPS")}
            errorMessage={t("ERROR_404")}
            message={t("ERROR_404_MESSAGE")}
            GoHomeButtonText={t("RETURN_TO_HOME")}
            SeeStatusText={t("SEE_STATUS")}
        />
    )
}

export default ErrorPage404;