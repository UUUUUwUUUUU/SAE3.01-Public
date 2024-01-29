import ErrorPageStructure from "@lib/ErrorPageStructure";
import useTranslation from "next-translate/useTranslation";

const ErrorPage500: React.FC = () => {
    const { t } = useTranslation("common");
    return (
        <ErrorPageStructure
            errorCode={500}
            OppsText={t("OPPS")}
            errorMessage={t("ERROR_500")}
            message={t("ERROR_500_MESSAGE")}
            GoHomeButtonText={t("RETURN_TO_HOME")}
            SeeStatusText={t("SEE_STATUS")}
        />
    )
}

export default ErrorPage500;