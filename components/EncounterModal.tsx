import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React, { useState } from 'react';
import { Modal, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

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
    location: Location | null;
};

type Props = {
    visible: boolean;
    onClose: () => void;
    onSave: (encounter: Encounter) => void;
};

export function EncounterModal({ visible, onClose, onSave }: Props) {
    const [name, setName] = useState('');
    const [summary, setSummary] = useState('');
    const [location, setLocation] = useState<Location | null>(null);
    const [showMap, setShowMap] = useState(false);

    const handleSave = () => {
        const encounter: Encounter = {
            id: Date.now().toString(),
            name,
            summary,
            location,
        };
        onSave(encounter);
        setName('');
        setSummary('');
        setLocation(null);
        onClose();
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <ThemedView style={styles.modalView}>
                    <ThemedText type="subtitle">Create Encounter</ThemedText>

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
                        <ThemedText>Summary</ThemedText>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={summary}
                            onChangeText={setSummary}
                            placeholder="Enter encounter summary"
                            multiline
                            numberOfLines={4}
                        />
                    </View>

                    {!showMap && (
                        <TouchableOpacity
                            style={styles.locationButton}
                            onPress={() => setShowMap(true)}
                        >
                            <ThemedText>
                                {location ? 'Change Location' : 'Set Location'}
                            </ThemedText>
                        </TouchableOpacity>
                    )}

                    {showMap && (
                        <View style={styles.mapContainer}>
                            {/* <ExperienceMapView
                                onLocationSelect={(loc) => {
                                    setLocation(loc);
                                    setShowMap(false);
                                }}
                            /> */}
                            <TouchableOpacity
                                style={styles.closeMapButton}
                                onPress={() => setShowMap(false)}
                            >
                                <ThemedText>Close Map</ThemedText>
                            </TouchableOpacity>
                        </View>
                    )}

                    {location && (
                        <View style={styles.selectedLocation}>
                            <ThemedText>Selected Location: {location.name}</ThemedText>
                        </View>
                    )}

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={onClose}
                        >
                            <ThemedText>Cancel</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.saveButton]}
                            onPress={handleSave}
                        >
                            <ThemedText style={styles.saveButtonText}>Save</ThemedText>
                        </TouchableOpacity>
                    </View>
                </ThemedView>
            </View>
        </Modal>
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
});