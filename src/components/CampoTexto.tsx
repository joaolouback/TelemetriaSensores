/** Campo de formulário com rótulo, ícone, mensagem de erro e opção de mostrar/ocultar senha */
import React, { forwardRef, useState } from 'react';
import { View, Text, TextInput, TextInputProps, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HOME_COLORS } from '../constants';

interface CampoTextoProps extends TextInputProps {
  rotulo: string;
  icone: keyof typeof Ionicons.glyphMap;
  erro?: string | null;
  senha?: boolean;
}

export const CampoTexto = forwardRef<TextInput, CampoTextoProps>(function CampoTexto(
  { rotulo, icone, erro, senha = false, style, ...inputProps },
  ref
) {
  const [focado, setFocado] = useState(false);
  const [visivel, setVisivel] = useState(false);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <View
        style={[
          styles.caixa,
          focado && styles.caixaFocada,
          !!erro && styles.caixaErro,
        ]}
      >
        <Ionicons
          name={icone}
          size={20}
          color={erro ? '#EF4444' : focado ? HOME_COLORS.discoverBlue : HOME_COLORS.textMuted}
        />
        <TextInput
          ref={ref}
          autoCorrect={false}
          {...inputProps}
          style={[styles.input, style]}
          placeholderTextColor={HOME_COLORS.textMuted}
          secureTextEntry={senha && !visivel}
          onFocus={(e) => {
            setFocado(true);
            inputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocado(false);
            inputProps.onBlur?.(e);
          }}
        />
        {senha && (
          <TouchableOpacity
            onPress={() => setVisivel((v) => !v)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel={visivel ? 'Ocultar senha' : 'Mostrar senha'}
          >
            <Ionicons
              name={visivel ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={HOME_COLORS.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>
      {!!erro && <Text style={styles.erro}>{erro}</Text>}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  rotulo: {
    fontSize: 13,
    fontWeight: '700',
    color: HOME_COLORS.textPrimary,
    marginBottom: 6,
  },
  caixa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 52,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: HOME_COLORS.cardBorder,
    backgroundColor: HOME_COLORS.background,
  },
  caixaFocada: {
    borderColor: HOME_COLORS.discoverBlue,
    backgroundColor: HOME_COLORS.card,
  },
  caixaErro: {
    borderColor: '#EF4444',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: HOME_COLORS.textPrimary,
    paddingVertical: 0,
  },
  erro: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 5,
    fontWeight: '500',
  },
});
