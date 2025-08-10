import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

const Input = ({ style, ...props }) => {
    return (
        <TextInput
            style={[styles.input, style]}
            {...props}
        />
    );
};

const styles = StyleSheet.create({
    input: {
        borderWidth: 1,
        borderColor: '#e1e5e9',
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
        backgroundColor: '#ffffff',
        fontSize: 16,
    },
});

export default Input;
