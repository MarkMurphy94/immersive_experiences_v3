import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { FIRESTORE } from '@/FirebaseConfig';
import { useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

type Experience = {
    id: string;
    title: string;
    shortDescription: string;
    longDescription: string;
    createdBy: string;
    createdAt: number;
    characters: {
        id: string;
        name: string;
        description: string;
    }[];
    encounters: {
        id: string;
        name: string;
        summary: string;
        location: string | null;
    }[];
};

export default function ExperienceDetailsScreen() {
    const { id } = useLocalSearchParams();
    const [experience, setExperience] = useState<Experience | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchExperience() {
            try {
                const experienceRef = doc(FIRESTORE, 'ImmersiveExperiences', id as string);
                const experienceSnap = await getDoc(experienceRef);

                if (experienceSnap.exists()) {
                    setExperience({ id: experienceSnap.id, ...experienceSnap.data() } as Experience);
                }
            } catch (error) {
                console.error('Error fetching experience:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchExperience();
    }, [id]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0a7ea4" />
            </View>
        );
    }

    if (!experience) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText>Experience not found</ThemedText>
            </ThemedView>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <ThemedView style={styles.header}>
                <ThemedText type="title">{experience.title}</ThemedText>
                <ThemedText style={styles.description}>{experience.shortDescription}</ThemedText>
            </ThemedView>

            <ThemedView style={styles.content}>
                <View style={styles.section}>
                    <ThemedText>{experience.longDescription}</ThemedText>
                </View>

                <View style={styles.section}>
                    <ThemedText type="subtitle">Characters</ThemedText>
                    {experience.characters.map((character) => (
                        <View key={character.id} style={styles.characterCard}>
                            <ThemedText type="defaultSemiBold">{character.name}</ThemedText>
                            <ThemedText>{character.description}</ThemedText>
                        </View>
                    ))}
                </View>

                {/* <View style={styles.section}>
                    <ThemedText type="subtitle">Encounters</ThemedText>
                    {experience.encounters.map((encounter) => (
                        <View key={encounter.id} style={styles.encounterCard}>
                            <ThemedText type="defaultSemiBold">{encounter.name}</ThemedText>
                            <ThemedText>{encounter.summary}</ThemedText>
                            {encounter.location && (
                                <ThemedText style={styles.location}>📍 {encounter.location}</ThemedText>
                            )}
                        </View>
                    ))}
                </View> */}
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
    description: {
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
    encounterCard: {
        padding: 12,
        borderRadius: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        marginTop: 8,
        gap: 4,
    },
    location: {
        fontSize: 14,
        opacity: 0.7,
        marginTop: 4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
