import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React, { useState } from 'react';
import { Modal, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

type Character = {
    id: string;
    name: string;
    description: string;
};

type Props = {
    visible: boolean;
    onClose: () => void;
    onSave: (character: Character) => void;
};

export function CharacterModal({ visible, onClose, onSave }: Props) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleSave = () => {
        const character: Character = {
            id: Date.now().toString(),
            name,
            description,
        };
        onSave(character);
        setName('');
        setDescription('');
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
                    <ThemedText type="subtitle">Create Character</ThemedText>

                    <View style={styles.inputContainer}>
                        <ThemedText>Character Name</ThemedText>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter character name"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <ThemedText>Description</ThemedText>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Enter character description"
                            multiline
                            numberOfLines={4}
                        />
                    </View>

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