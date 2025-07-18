import { CharacterSelector } from '@/components/CharacterSelector';
import { EncounterModal } from '@/components/EncounterModal';
import { HorizontalList } from '@/components/HorizontalList';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { FIREBASE_AUTH, FIRESTORE } from '@/FirebaseConfig';
import { router } from 'expo-router';
import { collection, doc, setDoc } from "firebase/firestore";
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

type Location = {
    latitude: number;
    longitude: number;
    name: string;
    address: string;
};

type Encounter = {
    id: string;
    name: string;
    summary: string;
    location: Location | string | null;
    type: string;
    characters: Character[];
};

type Character = {
    id: string;
    name: string;
    description: string;
};

type Experience = {
    id: string;
    title: string;
    shortDescription: string;
    longDescription: string;
    createdBy: string;
    createdAt: Date;
    characters: Character[];
    encounters: Encounter[];
};

// TODO: Add character picker for encounters
// TODO: characters/encounters in lists should be editable

export default function CreateExperienceScreen() {
    const [title, setTitle] = useState('');
    const [shortDescription, setShortDescription] = useState('');
    const [longDescription, setLongDescription] = useState('');
    const [encounters, setEncounters] = useState<Encounter[]>([]);
    const [characters, setCharacters] = useState<Character[]>([]);
    const [showEncounterModal, setShowEncounterModal] = useState(false);
    const [editingEncounter, setEditingEncounter] = useState<Encounter | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);

    const handleEditEncounter = (encounter: Encounter) => {
        setEditingEncounter(encounter);
        setIsEditMode(true);
        setShowEncounterModal(true);
    };

    const saveExperienceToFirebase = async () => {
        try {
            // Validate required fields
            if (!title.trim()) {
                Alert.alert('Error', 'Please enter an experience name');
                return;
            }

            if (!shortDescription.trim()) {
                Alert.alert('Error', 'Please enter a short description');
                return;
            }

            const currentUser = FIREBASE_AUTH.currentUser;
            if (!currentUser) {
                Alert.alert('Error', 'You must be logged in to create an experience');
                return;
            }

            // Create experience object
            const today = new Date(Date.now());
            const experience: Experience = {
                id: `exp_${today}`,
                title: title.trim(),
                shortDescription: shortDescription.trim(),
                longDescription: longDescription.trim(),
                createdBy: currentUser.uid,
                createdAt: today,
                characters,
                encounters,
            };

            // Save to Firestore
            const experienceRef = doc(collection(FIRESTORE, 'ImmersiveExperiences'), experience.id);
            await setDoc(experienceRef, experience);

            // Show success message
            Alert.alert(
                'Success',
                'Experience created successfully!',
                [{ text: 'OK', onPress: () => router.back() }]
            );

        } catch (error) {
            console.error('Error saving experience:', error);
            Alert.alert(
                'Error',
                'Failed to save experience. Please try again.'
            );
        }
    }

    return (
        <ScrollView style={styles.container}>
            <ThemedView style={styles.header}>
                <ThemedText type="title">Create Experience</ThemedText>
            </ThemedView>

            <ThemedView style={styles.content}>
                <View style={styles.section}>
                    <ThemedText type="subtitle">Basic Information</ThemedText>
                    <View style={styles.inputContainer}>
                        <ThemedText>Experience Name</ThemedText>
                        <TextInput
                            style={styles.input}
                            value={title}
                            onChangeText={setTitle}
                            placeholder="Enter experience name"
                        // placeholderTextColor="rgba(0,0,0,0.5)"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <ThemedText>Short Description</ThemedText>
                        <TextInput
                            style={styles.input}
                            value={shortDescription}
                            onChangeText={setShortDescription}
                            placeholder="Enter a one-line description"
                        // placeholderTextColor="rgba(0,0,0,0.5)"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <ThemedText>Detailed Description</ThemedText>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={longDescription}
                            onChangeText={setLongDescription}
                            placeholder="Enter a detailed description"
                            // placeholderTextColor="rgba(0,0,0,0.5)"
                            multiline
                            numberOfLines={4}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <CharacterSelector
                        characters={characters}
                        selectedCharacters={[]}
                        onAddCharacter={(character) => {
                            setCharacters([...characters, character]);
                        }}
                        onEditCharacter={(updatedCharacter) => {
                            setCharacters(characters.map(c =>
                                c.id === updatedCharacter.id ? updatedCharacter : c
                            ));
                        }}
                        onDeleteCharacter={(characterId) => {
                            // Check if the character is used in any encounters
                            const isUsed = encounters.some(encounter =>
                                encounter.characters.some(c => c.id === characterId)
                            );

                            if (isUsed) {
                                Alert.alert(
                                    "Cannot Delete Character",
                                    "This character is used in one or more encounters. Please remove the character from all encounters first."
                                );
                                return;
                            }

                            Alert.alert(
                                "Delete Character",
                                "Are you sure you want to delete this character?",
                                [
                                    {
                                        text: "Cancel",
                                        style: "cancel"
                                    },
                                    {
                                        text: "Delete",
                                        onPress: () => {
                                            setCharacters(characters.filter(c => c.id !== characterId));
                                        },
                                        style: "destructive"
                                    }
                                ]
                            );
                        }}
                    />
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <ThemedText type="subtitle">Encounters</ThemedText>
                        <TouchableOpacity
                            onPress={() => setShowEncounterModal(true)}
                            style={styles.addButton}
                        >
                            <ThemedText style={styles.addButtonText}>+ Add Encounter</ThemedText>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <HorizontalList>
                            {encounters.map((encounter) => (
                                <TouchableOpacity
                                    key={encounter.id}
                                    onPress={() => {
                                        setEditingEncounter(encounter);
                                        setIsEditMode(true);
                                        setShowEncounterModal(true);
                                    }}
                                >
                                    <ThemedView style={styles.card}>
                                        <ThemedText style={styles.cardTitle}>{encounter.name}</ThemedText>
                                        <ThemedText style={styles.cardDescription}>
                                            {encounter.summary}
                                        </ThemedText>
                                        {encounter.location && (
                                            <ThemedText style={styles.cardLocation}>
                                                📍 {typeof encounter.location === 'string' ? encounter.location : encounter.location.name}
                                            </ThemedText>
                                        )}
                                        {encounter.characters && encounter.characters.length > 0 && (
                                            <ThemedText style={styles.cardCharacters}>
                                                👤 {encounter.characters.length} Character{encounter.characters.length !== 1 ? 's' : ''}
                                            </ThemedText>
                                        )}
                                        <ThemedText style={styles.editHint}>Tap to Edit</ThemedText>
                                    </ThemedView>
                                </TouchableOpacity>
                            ))}
                        </HorizontalList>
                    </ScrollView>
                </View>

                <View style={styles.section}>
                    <ThemedView style={styles.submitButton} >
                        <ThemedText type="defaultSemiBold" style={styles.submitButtonText} onPress={saveExperienceToFirebase}>Create Experience</ThemedText>
                    </ThemedView>
                </View>
            </ThemedView>

            <EncounterModal
                visible={showEncounterModal}
                onClose={() => {
                    setShowEncounterModal(false);
                    setEditingEncounter(null);
                    setIsEditMode(false);
                }}
                availableCharacters={characters}
                encounter={editingEncounter}
                isEditMode={isEditMode}
                onSave={(encounter) => {
                    if (isEditMode) {
                        // Update existing encounter
                        setEncounters(encounters.map(enc =>
                            enc.id === encounter.id ? {
                                ...encounter,
                                location: typeof encounter.location === 'string' || encounter.location === null
                                    ? encounter.location
                                    : (encounter.location?.name ?? ''),
                                characters: encounter.characters || []
                            } : enc
                        ));
                    } else {
                        // Add new encounter
                        setEncounters([
                            ...encounters,
                            {
                                ...encounter,
                                location: typeof encounter.location === 'string' || encounter.location === null
                                    ? encounter.location
                                    : (encounter.location?.name ?? ''),
                                characters: encounter.characters || []
                            },
                        ]);
                    }
                    setEditingEncounter(null);
                    setIsEditMode(false);
                }}
                onDelete={(encounterId) => {
                    Alert.alert(
                        "Delete Encounter",
                        "Are you sure you want to delete this encounter?",
                        [
                            {
                                text: "Cancel",
                                style: "cancel"
                            },
                            {
                                text: "Delete",
                                onPress: () => {
                                    setEncounters(encounters.filter(enc => enc.id !== encounterId));
                                    setShowEncounterModal(false);
                                    setEditingEncounter(null);
                                    setIsEditMode(false);
                                },
                                style: "destructive"
                            }
                        ]
                    );
                }}
            />
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
    section: {
        marginTop: 24,
        gap: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    inputContainer: {
        gap: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: 'rgba(192, 192, 192, 0.1)',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    addButton: {
        padding: 8,
    },
    addButtonText: {
        color: '#0a7ea4',
    },
    card: {
        width: 250,
        padding: 16,
        marginRight: 16,
        borderRadius: 8,
        // backgroundColor: 'rgba(0,0,0,0.05)',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    cardDescription: {
        fontSize: 14,
        marginBottom: 8,
    },
    locationButton: {
        padding: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(0,0,0,0.1)',
        alignItems: 'center',
        marginTop: 8,
    },
    submitButton: {
        backgroundColor: '#0a7ea4',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
    },
    cardLocation: {
        fontSize: 14,
        marginTop: 8,
        color: '#0a7ea4',
    },
    cardCharacters: {
        fontSize: 14,
        marginTop: 8,
        color: '#0a7ea4',
    },
    editHint: {
        fontSize: 12,
        marginTop: 8,
        color: '#888',
        fontStyle: 'italic',
    },
});
