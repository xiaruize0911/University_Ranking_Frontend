import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';

const Sheet = React.forwardRef(({
    children,
    title,
    snapPoints,
    enablePanDownToClose = true,
    style,
    ...props
}, ref) => {
    return (
        <BottomSheet
            ref={ref}
            index={-1}
            snapPoints={snapPoints}
            enablePanDownToClose={enablePanDownToClose}
            {...props}
        >
            <BottomSheetScrollView style={[styles.container, style]}>
                {title && <Text style={styles.title}>{title}</Text>}
                {children}
            </BottomSheetScrollView>
        </BottomSheet>
    );
});

const SheetItem = ({ children, onPress, style, ...props }) => {
    return (
        <TouchableOpacity onPress={onPress} {...props}>
            <Text style={[styles.item, style]}>{children}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
        color: '#333',
    },
    item: {
        padding: 16,
        fontSize: 16,
        color: '#333',
        borderBottomWidth: 1,
        borderBottomColor: '#e1e5e9',
    },
});

export { Sheet, SheetItem };
