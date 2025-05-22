import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { FIREBASE_AUTH, FIRESTORE } from '@/FirebaseConfig';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams } from 'expo-router';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';


// TODO: all types to common declaration
type ScheduledExperience = {
    id: string;
    title: string;
    startDateTime: Date;
    playerUser: string;
    status: string;
    isActive: boolean;
    // characters: {
    //     id: string;
    //     name: string;
    //     description: string;
    // }[];
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
};

type ExperienceData = {
    id: string;
    title: string;
    shortDescription: string;
    longDescription: string;
    createdBy: string;
    characters: Character[];
    encounters: Encounter[];
};

export default function ExperienceDetailsScreen() {
    const { id } = useLocalSearchParams();
    const [experience, setExperience] = useState<ScheduledExperience | null>(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    useEffect(() => {
        async function fetchExperience() {
            try {
                const experienceRef = doc(FIRESTORE, 'ImmersiveExperiences', id as string);
                const experienceSnap = await getDoc(experienceRef);

                if (experienceSnap.exists()) {
                    setExperience({ id: experienceSnap.id, ...experienceSnap.data() } as ScheduledExperience);
                }
            } catch (error) {
                console.error('Error fetching experience:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchExperience();
    }, [id]);

    const scheduleExperience = () => {
        setShowModal(true);
    };

    const handleSchedule = async () => {
        try {
            const currentUser = FIREBASE_AUTH.currentUser;
            if (!currentUser || !experience) {
                return;
            }

            const scheduleData: ScheduledExperience = {
                id: experience.id,
                title: experience.title,
                playerUser: currentUser.uid,
                startDateTime: selectedDate,
                status: 'scheduled',
                isActive: false
            };

            const scheduledExperienceRef = doc(collection(FIRESTORE, 'ExperienceCalendar'), scheduleData.startDateTime.toISOString());
            await setDoc(scheduledExperienceRef, scheduleData);
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
                    <TouchableOpacity style={styles.button} onPress={scheduleExperience}>
                        <ThemedText style={styles.buttonText}>Schedule this Experience</ThemedText>
                    </TouchableOpacity>
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
