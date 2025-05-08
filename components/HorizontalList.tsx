import { ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

type HorizontalListProps = {
    children: ReactNode;
};

export function HorizontalList({ children }: HorizontalListProps) {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.container}>
            {children}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
    },
});
