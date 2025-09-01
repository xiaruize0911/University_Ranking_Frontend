import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const Button = ({ title, onPress, style, textStyle, variant = 'primary', ...props }) => {
    const buttonStyle = variant === 'outline' ? styles.outlineButton : styles.primaryButton;
    const buttonTextStyle = variant === 'outline' ? styles.outlineText : styles.primaryText;

    return (
        <TouchableOpacity
            style={[buttonStyle, style]}
            onPress={onPress}
            {...props}
        >
            <Text style={[buttonTextStyle, textStyle]}>
                {title}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    primaryButton: {
        backgroundColor: '#4a90e2',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    outlineButton: {
        borderWidth: 1,
        borderColor: '#e1e5e9',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        marginBottom: 10,
    },
    primaryText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    outlineText: {
        color: '#333',
        fontSize: 16,
        fontWeight: '400',
    },
});

export default Button;
