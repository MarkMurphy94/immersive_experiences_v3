import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { FIREBASE_AUTH, FIRESTORE } from '@/FirebaseConfig';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams } from 'expo-router';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';


// TODO: all types to common file
// TODO: Eventually separate scheduling user from player user

type ScheduledExperience = {
    experienceId: string;
    title: string;
    startDateTime: Date;
    playerUser: string;
    status: string;
    isActive: boolean;
    // encounters: Encounter[];
    shortDescription?: string;
    longDescription?: string;
    createdBy?: string;
    characters?: Character[];
};

type Encounter = {
    id: string;
    name: string;
    summary: string;
    location: string | null;
};

type Character = {
    id: string;
    name: string;
    description: string;
    hostUserId?: string; // user that will play this character
    // waitlistUsers: string[]; later...
};

type ExperienceDisplayData = {
    id: string;
    title: string;
    shortDescription: string;
    longDescription: string;
    createdBy: string;
    characters: Character[];
    // Fields specific to scheduled experiences
    startDateTime?: Date;
    playerUser?: string;
    status?: string;
    isActive?: boolean;
    experienceId?: string; // Reference to the original experience if this is a scheduled instance
    isScheduled?: boolean; // Flag to indicate if this is a scheduled experience
};

export default function ExperienceDetailsScreen() {
    const { id, source } = useLocalSearchParams();
    const [experience, setExperience] = useState<ExperienceDisplayData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [availableCharacters, setAvailableCharacters] = useState<Character[]>([]);
    const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

    useEffect(() => {
        async function fetchExperience() {
            try {
                // Determine collection based on source param (default to ImmersiveExperiences)
                const isScheduled = source === 'calendar';
                const collection = isScheduled ? 'ExperienceCalendar' : 'ImmersiveExperiences';

                // Fetch the requested experience
                const experienceRef = doc(FIRESTORE, collection, id as string);
                const experienceSnap = await getDoc(experienceRef);

                if (experienceSnap.exists()) {
                    const data = experienceSnap.data();

                    if (isScheduled && data.experienceId) {
                        // For scheduled experiences, fetch the original experience details
                        const originalRef = doc(FIRESTORE, 'ImmersiveExperiences', data.experienceId);
                        const originalSnap = await getDoc(originalRef);

                        if (originalSnap.exists()) {
                            const originalData = originalSnap.data();

                            // Combine data from both documents
                            const combinedCharacters = originalData.characters || [];
                            setAvailableCharacters(combinedCharacters);
                            setExperience({
                                id: experienceSnap.id,
                                title: data.title || originalData.title,
                                shortDescription: originalData.shortDescription || '',
                                longDescription: originalData.longDescription || '',
                                createdBy: originalData.createdBy || '',
                                characters: combinedCharacters,
                                // Scheduled-specific fields
                                startDateTime: data.startDateTime,
                                playerUser: data.playerUser,
                                status: data.status,
                                isActive: data.isActive,
                                experienceId: data.experienceId,
                                isScheduled: true
                            } as ExperienceDisplayData);
                        } else {
                            // Original experience not found, use just the scheduled data
                            const fallbackCharacters = data.characters || [];
                            setAvailableCharacters(fallbackCharacters);
                            setExperience({
                                id: experienceSnap.id,
                                title: data.title,
                                shortDescription: data.shortDescription || 'No description available',
                                longDescription: data.longDescription || 'No details available',
                                createdBy: data.createdBy || '',
                                characters: fallbackCharacters,
                                // Scheduled-specific fields
                                startDateTime: data.startDateTime,
                                playerUser: data.playerUser,
                                status: data.status,
                                isActive: data.isActive,
                                experienceId: data.experienceId,
                                isScheduled: true
                            } as ExperienceDisplayData);
                        }
                    } else {
                        // Regular experience, just use the data as is
                        setAvailableCharacters(data.characters || []);
                        setExperience({
                            id: experienceSnap.id,
                            ...data,
                            isScheduled: false
                        } as ExperienceDisplayData);
                    }
                } else {
                    console.error('Experience not found');
                }
            } catch (error) {
                console.error('Error fetching experience:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchExperience();
    }, [id, source]);

    const scheduleExperience = () => {
        setShowModal(true);
    };

    const handleSchedule = async () => {
        try {
            const currentUser = FIREBASE_AUTH.currentUser;
            if (!currentUser || !experience) {
                return;
            }

            const scheduledExperience: ScheduledExperience = {
                experienceId: experience.id,
                title: experience.title,
                playerUser: currentUser.uid,
                characters: experience.characters || [],
                startDateTime: selectedDate,
                status: 'scheduled',
                isActive: false
            };

            const scheduledExperienceRef = doc(collection(FIRESTORE, 'ExperienceCalendar'), scheduledExperience.startDateTime.toISOString());
            await setDoc(scheduledExperienceRef, scheduledExperience);
            setShowModal(false);

            Alert.alert('Success', 'Experience scheduled successfully!');
        } catch (error) {
            console.error('Error scheduling experience:', error);
            Alert.alert('Error', 'Failed to schedule experience. Please try again.');
        }
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setSelectedDate(selectedDate);
        }
    };

    const onTimeChange = (event: any, selectedTime?: Date) => {
        setShowTimePicker(false);
        if (selectedTime) {
            const newDate = new Date(selectedDate);
            newDate.setHours(selectedTime.getHours());
            newDate.setMinutes(selectedTime.getMinutes());
            setSelectedDate(newDate);
        }
    };

    const handleJoinExperience = async () => {
        try {
            if (!experience || !selectedCharacter) {
                Alert.alert('Error', 'Please select a character to join the experience.');
                return;
            }

            const currentUser = FIREBASE_AUTH.currentUser;
            if (!currentUser) {
                Alert.alert('Error', 'You need to be logged in to join an experience.');
                return;
            }

            // Get the current experience data from Firestore
            const experienceRef = doc(FIRESTORE, 'ExperienceCalendar', id as string);
            const experienceSnap = await getDoc(experienceRef);

            if (!experienceSnap.exists()) {
                Alert.alert('Error', 'Experience not found.');
                return;
            }

            const experienceData = experienceSnap.data();
            const updatedCharacters = [...(experienceData.characters || [])];

            // Find the selected character and update its hostUserId
            const characterIndex = updatedCharacters.findIndex(c => c.id === selectedCharacter.id);
            if (characterIndex !== -1) {
                updatedCharacters[characterIndex] = {
                    ...updatedCharacters[characterIndex],
                    hostUserId: currentUser.uid
                };

                // Update the document in Firestore
                const newDoc = await setDoc(experienceRef, {
                    ...experienceData,
                    characters: updatedCharacters
                });

                // Update local state
                setExperience({
                    ...experience,
                    characters: updatedCharacters
                });

                setShowJoinModal(false);
                Alert.alert('Success', `You've joined as ${selectedCharacter.name}!`);
            } else {
                Alert.alert('Error', 'Character not found in the experience.');
            }
        } catch (error) {
            console.error('Error joining experience:', error);
            Alert.alert('Error', 'Failed to join the experience. Please try again.');
        }
    };

    const handleCancelExperience = async () => {
        try {
            if (!experience) return;

            const currentUser = FIREBASE_AUTH.currentUser;
            if (!currentUser) {
                Alert.alert('Error', 'You need to be logged in to cancel an experience.');
                return;
            }

            // Only the user who scheduled the experience can cancel it
            // TODO: button should only display to scheduling user
            if (experience.playerUser !== currentUser.uid) {
                Alert.alert('Permission Denied', 'Only the person who scheduled this experience can cancel it.');
                return;
            }

            // Confirm before cancelling
            Alert.alert(
                'Cancel Experience',
                'Are you sure you want to cancel this scheduled experience? This action cannot be undone.',
                [
                    {
                        text: 'No',
                        style: 'cancel',
                    },
                    {
                        text: 'Yes, Cancel',
                        style: 'destructive',
                        onPress: async () => {
                            const experienceRef = doc(FIRESTORE, 'ExperienceCalendar', id as string);

                            // Update status to cancelled instead of deleting the document
                            await setDoc(experienceRef, {
                                ...experience,
                                status: 'cancelled',
                                isActive: false
                            });

                            // Update local state
                            setExperience({
                                ...experience,
                                status: 'cancelled',
                                isActive: false
                            });

                            Alert.alert('Success', 'The experience has been cancelled.');
                        }
                    }
                ]
            );
        } catch (error) {
            console.error('Error cancelling experience:', error);
            Alert.alert('Error', 'Failed to cancel the experience. Please try again.');
        }
    };

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
        <>
            <ScrollView style={styles.container}>
                <ThemedView style={styles.header}>
                    <ThemedText type="title">{experience.title}</ThemedText>
                    <ThemedText style={styles.description}>{experience.shortDescription}</ThemedText>

                    {experience.isScheduled && experience.startDateTime && (
                        <View style={styles.metaInfo}>
                            <ThemedText style={styles.scheduledBadge}>Scheduled</ThemedText>
                            <ThemedText style={styles.date}>
                                {new Date(experience.startDateTime).toLocaleString()}
                            </ThemedText>
                            {experience.status && (
                                <ThemedText style={[
                                    styles.status,
                                    experience.status === 'cancelled' && styles.cancelledStatus
                                ]}>
                                    Status: {experience.status}
                                </ThemedText>
                            )}
                        </View>
                    )}

                    {experience.isScheduled && experience.status === 'cancelled' && (
                        <View style={styles.cancelledBanner}>
                            <ThemedText style={styles.cancelledBannerText}>
                                This experience has been cancelled
                            </ThemedText>
                        </View>
                    )}
                </ThemedView>

                <ThemedView style={styles.content}>
                    <View style={styles.section}>
                        <ThemedText>{experience.longDescription}</ThemedText>
                    </View>

                    <View style={styles.section}>
                        <ThemedText type="subtitle">Characters</ThemedText>
                        {experience.characters && experience.characters.length > 0 ? (
                            experience.characters.map((character) => (
                                <View key={character.id} style={styles.characterCard}>
                                    <ThemedText type="defaultSemiBold">{character.name}</ThemedText>
                                    <ThemedText>{character.description}</ThemedText>
                                    {experience.isScheduled && character.hostUserId && (
                                        <ThemedText style={styles.statusText}>
                                            {character.hostUserId === FIREBASE_AUTH.currentUser?.uid
                                                ? 'You are playing this character'
                                                : 'Character already claimed'}
                                        </ThemedText>
                                    )}
                                </View>
                            ))
                        ) : (
                            <ThemedText>No characters available for this experience.</ThemedText>
                        )}
                    </View>

                    {/* Only show Schedule button for regular experiences */}
                    {!experience.isScheduled && (
                        <TouchableOpacity style={styles.button} onPress={scheduleExperience}>
                            <ThemedText style={styles.buttonText}>Schedule this Experience</ThemedText>
                        </TouchableOpacity>
                    )}
                    {/* Show Join button for scheduled experiences */}
                    {experience.isScheduled && (
                        <View style={styles.buttonContainer}>
                            {/* Only show Join button if the experience is not cancelled */}
                            {experience.status !== 'cancelled' && (
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={() => {
                                        setAvailableCharacters(experience.characters || []);
                                        setSelectedCharacter(null);
                                        setShowJoinModal(true);
                                    }}
                                >
                                    <ThemedText style={styles.buttonText}>Join this Experience</ThemedText>
                                </TouchableOpacity>
                            )}

                            {/* Only show Cancel button if the current user is the one who scheduled it and it's not already cancelled */}
                            {experience.playerUser === FIREBASE_AUTH.currentUser?.uid && experience.status !== 'cancelled' && (
                                <TouchableOpacity
                                    style={[styles.button, styles.cancelExperienceButton]}
                                    onPress={handleCancelExperience}
                                >
                                    <ThemedText style={styles.buttonText}>Cancel this Experience</ThemedText>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={showModal}
                        onRequestClose={() => setShowModal(false)}
                    >
                        <View style={styles.modalContainer}>
                            <ThemedView style={styles.modalContent}>
                                <ThemedText type="subtitle">Schedule Experience</ThemedText>

                                <View style={styles.dateTimeContainer}>
                                    <TouchableOpacity
                                        style={styles.dateTimeButton}
                                        onPress={() => setShowDatePicker(true)}
                                    >
                                        <ThemedText>
                                            Date: {selectedDate.toLocaleDateString()}
                                        </ThemedText>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.dateTimeButton}
                                        onPress={() => setShowTimePicker(true)}
                                    >
                                        <ThemedText>
                                            Time: {selectedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </ThemedText>
                                    </TouchableOpacity>
                                </View>

                                {showDatePicker && (
                                    <DateTimePicker
                                        value={selectedDate}
                                        mode="date"
                                        onChange={onDateChange}
                                        minimumDate={new Date()}
                                    />
                                )}

                                {showTimePicker && (
                                    <DateTimePicker
                                        value={selectedDate}
                                        mode="time"
                                        onChange={onTimeChange}
                                    />
                                )}

                                <View style={styles.modalButtons}>
                                    <TouchableOpacity
                                        style={[styles.button, styles.cancelButton]}
                                        onPress={() => setShowModal(false)}
                                    >
                                        <ThemedText style={styles.buttonText}>Cancel</ThemedText>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.button, styles.confirmButton]}
                                        onPress={handleSchedule}
                                    >
                                        <ThemedText style={styles.buttonText}>Schedule</ThemedText>
                                    </TouchableOpacity>
                                </View>
                            </ThemedView>
                        </View>
                    </Modal>

                    {/* Join Experience Modal */}
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={showJoinModal}
                        onRequestClose={() => setShowJoinModal(false)}
                    >
                        <View style={styles.modalContainer}>
                            <ThemedView style={styles.modalContent}>
                                <ThemedText type="subtitle">Select a Character</ThemedText>
                                <ThemedText style={styles.modalDescription}>
                                    Select a character to play in this experience:
                                </ThemedText>

                                <ScrollView style={styles.characterList}>
                                    {availableCharacters.length > 0 ? (
                                        availableCharacters.map((character) => (
                                            <TouchableOpacity
                                                key={character.id}
                                                style={[
                                                    styles.characterOption,
                                                    selectedCharacter?.id === character.id && styles.selectedCharacter,
                                                    character.hostUserId && character.hostUserId !== FIREBASE_AUTH.currentUser?.uid && styles.disabledCharacter
                                                ]}
                                                onPress={() => {
                                                    // Only allow selection if character has no host or is hosted by current user
                                                    if (!character.hostUserId || character.hostUserId === FIREBASE_AUTH.currentUser?.uid) {
                                                        setSelectedCharacter(character);
                                                    } else {
                                                        Alert.alert('Character Unavailable', 'This character has already been claimed by another player.');
                                                    }
                                                }}
                                                disabled={Boolean(character.hostUserId && character.hostUserId !== FIREBASE_AUTH.currentUser?.uid)}
                                            >
                                                <View style={styles.characterOptionContent}>
                                                    <ThemedText type="defaultSemiBold">{character.name}</ThemedText>
                                                    <ThemedText style={styles.characterDescription}>{character.description}</ThemedText>

                                                    {character.hostUserId && (
                                                        <View style={styles.characterStatus}>
                                                            <ThemedText style={styles.statusText}>
                                                                {character.hostUserId === FIREBASE_AUTH.currentUser?.uid
                                                                    ? '(Your character)'
                                                                    : '(Already claimed)'}
                                                            </ThemedText>
                                                        </View>
                                                    )}
                                                </View>
                                            </TouchableOpacity>
                                        ))
                                    ) : (
                                        <ThemedText>No characters available for this experience.</ThemedText>
                                    )}
                                </ScrollView>

                                <View style={styles.modalButtons}>
                                    <TouchableOpacity
                                        style={[styles.button, styles.cancelButton]}
                                        onPress={() => setShowJoinModal(false)}
                                    >
                                        <ThemedText style={styles.buttonText}>Cancel</ThemedText>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.button, styles.confirmButton, !selectedCharacter && styles.disabledButton]}
                                        onPress={handleJoinExperience}
                                        disabled={!selectedCharacter}
                                    >
                                        <ThemedText style={styles.buttonText}>Join</ThemedText>
                                    </TouchableOpacity>
                                </View>
                            </ThemedView>
                        </View>
                    </Modal>

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
        </>
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
    button: {
        backgroundColor: '#0a7ea4',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
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
        marginTop: 12,
    },
    date: {
        opacity: 0.7,
    },
    status: {
        color: '#0a7ea4',
        fontWeight: '600',
    },
    cancelledStatus: {
        color: '#d9534f',
    },
    scheduledBadge: {
        backgroundColor: '#0a7ea4',
        color: 'white',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        fontSize: 12,
        overflow: 'hidden',
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
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '90%',
        padding: 20,
        borderRadius: 12,
        gap: 16,
    },
    dateTimeContainer: {
        gap: 12,
    },
    dateTimeButton: {
        padding: 12,
        borderRadius: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    cancelButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    confirmButton: {
        backgroundColor: '#0a7ea4',
    },
    // Character selection modal styles
    modalDescription: {
        marginBottom: 12,
        opacity: 0.7,
    },
    characterList: {
        maxHeight: 300,
    },
    characterOption: {
        padding: 16,
        borderRadius: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        marginBottom: 8,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedCharacter: {
        borderColor: '#0a7ea4',
    },
    disabledCharacter: {
        opacity: 0.5,
    },
    characterOptionContent: {
        gap: 4,
    },
    characterDescription: {
        fontSize: 14,
        opacity: 0.7,
    },
    characterStatus: {
        marginTop: 4,
    },
    statusText: {
        fontSize: 12,
        fontStyle: 'italic',
        color: '#0a7ea4',
    },
    disabledButton: {
        opacity: 0.5,
    },
    buttonContainer: {
        gap: 12,
    },
    cancelExperienceButton: {
        backgroundColor: '#d9534f',
    },
    cancelledBanner: {
        marginTop: 12,
        padding: 8,
        backgroundColor: 'rgba(217, 83, 79, 0.2)',
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#d9534f',
    },
    cancelledBannerText: {
        color: '#d9534f',
        fontWeight: '600',
    },
});
