import { useSignUp } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  cancelAnimation,
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CodeVerification } from "@/components/auth";
import { hapticButtonPress } from "@/lib/haptics";
import { shadowPrimary } from "@/lib/styles/shadows";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const icons = {
  action: "arrow-forward",
  apple: "logo-apple",
  back: Platform.OS === "android" ? "arrow-back" : "chevron-back",
  email: "mail",
  error: "warning",
  eye: "eye",
  eyeOff: "eye-off",
  heart: "heart",
  lock: "lock-closed",
} as const satisfies Record<string, keyof typeof Ionicons.glyphMap>;

function FloatingHeart({
  size,
  top,
  left,
  delay,
  opacity,
}: {
  size: number;
  top: number;
  left: number;
  delay: number;
  opacity: number;
}) {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 2000 }),
        withTiming(10, { duration: 2000 }),
      ),
      -1,
      true,
    );

    return () => {
      cancelAnimation(translateY);
    };
  }, [translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      entering={FadeIn.delay(delay).duration(1000)}
      style={{
        position: "absolute",
        top,
        left,
      }}
    >
      <Animated.View style={[{ opacity }, animatedStyle]}>
        <Ionicons name={icons.heart} size={size} color="#FF6B6B" />
      </Animated.View>
    </Animated.View>
  );
}

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleSignUp = async () => {
    if (!isLoaded) return;

    hapticButtonPress();
    setLoading(true);
    setError("");

    try {
      await signUp.create({
        emailAddress: email,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (signUpError: any) {
      setError(signUpError.errors?.[0]?.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (code: string) => {
    if (!isLoaded) return;

    const result = await signUp.attemptEmailAddressVerification({ code });

    if (result.status === "complete") {
      await setActive({ session: result.createdSessionId });
    } else {
      throw new Error(`Verification incomplete: ${result.status}`);
    }
  };

  if (pendingVerification) {
    return (
      <CodeVerification
        email={email}
        title="Verify your email"
        icon="mail-outline"
        onVerify={handleVerify}
        onBack={() => setPendingVerification(false)}
        buttonText="Verify Email"
        backButtonText="Back to sign up"
      />
    );
  }

  const isValid = email.trim().length > 0 && password.length >= 6;

  const getPasswordStrength = () => {
    if (password.length === 0) return { level: 0, label: "", color: "#E5E5E5" };
    if (password.length < 6) {
      return { level: 1, label: "Too short", color: "#FF6B6B" };
    }
    if (password.length < 8) {
      return { level: 2, label: "Weak", color: "#FFB347" };
    }
    if (password.length < 12) {
      return { level: 3, label: "Good", color: "#4CD964" };
    }

    return { level: 4, label: "Strong", color: "#00C853" };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#FFF5F5", "#FFE8E8", "#FFF0F0", "#FFFFFF"]}
        locations={[0, 0.3, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />

      <FloatingHeart size={22} top={120} left={320} delay={0} opacity={0.15} />
      <FloatingHeart size={28} top={520} left={30} delay={300} opacity={0.1} />
      <FloatingHeart
        size={16}
        top={580}
        left={330}
        delay={500}
        opacity={0.08}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={process.env.EXPO_OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 24,
            paddingHorizontal: 24,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.delay(50).duration(400)}>
            <Pressable
              onPress={() => {
                hapticButtonPress();
                router.back();
              }}
              style={({ pressed }) => [
                styles.backButton,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Ionicons name={icons.back} size={20} color="#1A1A1A" />
            </Pressable>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(100).duration(700).springify()}
            style={styles.logoSection}
          >
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={["#FF6B6B", "#FF8E8E"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoGradient}
              >
                <Ionicons name={icons.heart} size={36} color="#FFFFFF" />
              </LinearGradient>
            </View>

            <Text style={styles.logoText}>Join Heartly</Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(200).duration(700).springify()}
            style={styles.welcomeSection}
          >
            <Text style={styles.welcomeTitle}>Create account</Text>
            <Text style={styles.welcomeSubtitle}>
              Start your journey to find meaningful connections
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(300).duration(700).springify()}
            style={styles.inputSection}
          >
            <View
              style={[
                styles.inputContainer,
                emailFocused && styles.inputContainerFocused,
              ]}
            >
              <View style={styles.inputIconContainer}>
                <Ionicons
                  name={icons.email}
                  size={20}
                  color={emailFocused ? "#FF6B6B" : "#999999"}
                />
              </View>
              <TextInput
                placeholder="Email address"
                value={email}
                onChangeText={setEmail}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                style={styles.input}
                placeholderTextColor="#AAAAAA"
              />
            </View>

            <View>
              <View
                style={[
                  styles.inputContainer,
                  passwordFocused && styles.inputContainerFocused,
                ]}
              >
                <View style={styles.inputIconContainer}>
                  <Ionicons
                    name={icons.lock}
                    size={20}
                    color={passwordFocused ? "#FF6B6B" : "#999999"}
                  />
                </View>
                <TextInput
                  placeholder="Create password"
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  secureTextEntry={!showPassword}
                  autoComplete="new-password"
                  style={styles.input}
                  placeholderTextColor="#AAAAAA"
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showPassword ? icons.eyeOff : icons.eye}
                    size={20}
                    color="#999999"
                  />
                </Pressable>
              </View>

              {password.length > 0 && (
                <Animated.View
                  entering={FadeInDown.duration(200)}
                  style={styles.strengthContainer}
                >
                  <View style={styles.strengthBars}>
                    {[1, 2, 3, 4].map((level) => (
                      <View
                        key={level}
                        style={[
                          styles.strengthBar,
                          {
                            backgroundColor:
                              level <= passwordStrength.level
                                ? passwordStrength.color
                                : "#E5E5E5",
                          },
                        ]}
                      />
                    ))}
                  </View>
                  <Text
                    style={[
                      styles.strengthLabel,
                      { color: passwordStrength.color },
                    ]}
                  >
                    {passwordStrength.label}
                  </Text>
                </Animated.View>
              )}
            </View>

            <Text style={styles.termsText}>
              By signing up, you agree to our{" "}
              <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>

            {error ? (
              <Animated.View
                entering={FadeInDown.duration(300)}
                style={styles.errorContainer}
              >
                <Ionicons name={icons.error} size={16} color="#DC2626" />
                <Text selectable style={styles.errorText}>
                  {error}
                </Text>
              </Animated.View>
            ) : null}
          </Animated.View>

          <View style={{ flex: 1, minHeight: 32 }} />

          <Animated.View
            entering={FadeInUp.delay(400).duration(700).springify()}
            style={styles.bottomSection}
          >
            <AnimatedPressable
              onPress={handleSignUp}
              disabled={loading || !isValid}
              style={({ pressed }) => [
                styles.primaryButton,
                {
                  opacity: loading || !isValid ? 0.6 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
            >
              <LinearGradient
                colors={["#FF6B6B", "#FF5252"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                {loading ? (
                  <Text style={styles.buttonText}>Creating account...</Text>
                ) : (
                  <>
                    <Text style={styles.buttonText}>Create Account</Text>
                    <Ionicons name={icons.action} size={18} color="#FFFFFF" />
                  </>
                )}
              </LinearGradient>
            </AnimatedPressable>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or sign up with</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtons}>
              <Pressable style={styles.socialButton}>
                <Ionicons name={icons.apple} size={22} color="#1A1A1A" />
              </Pressable>
              <Pressable style={styles.socialButton}>
                <Text style={styles.googleText}>G</Text>
              </Pressable>
            </View>

            <View style={styles.signInContainer}>
              <Text style={styles.signInText}>Already have an account? </Text>
              <Link href="/(auth)/sign-in" asChild>
                <TouchableOpacity onPress={hapticButtonPress}>
                  <Text style={styles.signInLink}> Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  logoSection: {
    alignItems: "center",
    gap: 12,
    marginBottom: 32,
  },
  logoContainer: {
    ...shadowPrimary,
  },
  logoGradient: {
    width: 76,
    height: 76,
    borderRadius: 24,
    borderCurve: "continuous",
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1A1A1A",
    letterSpacing: -0.5,
  },
  welcomeSection: {
    gap: 8,
    marginBottom: 28,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1A1A1A",
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#666666",
    lineHeight: 22,
  },
  inputSection: {
    gap: 16,
  },
  inputContainer: {
    height: 56,
    borderRadius: 16,
    borderCurve: "continuous",
    backgroundColor: "#F8F8F8",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  inputContainerFocused: {
    borderColor: "#FF6B6B",
    backgroundColor: "#FFFFFF",
  },
  inputIconContainer: {
    width: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1A1A1A",
    paddingRight: 16,
  },
  eyeButton: {
    width: 48,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  strengthContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    paddingHorizontal: 4,
  },
  strengthBars: {
    flexDirection: "row",
    gap: 4,
  },
  strengthBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  termsText: {
    fontSize: 13,
    color: "#888888",
    lineHeight: 18,
    textAlign: "center",
    paddingHorizontal: 8,
  },
  termsLink: {
    color: "#FF6B6B",
    fontWeight: "600",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(220,38,38,0.08)",
    padding: 14,
    borderRadius: 12,
  },
  errorText: {
    flex: 1,
    color: "#DC2626",
    fontSize: 14,
    lineHeight: 20,
  },
  bottomSection: {
    gap: 24,
  },
  primaryButton: {
    borderRadius: 28,
    borderCurve: "continuous",
    overflow: "hidden",
    ...shadowPrimary,
  },
  buttonGradient: {
    height: 56,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E5E5",
  },
  dividerText: {
    fontSize: 13,
    color: "#999999",
    fontWeight: "500",
  },
  socialButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  googleText: {
    fontSize: 22,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  signInContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingBottom: 8,
  },
  signInText: {
    fontSize: 15,
    color: "#666666",
  },
  signInLink: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FF6B6B",
  },
});
