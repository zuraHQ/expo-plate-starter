import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import Purchases, { CustomerInfo, PurchasesPackage } from 'react-native-purchases';
import RevenueCatUI from 'react-native-purchases-ui';

const API_KEYS = {
    ios: 'appl_YWQtYLpWMiKBoZjueuBAEXacitx',
    android: 'your_revenuecat_android_api_key',
};

const RevenueCatContext = createContext<RevenueCatContextType | undefined>(undefined);

export function RevenueCatProvider({ children }: { children: React.ReactNode }) {
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
    const [packages, setPackages] = useState<PurchasesPackage[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);
    const listenerRemover = useRef<(() => void) | null>(null);

    useEffect(() => {
        let isMounted = true;

        const init = async () => {
            try {
                const apiKey = Platform.OS === 'ios' ? API_KEYS.ios : API_KEYS.android;
                
                await Purchases.configure({ apiKey });

                // Get initial customer info
                const info = await Purchases.getCustomerInfo();
                if (isMounted) {
                    setCustomerInfo(info);
                }

                // Get available packages
                try {
                    const offerings = await Purchases.getOfferings();
                    if (isMounted && offerings.current?.availablePackages) {
                        setPackages(offerings.current.availablePackages);
                    }
                } catch (e) {
                    console.error('Error fetching offerings:', e);
                }

                // Listen for customer info updates
                const removeListener = Purchases.addCustomerInfoUpdateListener((info) => {
                    if (isMounted) {
                        setCustomerInfo(info);
                    }
                });
                listenerRemover.current = removeListener as unknown as () => void;

                if (isMounted) {
                    setIsInitialized(true);
                }
            } catch (e) {
                console.error('Error initializing RevenueCat:', e);
            }
        };

        init();

        // Cleanup listener on unmount
        return () => {
            isMounted = false;
            if (listenerRemover.current) {
                listenerRemover.current();
            }
        };
    }, []);

    const isProUser = customerInfo?.entitlements.active['pro'] !== undefined;

    const purchasePackage = async (pkg: PurchasesPackage) => {
        try {
            const { customerInfo } = await Purchases.purchasePackage(pkg);
            setCustomerInfo(customerInfo);
        } catch (e: any) {
            if (!e.userCancelled) {
                console.error('Purchase error:', e);
                throw e;
            }
        }
    };

    const restorePurchases = async () => {
        try {
            const info = await Purchases.restorePurchases();
            setCustomerInfo(info);
        } catch (e) {
            console.error('Restore error:', e);
            throw e;
        }
    };

    const presentPaywall = async () => {
        await RevenueCatUI.presentPaywall();
    };

    return (
        <RevenueCatContext.Provider
            value={{
                isInitialized,
                isProUser,
                customerInfo,
                packages,
                purchasePackage,
                restorePurchases,
                presentPaywall,
            }}
        >
            {children}
        </RevenueCatContext.Provider>
    );
}

export function useRevenueCat() {
    const context = useContext(RevenueCatContext);
    if (context === undefined) {
        throw new Error('useRevenueCat must be used within a RevenueCatProvider');
    }
    return context;
}
