import { Stack, usePathname, useRouter } from 'expo-router';
import { View } from 'react-native';
import { useOnboarding } from '../../contexts/onboarding-context';
import { useRevenueCat } from '../../contexts/revenuecat-context';
import { OnboardingButton } from './components/onboarding-button';

export default function OnboardingLayout() {
    const pathname = usePathname();
    const router = useRouter();
    const { setOnboardingDone } = useOnboarding();
    const { presentPaywall } = useRevenueCat();

    const isSetup = pathname.includes('setup');

    const handlePress = async () => {
        if (isSetup) {
            await setOnboardingDone(true);

            // Present paywall before navigating to home
            try {
                await presentPaywall();
            } catch (err) {
                console.error("Paywall failed:", err);
            }
            
            router.replace('/home');
        } else {
            router.push('/onboarding/setup');
        }
    };

    return (
        <View className="flex-1 bg-background">
            <View className="flex-1">
                <Stack
                    screenOptions={{
                        headerShown: false,
                        animation: 'fade',
                        animationDuration: 250,
                    }}
                />
            </View>

            <OnboardingButton
                label={isSetup ? "I'm Ready!" : "Next"}
                onPress={handlePress}
            />
        </View>
    );
}
