// ─── Sanatan Seva Platform – Custom Alert Context ────────────────────────────
// Provides a spiritual-themed custom alert dialog throughout the app

import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Radius, Shadow, Spacing, Typography } from '../theme/colors';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface AlertOptions {
  type?: AlertType;
  title: string;
  message?: string;
  icon?: string;
  buttons?: AlertButton[];
  dismissable?: boolean;
}

interface AlertContextValue {
  showAlert: (options: AlertOptions) => void;
  hideAlert: () => void;
  /** Convenience: show a success alert */
  success: (title: string, message?: string) => void;
  /** Convenience: show an error alert */
  error: (title: string, message?: string) => void;
  /** Convenience: show a confirm dialog */
  confirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AlertContext = createContext<AlertContextValue | null>(null);

// ─── Config ───────────────────────────────────────────────────────────────────

const ALERT_CONFIG: Record<
  AlertType,
  { icon: string; gradient: [string, string, string]; accent: string }
> = {
  success: {
    icon: '🙏',
    gradient: ['#1B5E20', '#2E7D32', '#388E3C'],
    accent: Colors.success,
  },
  error: {
    icon: '⚠️',
    gradient: [Colors.crimsonDark, Colors.crimson, Colors.crimsonMid],
    accent: Colors.crimson,
  },
  warning: {
    icon: '🔔',
    gradient: ['#E65100', '#F57F17', '#FF8F00'],
    accent: Colors.amber,
  },
  info: {
    icon: 'ℹ️',
    gradient: ['#01579B', '#0277BD', '#0288D1'],
    accent: Colors.info,
  },
  confirm: {
    icon: '🤔',
    gradient: [Colors.saffronDark, Colors.saffron, Colors.saffronLight],
    accent: Colors.saffron,
  },
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<AlertOptions>({
    title: '',
    type: 'info',
  });

  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const showAlert = useCallback((opts: AlertOptions) => {
    setOptions(opts);
    setVisible(true);

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  const hideAlert = useCallback(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.85,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
    });
  }, [scaleAnim, opacityAnim]);

  const success = useCallback(
    (title: string, message?: string) => {
      showAlert({ type: 'success', title, message, icon: '🙏' });
    },
    [showAlert]
  );

  const error = useCallback(
    (title: string, message?: string) => {
      showAlert({ type: 'error', title, message, icon: '⚠️' });
    },
    [showAlert]
  );

  const confirm = useCallback(
    (
      title: string,
      message: string,
      onConfirm: () => void,
      onCancel?: () => void
    ) => {
      showAlert({
        type: 'confirm',
        title,
        message,
        dismissable: false,
        buttons: [
          {
            text: 'रद्द करें',
            style: 'cancel',
            onPress: onCancel,
          },
          {
            text: 'हाँ, आगे बढ़ें',
            style: 'default',
            onPress: onConfirm,
          },
        ],
      });
    },
    [showAlert]
  );

  const config = ALERT_CONFIG[options.type ?? 'info'];
  const buttons: AlertButton[] =
    options.buttons ?? [{ text: 'ठीक है', style: 'default' }];

  return (
    <AlertContext.Provider
      value={{ showAlert, hideAlert, success, error, confirm }}
    >
      {children}

      <Modal
        visible={visible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={() => {
          if (options.dismissable !== false) hideAlert();
        }}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => {
            if (options.dismissable !== false) hideAlert();
          }}
        >
          <Animated.View
            style={[
              styles.container,
              {
                transform: [{ scale: scaleAnim }],
                opacity: opacityAnim,
              },
            ]}
          >
            <TouchableOpacity activeOpacity={1} onPress={() => {}}>
              {/* Header */}
              <LinearGradient
                colors={config.gradient}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {/* Decorative Om */}
                <Text style={styles.headerBgOm}>ॐ</Text>
                <Text style={styles.headerIcon}>
                  {options.icon ?? config.icon}
                </Text>
              </LinearGradient>

              {/* Content */}
              <View style={styles.content}>
                <Text style={styles.title}>{options.title}</Text>
                {options.message ? (
                  <Text style={styles.message}>{options.message}</Text>
                ) : null}
              </View>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Buttons */}
              <View
                style={[
                  styles.buttonRow,
                  buttons.length === 1 && styles.buttonRowSingle,
                ]}
              >
                {buttons.map((btn, i) => {
                  const isCancel = btn.style === 'cancel';
                  const isDestructive = btn.style === 'destructive';

                  return (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.button,
                        isCancel && styles.buttonCancel,
                        isDestructive && styles.buttonDestructive,
                        !isCancel && !isDestructive && { borderColor: config.accent },
                      ]}
                      activeOpacity={0.8}
                      onPress={() => {
                        hideAlert();
                        btn.onPress?.();
                      }}
                    >
                      {!isCancel ? (
                        <LinearGradient
                          colors={
                            isDestructive
                              ? [Colors.crimsonDark, Colors.crimson]
                              : config.gradient
                          }
                          style={styles.buttonGradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                        >
                          <Text style={styles.buttonText}>{btn.text}</Text>
                        </LinearGradient>
                      ) : (
                        <View style={styles.buttonGradient}>
                          <Text style={styles.buttonCancelText}>{btn.text}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </AlertContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useAlert = (): AlertContextValue => {
  const ctx = useContext(AlertContext);
  if (!ctx) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return ctx;
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(62, 39, 35, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  container: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    width: '100%',
    maxWidth: 340,
    overflow: 'hidden',
    ...Shadow.dark,
  },
  header: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  headerBgOm: {
    position: 'absolute',
    fontSize: 80,
    color: 'rgba(255,255,255,0.08)',
    fontWeight: '900',
  },
  headerIcon: {
    fontSize: 48,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: Typography.lg,
    fontWeight: '900',
    color: Colors.darkText,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  message: {
    fontSize: Typography.base,
    color: Colors.brownMid,
    textAlign: 'center',
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginHorizontal: Spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: 10,
  },
  buttonRowSingle: {
    justifyContent: 'center',
  },
  button: {
    flex: 1,
    borderRadius: Radius.full,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  buttonCancel: {
    borderColor: Colors.divider,
    borderWidth: 1.5,
  },
  buttonDestructive: {
    borderColor: Colors.crimson,
  },
  buttonGradient: {
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: Colors.white,
    fontSize: Typography.base,
    fontWeight: '700',
  },
  buttonCancelText: {
    color: Colors.brownMid,
    fontSize: Typography.base,
    fontWeight: '600',
  },
});
