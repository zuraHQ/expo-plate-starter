import { Button } from 'heroui-native';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface OnboardingButtonProps {
    label: string;
    onPress: () => void;
}

export function OnboardingButton({ label, onPress }: OnboardingButtonProps) {
    const insets = useSafeAreaInsets();

    return (
        <View
            className="px-6"
            style={{ paddingBottom: insets.bottom + 16, paddingTop: 24 }}
        >
            <Button
                variant="primary"
                size="lg"
                onPress={onPress}
            >
                <Button.Label>{label}</Button.Label>
            </Button>
        </View>
    );
}
