import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

type ExperienceCardProps = {
    title: string;
    description: string;
    duration: string;
    distance: string;
    status: string;
};

export function ExperienceCard({ title, description, duration, distance, status }: ExperienceCardProps) {
    return (
        <Pressable
            style={styles.container}
            onPress={() => router.push('/experience/details')}
        >
            <ThemedView style={styles.card}>
                <View style={styles.content}>
                    <ThemedText type="defaultSemiBold" style={styles.title}>{title}</ThemedText>
                    <ThemedText style={styles.description}>{description}</ThemedText>
                    <View style={styles.details}>
                        <ThemedText style={styles.info}>⏱ {duration}</ThemedText>
                        <ThemedText style={styles.info}>📍 {distance}</ThemedText>
                    </View>
                    <ThemedText style={[styles.status, styles.statusText]}>{status}</ThemedText>
                </View>
            </ThemedView>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 280,
        marginRight: 16,
    },
    card: {
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    content: {
        gap: 8,
    },
    title: {
        fontSize: 18,
    },
    description: {
        fontSize: 14,
        opacity: 0.8,
    },
    details: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 4,
    },
    info: {
        fontSize: 12,
        opacity: 0.6,
    },
    status: {
        marginTop: 8,
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    statusText: {
        color: '#2E7D32',
        fontSize: 12,
    },
});
