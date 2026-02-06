import React, { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, spacing, borderRadius } from '@/config/theme';

const BUTTONS = [
  ['C', '±', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '-'],
  ['1', '2', '3', '+'],
  ['0', '.', '⌫', '='],
];

export function CalculatorScreen() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const calculate = (a: number, op: string, b: number): number => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return b !== 0 ? a / b : 0;
      default: return b;
    }
  };

  const handlePress = (btn: string) => {
    if (btn >= '0' && btn <= '9' || btn === '.') {
      if (waitingForOperand) {
        setDisplay(btn === '.' ? '0.' : btn);
        setWaitingForOperand(false);
      } else {
        if (btn === '.' && display.includes('.')) return;
        setDisplay(display === '0' && btn !== '.' ? btn : display + btn);
      }
      return;
    }

    const current = parseFloat(display);

    switch (btn) {
      case 'C':
        setDisplay('0');
        setPreviousValue(null);
        setOperator(null);
        setWaitingForOperand(false);
        break;

      case '±':
        setDisplay(String(-current));
        break;

      case '%':
        setDisplay(String(current / 100));
        break;

      case '⌫':
        if (display.length > 1) {
          setDisplay(display.slice(0, -1));
        } else {
          setDisplay('0');
        }
        break;

      case '=':
        if (operator && previousValue !== null) {
          const result = calculate(previousValue, operator, current);
          const expr = `${previousValue} ${operator} ${current} = ${result}`;
          setHistory((prev) => [expr, ...prev].slice(0, 10));
          setDisplay(String(result));
          setPreviousValue(null);
          setOperator(null);
          setWaitingForOperand(true);
        }
        break;

      default:
        // Operators: +, -, ×, ÷
        if (operator && previousValue !== null && !waitingForOperand) {
          const result = calculate(previousValue, operator, current);
          setDisplay(String(result));
          setPreviousValue(result);
        } else {
          setPreviousValue(current);
        }
        setOperator(btn);
        setWaitingForOperand(true);
        break;
    }
  };

  const getButtonStyle = (btn: string) => {
    if (btn === '=' || ['+', '-', '×', '÷'].includes(btn)) {
      return [styles.btn, styles.btnOperator];
    }
    if (btn === 'C' || btn === '±' || btn === '%' || btn === '⌫') {
      return [styles.btn, styles.btnFunction];
    }
    return [styles.btn];
  };

  const getTextStyle = (btn: string) => {
    if (btn === '=' || ['+', '-', '×', '÷'].includes(btn)) {
      return [styles.btnText, styles.btnTextOperator];
    }
    return [styles.btnText];
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* History */}
      {history.length > 0 && (
        <ScrollView style={styles.history} horizontal={false}>
          {history.map((item, i) => (
            <Text key={i} style={styles.historyItem}>
              {item}
            </Text>
          ))}
        </ScrollView>
      )}

      {/* Display */}
      <View style={styles.displayContainer}>
        {operator && previousValue !== null && (
          <Text style={styles.displaySecondary}>
            {previousValue} {operator}
          </Text>
        )}
        <Text style={styles.display} numberOfLines={1} adjustsFontSizeToFit>
          {display}
        </Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        {BUTTONS.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((btn) => (
              <Pressable
                key={btn}
                style={({ pressed }) => [
                  ...getButtonStyle(btn),
                  pressed && styles.btnPressed,
                ]}
                onPress={() => handlePress(btn)}
              >
                <Text style={getTextStyle(btn)}>{btn}</Text>
              </Pressable>
            ))}
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  history: {
    maxHeight: 80,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  historyItem: {
    fontSize: fontSize.xs,
    color: colors.textDisabled,
    textAlign: 'right',
    paddingVertical: 2,
  },
  displayContainer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    minHeight: 100,
  },
  displaySecondary: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  display: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.text,
  },
  buttons: {
    flex: 1,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  btn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnOperator: {
    backgroundColor: colors.primary,
  },
  btnFunction: {
    backgroundColor: colors.surfaceLight,
  },
  btnPressed: {
    opacity: 0.7,
  },
  btnText: {
    fontSize: fontSize.xl,
    color: colors.text,
    fontWeight: '600',
  },
  btnTextOperator: {
    color: colors.text,
    fontWeight: 'bold',
  },
});
