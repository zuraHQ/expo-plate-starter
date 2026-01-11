import { View, Pressable } from 'react-native';
import { Card, Switch } from 'heroui-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';
import { Ionicons } from '@expo/vector-icons';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { AppText } from '../../../components/app-text';
import { useAppTheme } from '../../../contexts/app-theme-context';
import { withUniwind } from 'uniwind';

const StyledIonicons = withUniwind(Ionicons);

const SETTINGS_OPTIONS = [
    {
        icon: 'file-text' as const,
        label: 'Privacy Policy',
        onPress: () => { },
    },
    {
        icon: 'book-open' as const,
        label: 'Terms of Service',
        onPress: () => { },
    },
    {
        icon: 'trash-2' as const,
        label: 'Delete Account',
        onPress: () => { },
        danger: true,
    },
];

export default function SettingsScreen() {
    const insets = useSafeAreaInsets();
    const { toggleTheme, isDark } = useAppTheme();

    return (
        <View
            className="flex-1 bg-background px-4"
            style={{ paddingTop: 20 }}
        >


            <View className="gap-3">
                <Card className="p-4 border border-border/50">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-3">
                            <Feather name="moon" size={20} color="#888" />
                            <AppText className="font-medium text-foreground">
                                Dark Mode
                            </AppText>
                        </View>
                        <Switch
                            isSelected={isDark}
                            onSelectedChange={toggleTheme}
                            className="w-[50px] h-[28px]"
                        >
                            <Switch.Thumb className="size-[22px]" />
                            <Switch.StartContent className="left-1.5">
                                {isDark && (
                                    <Animated.View key="moon" entering={ZoomIn}>
                                        <StyledIonicons name="moon" size={14} className="text-blue-200" />
                                    </Animated.View>
                                )}
                            </Switch.StartContent>
                            <Switch.EndContent className="right-1.5">
                                {!isDark && (
                                    <Animated.View key="sun" entering={ZoomIn}>
                                        <StyledIonicons name="sunny" size={14} className="text-yellow-500" />
                                    </Animated.View>
                                )}
                            </Switch.EndContent>
                        </Switch>
                    </View>
                </Card>

                {SETTINGS_OPTIONS.map((item, index) => (
                    <Pressable key={index} onPress={item.onPress}>
                        <Card className="p-4 border border-border/50">
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center gap-3">
                                    <Feather
                                        name={item.icon}
                                        size={20}
                                        color={item.danger ? '#ef4444' : '#888'}
                                    />
                                    <AppText
                                        className={`font-medium ${item.danger ? 'text-red-500' : 'text-foreground'}`}
                                    >
                                        {item.label}
                                    </AppText>
                                </View>
                                <Feather name="chevron-right" size={20} color="#888" />
                            </View>
                        </Card>
                    </Pressable>
                ))}
            </View>
        </View>
    );
}
