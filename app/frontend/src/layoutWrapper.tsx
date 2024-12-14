import { AccountInfo, EventType, PublicClientApplication } from "@azure/msal-browser";
import { checkLoggedIn, msalConfig, useLogin, getXmsPlValue } from "./authConfig";
import { useEffect, useState } from "react";
import { MsalProvider } from "@azure/msal-react";
import { LoginContext } from "./loginContext";
import Layout from "./pages/layout/Layout";

const LayoutWrapper = () => {
    const [loggedIn, setLoggedIn] = useState(false);
    const [xmsPlValue, setXmsPlValue] = useState<string | undefined>(undefined);

    if (useLogin) {
        var msalInstance = new PublicClientApplication(msalConfig);

        // Default to using the first account if no account is active on page load
        if (!msalInstance.getActiveAccount() && msalInstance.getAllAccounts().length > 0) {
            // Account selection logic is app dependent. Adjust as needed for different use cases.
            msalInstance.setActiveAccount(msalInstance.getActiveAccount());
        }

        // Listen for sign-in event and set active account
        msalInstance.addEventCallback(event => {
            if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
                const account = event.payload as AccountInfo;
                msalInstance.setActiveAccount(account);
            }
        });

        useEffect(() => {
            const fetchLoggedIn = async () => {
                setLoggedIn(await checkLoggedIn(msalInstance));
                setXmsPlValue(await getXmsPlValue(msalInstance));
            };

            fetchLoggedIn();
        }, []);

        return (
            <MsalProvider instance={msalInstance}>
                <LoginContext.Provider
                    value={{
                        loggedIn,
                        setLoggedIn
                    }}
                >
                    <div>
                        <Layout />
                        {xmsPlValue && <div>Preferred Language: {xmsPlValue}</div>}
                    </div>
                </LoginContext.Provider>
            </MsalProvider>
        );
    } else {
        return (
            <LoginContext.Provider
                value={{
                    loggedIn,
                    setLoggedIn
                }}
            >
                <Layout />
            </LoginContext.Provider>
        );
    }
};

export default LayoutWrapper;
