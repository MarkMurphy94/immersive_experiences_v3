import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { FIREBASE_AUTH, FIRESTORE } from '@/FirebaseConfig';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

type Character = {
    id: string;
    name: string;
    description: string;
    hostUserId?: string;
};

type PlayerProgress = {
    id: string;
    currentEncounter: string;
    completedEncounters: string[];
    timestamp: Date;
};

type Encounter = {
    id: string;
    name: string;
    summary: string;
    location: any;
    type: string;
    characters: Character[];
};

type HostInstructions = {
    id: string;
    characterId: string;
    encounterId: string;
    instructions: string;
    timestamp: Date;
};

export default function HostViewScreen() {
    const { experienceId, characterId } = useLocalSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [experience, setExperience] = useState<any>(null);
    const [character, setCharacter] = useState<Character | null>(null);
    const [hostInstructions, setHostInstructions] = useState<HostInstructions | null>(null);
    const [playerProgress, setPlayerProgress] = useState<PlayerProgress | null>(null);
    const [encounters, setEncounters] = useState<Encounter[]>([]);
    const [otherCharacters, setOtherCharacters] = useState<Character[]>([]);

    useEffect(() => {
        // Fetch the experience data
        async function fetchExperienceData() {
            try {
                if (!experienceId) return;

                const experienceRef = doc(FIRESTORE, 'ExperienceCalendar', experienceId as string);
                const experienceSnap = await getDoc(experienceRef);

                if (experienceSnap.exists()) {
                    const experienceData = experienceSnap.data();
                    setExperience(experienceData);

                    // Find the current character
                    const characters = experienceData.characters || [];
                    const currentCharacter = characters.find((c: Character) => c.id === characterId);
                    setCharacter(currentCharacter || null);

                    // Set other characters
                    const others = characters.filter((c: Character) => c.id !== characterId);
                    setOtherCharacters(others);

                    // Fetch encounters for the experience
                    if (experienceData.experienceId) {
                        const encountersRef = collection(FIRESTORE, 'ImmersiveExperiences');
                        const q = query(encountersRef, where('experienceId', '==', experienceData.experienceId));

                        const unsubscribe = onSnapshot(q, (querySnapshot) => {
                            const encountersList: Encounter[] = [];
                            querySnapshot.forEach((doc) => {
                                encountersList.push({ id: doc.id, ...doc.data() } as Encounter);
                            });
                            setEncounters(encountersList);
                        });

                        return () => unsubscribe();
                    }
                }
            } catch (error) {
                console.error('Error fetching experience data:', error);
            } finally {
                setLoading(false);
            }
        }

        // Listen for host instructions
        function listenForHostInstructions() {
            if (!experienceId || !characterId) return;

            const instructionsRef = collection(FIRESTORE, 'ImmersiveExperiences');
            const q = query(
                instructionsRef,
                where('experienceId', '==', experienceId),
                where('characterId', '==', characterId)
            );

            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                if (!querySnapshot.empty) {
                    // Get the most recent instruction
                    const instructions = querySnapshot.docs
                        .map(doc => {
                            const data = doc.data();
                            return {
                                id: doc.id,
                                characterId: data.characterId,
                                encounterId: data.encounterId,
                                instructions: data.instructions,
                                timestamp: data.timestamp
                            } as HostInstructions;
                        })
                        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

                    setHostInstructions(instructions[0]);
                }
            });

            return () => unsubscribe();
        }        // Listen for player progress
        function listenForPlayerProgress() {
            if (!experienceId) return;

            const progressRef = collection(FIRESTORE, 'ExperienceCalendar');
            const q = query(progressRef, where('experienceId', '==', experienceId));

            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                if (!querySnapshot.empty) {
                    // Get the most recent progress update
                    const progress = querySnapshot.docs
                        .map(doc => {
                            const data = doc.data();
                            return {
                                id: doc.id,
                                currentEncounter: data.currentEncounter,
                                completedEncounters: data.completedEncounters,
                                timestamp: data.timestamp
                            } as PlayerProgress;
                        })
                        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

                    setPlayerProgress(progress[0]);
                }
            });

            return () => unsubscribe();
        }

        fetchExperienceData();
        const instructionsUnsubscribe = listenForHostInstructions();
        const progressUnsubscribe = listenForPlayerProgress();

        return () => {
            if (instructionsUnsubscribe) instructionsUnsubscribe();
            if (progressUnsubscribe) progressUnsubscribe();
        };
    }, [experienceId, characterId]);

    // Find the current encounter based on player progress
    const getCurrentEncounter = () => {
        if (!playerProgress || !encounters.length) return null;

        return encounters.find(e => e.id === playerProgress.currentEncounter) || null;
    };

    const currentEncounter = getCurrentEncounter();

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0a7ea4" />
            </View>
        );
    }

    if (!experience || !character) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText>Experience or character not found</ThemedText>
                <TouchableOpacity style={styles.button} onPress={() => router.back()}>
                    <ThemedText style={styles.buttonText}>Go Back</ThemedText>
                </TouchableOpacity>
            </ThemedView>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <ThemedView style={styles.header}>
                <ThemedText type="title">{experience.title}</ThemedText>
                <ThemedText style={styles.subtitle}>Host View - {character.name}</ThemedText>
            </ThemedView>

            <ThemedView style={styles.content}>
                {/* Current Instructions */}
                <View style={styles.section}>
                    <ThemedText type="subtitle">Your Current Task</ThemedText>
                    <ThemedView style={styles.instructionsCard}>
                        {hostInstructions ? (
                            <ThemedText>{hostInstructions.instructions}</ThemedText>
                        ) : (
                            <ThemedText style={styles.placeholderText}>
                                No instructions available yet. Wait for the player to start the experience.
                            </ThemedText>
                        )}
                    </ThemedView>
                </View>

                {/* Player Progress */}
                <View style={styles.section}>
                    <ThemedText type="subtitle">Player Progress</ThemedText>
                    <ThemedView style={styles.progressCard}>
                        {playerProgress ? (
                            <>
                                <ThemedText type="defaultSemiBold">
                                    Current Encounter: {currentEncounter?.name || 'Unknown'}
                                </ThemedText>
                                <ThemedText style={styles.progressDetail}>
                                    Completed Encounters: {playerProgress.completedEncounters.length}
                                </ThemedText>
                                <View style={styles.progressBar}>
                                    <View
                                        style={[
                                            styles.progressIndicator,
                                            {
                                                width: `${playerProgress.completedEncounters.length / encounters.length * 100}%`
                                            }
                                        ]}
                                    />
                                </View>
                            </>
                        ) : (
                            <ThemedText style={styles.placeholderText}>
                                The player has not started yet.
                            </ThemedText>
                        )}
                    </ThemedView>
                </View>

                {/* Experience Overview */}
                <View style={styles.section}>
                    <ThemedText type="subtitle">Experience Overview</ThemedText>

                    {/* Encounters */}
                    {encounters.length > 0 ? (
                        <View style={styles.encountersList}>
                            <ThemedText type="defaultSemiBold">Encounters:</ThemedText>
                            {encounters.map((encounter, index) => (
                                <ThemedView key={encounter.id} style={styles.encounterItem}>
                                    <View style={styles.encounterHeader}>
                                        <ThemedText type="defaultSemiBold">
                                            {index + 1}. {encounter.name}
                                        </ThemedText>
                                        {playerProgress?.currentEncounter === encounter.id && (
                                            <View style={styles.activeBadge}>
                                                <ThemedText style={styles.activeBadgeText}>Current</ThemedText>
                                            </View>
                                        )}
                                        {playerProgress?.completedEncounters.includes(encounter.id) && (
                                            <View style={styles.completedBadge}>
                                                <ThemedText style={styles.completedBadgeText}>Completed</ThemedText>
                                            </View>
                                        )}
                                    </View>
                                    <ThemedText>{encounter.summary}</ThemedText>
                                </ThemedView>
                            ))}
                        </View>
                    ) : (
                        <ThemedText>No encounters available for this experience.</ThemedText>
                    )}

                    {/* Other Characters */}
                    <View style={styles.charactersSection}>
                        <ThemedText type="defaultSemiBold">Other Characters:</ThemedText>
                        {otherCharacters.length > 0 ? (
                            <FlatList
                                data={otherCharacters}
                                renderItem={({ item }) => (
                                    <ThemedView style={styles.characterItem}>
                                        <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
                                        <ThemedText>{item.description}</ThemedText>
                                        {item.hostUserId && (
                                            <ThemedText style={styles.hostText}>
                                                {item.hostUserId === FIREBASE_AUTH.currentUser?.uid
                                                    ? '(Played by you)'
                                                    : '(Character claimed)'}
                                            </ThemedText>
                                        )}
                                    </ThemedView>
                                )}
                                keyExtractor={(item) => item.id}
                                scrollEnabled={false}
                            />
                        ) : (
                            <ThemedText>No other characters in this experience.</ThemedText>
                        )}
                    </View>
                </View>

                <TouchableOpacity style={styles.button} onPress={() => router.back()}>
                    <ThemedText style={styles.buttonText}>Back to Experience</ThemedText>
                </TouchableOpacity>
            </ThemedView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 16,
        paddingTop: 60,
    },
    subtitle: {
        marginTop: 8,
        opacity: 0.7,
    },
    content: {
        padding: 16,
    },
    section: {
        marginTop: 24,
        gap: 12,
    },
    instructionsCard: {
        padding: 16,
        borderRadius: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderLeftWidth: 4,
        borderLeftColor: '#0a7ea4',
    },
    progressCard: {
        padding: 16,
        borderRadius: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    progressDetail: {
        marginTop: 8,
        opacity: 0.7,
    },
    progressBar: {
        height: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: 4,
        marginTop: 12,
        overflow: 'hidden',
    },
    progressIndicator: {
        height: '100%',
        backgroundColor: '#0a7ea4',
    },
    encountersList: {
        gap: 8,
        marginTop: 8,
    },
    encounterItem: {
        padding: 12,
        borderRadius: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        marginTop: 8,
    },
    encounterHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    activeBadge: {
        backgroundColor: '#0a7ea4',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    activeBadgeText: {
        color: 'white',
        fontSize: 12,
    },
    completedBadge: {
        backgroundColor: '#28a745',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    completedBadgeText: {
        color: 'white',
        fontSize: 12,
    },
    charactersSection: {
        marginTop: 16,
        gap: 8,
    },
    characterItem: {
        padding: 12,
        borderRadius: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        marginTop: 8,
    },
    hostText: {
        fontSize: 12,
        fontStyle: 'italic',
        marginTop: 4,
        color: '#0a7ea4',
    },
    button: {
        backgroundColor: '#0a7ea4',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 24,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    placeholderText: {
        fontStyle: 'italic',
        opacity: 0.7,
    },
});
