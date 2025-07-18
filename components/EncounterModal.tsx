import { Character, CharacterSelector } from '@/components/CharacterSelector';
import ExperienceMapView from '@/components/ExperienceMapView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

type Location = {
    latitude: number;
    longitude: number;
    name: string;
    address: string;
};

type EncounterTypeOption = {
    id: string;
    label: string;
    value: string;
};

const encounterTypes: EncounterTypeOption[] = [
    { id: '1', label: 'Message', value: 'message' },
    { id: '2', label: 'Planned Encounter', value: 'planned_encounter' },
    { id: '3', label: 'Surprise Encounter', value: 'surprise_encounter' },
    { id: '4', label: 'Item Encounter', value: 'item_encounter' },
];

type Encounter = {
    id: string;
    name: string;
    summary: string;
    // messageToPlayer: string | null;
    location: Location | string | null;
    type: string;
    characters: Character[];
};

type Props = {
    visible: boolean;
    onClose: () => void;
    onSave: (encounter: Encounter) => void;
    onDelete?: (encounterId: string) => void;
    availableCharacters?: Character[];
    encounter?: Encounter | null;
    isEditMode?: boolean;
};

export function EncounterModal({ visible, onClose, onSave, onDelete, availableCharacters = [], encounter = null, isEditMode = false }: Props) {
    const [name, setName] = useState('');
    const [summary, setSummary] = useState('');
    const [location, setLocation] = useState<Location | null>(null);
    const [selectedType, setSelectedType] = useState<string>('message');
    const [locationModalVisible, setLocationModalVisible] = useState(false);
    const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([]);

    // Update form when encounter prop changes or modal becomes visible
    useEffect(() => {
        if (visible && encounter) {
            setName(encounter.name);
            setSummary(encounter.summary);
            setLocation(typeof encounter.location === 'string'
                ? { name: encounter.location, address: encounter.location, latitude: 0, longitude: 0 }
                : encounter.location);
            setSelectedType(encounter.type);
            setSelectedCharacters(encounter.characters || []);
        } else if (visible && !isEditMode) {
            // Clear form when opening in create mode
            setName('');
            setSummary('');
            setLocation(null);
            setSelectedType('message');
            setSelectedCharacters([]);
        }
    }, [visible, encounter, isEditMode]);

    const handleSave = () => {
        const updatedEncounter: Encounter = {
            id: encounter ? encounter.id : Date.now().toString(),
            name,
            summary,
            location,
            type: selectedType,
            characters: selectedCharacters
        };
        onSave(updatedEncounter);

        // Only reset form if not in edit mode
        if (!isEditMode) {
            setName('');
            setSummary('');
            setLocation(null);
            setSelectedType('message');
            setSelectedCharacters([]);
        }

        onClose();
    };

    const handleLocationSelect = (selectedLocation: Location) => {
        setLocation(selectedLocation);
    };

    const openLocationModal = () => {
        setLocationModalVisible(true);
    };

    const closeLocationModal = () => {
        setLocationModalVisible(false);
    };

    const handleClose = () => {
        // Only reset form if not in edit mode
        if (!isEditMode) {
            setName('');
            setSummary('');
            setLocation(null);
            setSelectedType('message');
            setSelectedCharacters([]);
        }
        onClose();
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={handleClose}
        >
            <View style={styles.centeredView}>
                <ThemedView style={styles.modalView}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <ThemedText type="subtitle">
                            {isEditMode ? 'Edit Encounter' : 'Create Encounter'}
                        </ThemedText>

                        <View style={styles.inputContainer}>
                            <ThemedText>Encounter Name</ThemedText>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Enter encounter name"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <ThemedText>Encounter Type</ThemedText>
                            <View style={styles.typeContainer}>
                                {encounterTypes.map((type) => (
                                    <TouchableOpacity
                                        key={type.id}
                                        style={[
                                            styles.typeOption,
                                            selectedType === type.value && styles.typeOptionSelected
                                        ]}
                                        onPress={() => setSelectedType(type.value)}
                                    >
                                        <ThemedText style={[
                                            styles.typeText,
                                            selectedType === type.value && styles.typeTextSelected
                                        ]}>
                                            {type.label}
                                        </ThemedText>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            {selectedType !== "message" ? (
                                <ThemedText>Summary</ThemedText>
                            ) : (
                                <ThemedText>Message to Player</ThemedText>
                            )}
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={summary}
                                onChangeText={setSummary}
                                placeholder="Start typing"
                                multiline
                                numberOfLines={4}
                            />
                        </View>

                        {selectedType !== "message" && (
                            <View style={styles.inputContainer}>
                                <ThemedText>Location</ThemedText>
                                <TouchableOpacity
                                    style={styles.locationButton}
                                    onPress={openLocationModal}
                                >
                                    <ThemedText>
                                        {location ? 'Change Location' : 'Set Location'}
                                    </ThemedText>
                                </TouchableOpacity>
                            </View>
                        )}

                        {location && (
                            <View style={styles.selectedLocation}>
                                <ThemedText>Selected Location: {location.name}</ThemedText>
                                <ThemedText style={styles.locationAddress}>{location.address}</ThemedText>
                            </View>
                        )}

                        <View style={styles.inputContainer}>
                            <CharacterSelector
                                characters={availableCharacters}
                                selectedCharacters={selectedCharacters}
                                selectionMode={true}
                                onSelectCharacter={(character) => {
                                    setSelectedCharacters([...selectedCharacters, character]);
                                }}
                                onUnselectCharacter={(character) => {
                                    setSelectedCharacters(selectedCharacters.filter(c => c.id !== character.id));
                                }}
                            />
                        </View>

                        <View style={styles.buttonContainer}>
                            {isEditMode && onDelete && (
                                <TouchableOpacity
                                    style={[styles.button, styles.deleteButton]}
                                    onPress={() => {
                                        if (encounter) {
                                            onDelete(encounter.id);
                                        }
                                    }}
                                >
                                    <ThemedText style={styles.deleteButtonText}>Delete</ThemedText>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={handleClose}
                            >
                                <ThemedText>Cancel</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.saveButton]}
                                onPress={handleSave}
                                disabled={!name.trim() || !summary.trim()}
                            >
                                <ThemedText style={styles.saveButtonText}>
                                    {isEditMode ? 'Update' : 'Save'}
                                </ThemedText>
                            </TouchableOpacity>
                        </View>

                        <ExperienceMapView
                            visible={locationModalVisible}
                            onClose={closeLocationModal}
                            onLocationSelect={handleLocationSelect}
                        />
                    </ScrollView>
                </ThemedView>
            </View >
        </Modal >
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        width: '90%',
        maxHeight: '90%',
        padding: 20,
        borderRadius: 12,
        gap: 16,
    },
    inputContainer: {
        gap: 8,
    },
    typeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    typeOption: {
        flex: 1,
        minWidth: '45%',
        padding: 12,
        borderRadius: 8,
        backgroundColor: 'rgba(0,0,0,0.05)',
        alignItems: 'center',
    },
    typeOptionSelected: {
        backgroundColor: '#0a7ea4',
    },
    typeText: {
        fontSize: 14,
    },
    typeTextSelected: {
        color: '#fff',
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
    locationButton: {
        padding: 12,
        borderRadius: 8,
        backgroundColor: 'rgba(0,0,0,0.1)',
        alignItems: 'center',
    },
    mapContainer: {
        height: 300,
        marginVertical: 10,
        borderRadius: 8,
        overflow: 'hidden',
    },
    closeMapButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 8,
        backgroundColor: 'white',
        borderRadius: 4,
    },
    selectedLocation: {
        padding: 12,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 8,
    },
    locationAddress: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    button: {
        padding: 12,
        borderRadius: 8,
        minWidth: 100,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    saveButton: {
        backgroundColor: '#0a7ea4',
    },
    saveButtonText: {
        color: '#fff',
    },
    deleteButton: {
        backgroundColor: '#e74c3c',
    },
    deleteButtonText: {
        color: '#fff',
    },
});