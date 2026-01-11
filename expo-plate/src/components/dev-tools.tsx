import { View } from 'react-native';
import { Button } from 'heroui-native';
import { useOnboarding } from '../contexts/onboarding-context';
import { useRevenueCat } from '../contexts/revenuecat-context';
import { storage, StorageKeys } from '../helpers/utils/storage';

export function DevTools() {
    const { setOnboardingDone } = useOnboarding();
    const { presentPaywall } = useRevenueCat();

    const handleResetOnboarding = async () => {
        await setOnboardingDone(false);
        await storage.remove(StorageKeys.USER_NAME);
        await storage.remove(StorageKeys.USER_PREFERENCES);
    };

    return (
        <View className="mt-8 mb-4 gap-3">
            <Button variant="primary" className="bg-red-500" onPress={handleResetOnboarding}>
                <Button.Label>Reset Onboarding</Button.Label>
            </Button>
            <Button variant="primary" onPress={presentPaywall}>
                <Button.Label>Test Paywall</Button.Label>
            </Button>
        </View>
    );
}
