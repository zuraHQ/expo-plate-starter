import React, { useState } from 'react';
import { View, Text, Alert, Pressable, TextInput } from 'react-native';
import { router, Stack } from 'expo-router';
import { useSSO, useSignIn, useSignUp } from '@clerk/clerk-expo';
import { Button, useToast } from 'heroui-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { AppleLogo, GoogleLogo } from '@/src/components/icons';

export default function SignIn() {
  const { startSSOFlow } = useSSO();
  const { signIn, isLoaded: isSignInLoaded, setActive: setActiveFromSignIn } = useSignIn();
  const { signUp, isLoaded: isSignUpLoaded, setActive: setActiveFromSignUp } = useSignUp();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailCode, setEmailCode] = useState('');
  const [pendingVerification, setPendingVerification] = useState<'signIn' | 'signUp' | null>(null);
  const { toast } = useToast();

  const handleSSO = async (strategy: 'oauth_google' | 'oauth_apple') => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({ strategy });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        toast.show({ label: '👋 Welcome back!', description: 'Signed in successfully', variant: 'default' });
        router.replace('/(tabs)/home');
      }
    } catch (err) {
      console.error('SSO Error:', err);
    }
  };

  const handleEmailSignIn = async () => {
    if (!email.trim()) return;
    setIsLoading(true);

    try {
      const si = await signIn!.create({ identifier: email.trim() });
      const emailFactor = si.supportedFirstFactors?.find(
        (f: any) => f.strategy === 'email_code'
      ) as any;

      await signIn!.prepareFirstFactor({
        strategy: 'email_code',
        emailAddressId: emailFactor.emailAddressId,
      });
      setPendingVerification('signIn');
    } catch {
      await signUp!.create({ emailAddress: email.trim() });
      await signUp!.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification('signUp');
    } finally {
      setIsLoading(false);
      Alert.alert('Code sent', 'Check your email.');
    }
  };

  const handleVerifyCode = async () => {
    if (!emailCode.trim() || !pendingVerification) return;

    setIsLoading(true);
    try {
      if (pendingVerification === 'signIn' && signIn) {
        const attempt = await signIn.attemptFirstFactor({
          strategy: 'email_code',
          code: emailCode.trim(),
        });
        if (attempt?.status === 'complete') {
          await setActiveFromSignIn?.({ session: attempt.createdSessionId });
          toast.show({ label: '👋 Welcome back!', description: 'Signed in successfully', variant: 'default' });
          router.replace('/(tabs)/home');
        }
      } else if (pendingVerification === 'signUp' && signUp) {
        const attempt = await signUp.attemptEmailAddressVerification({
          code: emailCode.trim(),
        });
        if (attempt?.status === 'complete') {
          await setActiveFromSignUp?.({ session: attempt.createdSessionId });
          toast.show({ label: '🎉 Welcome!', description: 'Account created successfully', variant: 'default' });
          router.replace('/(tabs)/home');
        }
      }
    } catch {
      Alert.alert('Error', 'Invalid code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (

    // btw should add Loadings when email sign in and verify ( there is no loadings added so screen
    // appears static for a moment )
    <KeyboardAwareScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 }}
      style={{ flex: 1, backgroundColor: 'white' }}
      keyboardShouldPersistTaps="handled"
    >
      <Stack.Screen options={{ headerShown: false }} />

      <Text className="text-3xl font-bold text-center mb-8">Sign In</Text>

      {!pendingVerification ? (
        <View className="gap-4">
          <Button
            onPress={() => handleSSO('oauth_apple')}
            className="flex-row items-center justify-center gap-3 bg-black rounded-xl"
          >
            <AppleLogo />
            <Button.Label className="text-white font-semibold text-base">Continue with Apple</Button.Label>
          </Button>

          <Button
            onPress={() => handleSSO('oauth_google')}
            className="flex-row items-center justify-center gap-3 bg-white border border-gray-300  rounded-xl"
          >
            <GoogleLogo />
            <Text className="text-gray-800 font-semibold text-base">Continue with Google</Text>
          </Button>

          <View className="flex-row items-center">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="px-4 text-gray-400">or</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          <TextInput
            placeholder="Email address"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            className="bg-white border border-gray-300 rounded-xl px-4 py-3"
          />

          <Button
            onPress={handleEmailSignIn}
            isDisabled={!email.trim()}
            className="bg-purple-500 rounded-xl shadow-md"
          >
            <Button.Label>Continue with Email</Button.Label>
          </Button>
        </View>
      ) : (
        <View className="gap-4">
          <Text className="text-center text-gray-600 mb-4">
            Enter the code sent to {email}
          </Text>

          <TextInput
            placeholder="6-digit code"
            placeholderTextColor="#9CA3AF"
            value={emailCode}
            onChangeText={setEmailCode}
            keyboardType="number-pad"
            className="bg-gray-100 border border-gray-300 rounded-xl px-4 py-3"
          />

          <Button
            onPress={handleVerifyCode}
            isDisabled={!emailCode.trim()}
          >
            Verify Code
          </Button>

          <Button
            variant="primary"
            onPress={() => {
              setPendingVerification(null);
              setEmailCode('');
            }}
          >
            Back
          </Button>
        </View>
      )}
    </KeyboardAwareScrollView>
  );
}