import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Card = ({ children, style, ...props }) => {
    return (
        <View style={[styles.card, style]} {...props}>
            {children}
        </View>
    );
};

const CardContent = ({ children, style, ...props }) => {
    return (
        <View style={[styles.content, style]} {...props}>
            {children}
        </View>
    );
};

const CardTitle = ({ children, style, ...props }) => {
    return (
        <Text style={[styles.title, style]} {...props}>
            {children}
        </Text>
    );
};

const CardSubtitle = ({ children, style, ...props }) => {
    return (
        <Text style={[styles.subtitle, style]} {...props}>
            {children}
        </Text>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 10,
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#6c757d',
    },
});

export { Card, CardContent, CardTitle, CardSubtitle };
