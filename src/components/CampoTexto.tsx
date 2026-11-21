/** Campo de formulário com rótulo, ícone, mensagem de erro e opção de mostrar/ocultar senha */
import React, { forwardRef, useState } from 'react';
import { View, Text, TextInput, TextInputProps, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTema, useEstilos } from '../contexts/TemaContext';
import type { Tema } from '../constants/temas';

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
  const styles = useEstilos(criarEstilos);
  const { cores } = useTema();
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
          color={erro ? '#EF4444' : focado ? cores.discoverBlue : cores.textMuted}
        />
        <TextInput
          ref={ref}
          autoCorrect={false}
          {...inputProps}
          style={[styles.input, style]}
          placeholderTextColor={cores.textMuted}
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
              color={cores.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>
      {!!erro && <Text style={styles.erro}>{erro}</Text>}
    </View>
  );
});

const criarEstilos = (cores: Tema) => StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  rotulo: {
    fontSize: 13,
    fontWeight: '700',
    color: cores.textPrimary,
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
    borderColor: cores.cardBorder,
    backgroundColor: cores.background,
  },
  caixaFocada: {
    borderColor: cores.discoverBlue,
    backgroundColor: cores.card,
  },
  caixaErro: {
    borderColor: '#EF4444',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: cores.textPrimary,
    paddingVertical: 0,
  },
  erro: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 5,
    fontWeight: '500',
  },
});
