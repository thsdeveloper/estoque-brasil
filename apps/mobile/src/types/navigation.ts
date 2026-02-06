import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};

export type MainStackParamList = {
  Home: undefined;
  Counting: { mode?: 'normal' | 'divergence' } | undefined;
  Divergence: undefined;
  Calculator: undefined;
};

export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
export type HomeScreenProps = NativeStackScreenProps<MainStackParamList, 'Home'>;
export type CountingScreenProps = NativeStackScreenProps<MainStackParamList, 'Counting'>;
export type DivergenceScreenProps = NativeStackScreenProps<MainStackParamList, 'Divergence'>;
export type CalculatorScreenProps = NativeStackScreenProps<MainStackParamList, 'Calculator'>;
