import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { FIREBASE_AUTH, FIRESTORE } from '@/FirebaseConfig';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams } from 'expo-router';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';


// TODO: all types to common file
type ScheduledExperience = {
    experienceId: string;
    title: string;
    startDateTime: Date;
    playerUser: string;
    status: string;
    isActive: boolean;
    // characters: Character[]; TODO
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
    hostUserId: string; // user that will play this character
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
                            setExperience({
                                id: experienceSnap.id,
                                title: data.title || originalData.title,
                                shortDescription: originalData.shortDescription || '',
                                longDescription: originalData.longDescription || '',
                                createdBy: originalData.createdBy || '',
                                characters: originalData.characters || [],
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
                            setExperience({
                                id: experienceSnap.id,
                                title: data.title,
                                shortDescription: data.shortDescription || 'No description available',
                                longDescription: data.longDescription || 'No details available',
                                createdBy: data.createdBy || '',
                                characters: data.characters || [],
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
                                <ThemedText style={styles.status}>
                                    Status: {experience.status}
                                </ThemedText>
                            )}
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
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => {
                                // TODO: Implement join functionality
                                Alert.alert('Join Experience', 'This feature will be implemented soon!');
                            }}
                        >
                            <ThemedText style={styles.buttonText}>Join this Experience</ThemedText>
                        </TouchableOpacity>
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
});
