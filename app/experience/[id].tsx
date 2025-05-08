import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function ExperienceDetailsScreen() {
    const { id } = useLocalSearchParams();

    // This would be replaced with actual data from your backend
    const experience = {
        id,
        name: "Mystery at Moonlight Manor",
        shortDescription: "A thrilling murder mystery set in a historic mansion",
        genre: "Mystery",
        createdBy: "Jane Doe",
        createdDate: "2025-05-01",
        longDescription: "Step into the shoes of a detective in this immersive murder mystery experience. Set in a beautifully preserved Victorian mansion, participants will need to gather clues, interview suspects, and solve puzzles to uncover the truth behind a mysterious death.",
        area: {
            radius: 0.5,
            unit: "miles"
        },
        duration: "2 hours",
        characters: [
            {
                id: "1",
                name: "Detective Inspector",
                shortDescription: "Lead investigator on the case",
            },
            {
                id: "2",
                name: "The Butler",
                shortDescription: "Long-time servant of the mansion",
            },
            {
                id: "3",
                name: "The Heiress",
                shortDescription: "Daughter of the deceased",
            }
        ]
    };

    return (
        <ScrollView style={styles.container}>
            <ThemedView style={styles.header}>
                <ThemedText type="title">{experience.name}</ThemedText>
                <ThemedText style={styles.genre}>{experience.genre}</ThemedText>
            </ThemedView>

            <ThemedView style={styles.content}>
                <View style={styles.metaInfo}>
                    <ThemedText type="defaultSemiBold">Created by {experience.createdBy}</ThemedText>
                    <ThemedText style={styles.date}>{experience.createdDate}</ThemedText>
                </View>

                <View style={styles.section}>
                    <ThemedText>{experience.longDescription}</ThemedText>
                </View>

                <View style={styles.section}>
                    <ThemedText type="subtitle">Location & Duration</ThemedText>
                    <ThemedText>Range: {experience.area.radius} {experience.area.unit}</ThemedText>
                    <ThemedText>Duration: {experience.duration}</ThemedText>
                </View>

                <View style={styles.section}>
                    <ThemedText type="subtitle">Available Characters</ThemedText>
                    {experience.characters.map((character) => (
                        <View key={character.id} style={styles.characterCard}>
                            <ThemedText type="defaultSemiBold">{character.name}</ThemedText>
                            <ThemedText>{character.shortDescription}</ThemedText>
                        </View>
                    ))}
                </View>

                <View style={styles.section}>
                    <ThemedView style={styles.joinButton}>
                        <ThemedText type="defaultSemiBold" style={styles.joinButtonText}>Join Experience</ThemedText>
                    </ThemedView>
                </View>
            </ThemedView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 16,
        paddingTop: 60,
    },
    content: {
        padding: 16,
    },
    genre: {
        marginTop: 8,
        opacity: 0.7,
    },
    metaInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    date: {
        opacity: 0.7,
    },
    section: {
        marginTop: 24,
        gap: 8,
    },
    characterCard: {
        padding: 12,
        borderRadius: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        marginTop: 8,
    },
    joinButton: {
        backgroundColor: '#0a7ea4',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    joinButtonText: {
        color: '#fff',
    }
});
