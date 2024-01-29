import React from "react";
import Link from "next/link";

interface ErrorPageStructureProps {
    errorCode: number;
    errorMessage: string;
    OppsText: string;
    message: string;
    GoHomeButtonText: string;
    SeeStatusText: string;
}

const ErrorPageStructure: React.FC<ErrorPageStructureProps> = ({ errorCode, errorMessage, message, OppsText, GoHomeButtonText, SeeStatusText }) => {
    return (
        <div className="position-absolute top-50 start-50 translate-middle">
            <div className="text-center">
                <h1 className="display-1 fw-bold">{errorCode}</h1>
                <p className="fs-3">
                    <span className="text-danger">{OppsText}</span> {errorMessage}
                </p>
                <p className="lead">{message}</p>
                <div
                    className="d-flex gap-4"
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <Link href="/" className="btn btn-primary">
                        {GoHomeButtonText}
                    </Link>
                    <a href="https://statutsae.openstatus.dev/" target="status" className="btn btn-primary">
                        {SeeStatusText}
                    </a>
                </div>
            </div>
        </div >
    );
};

export default ErrorPageStructure;