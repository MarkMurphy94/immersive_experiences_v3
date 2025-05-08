import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

type Character = {
    id: string;
    name: string;
    role: string;
};

export default function CreateEncounterScreen() {
    const { experienceId } = useLocalSearchParams();
    const [name, setName] = useState('');
    const [summary, setSummary] = useState('');
    const [objective, setObjective] = useState('');
    const [characters, setCharacters] = useState<Character[]>([]);

    // This would be replaced with actual data from your backend
    const availableCharacters = [
        { id: '1', name: 'Detective Inspector', role: 'Lead investigator' },
        { id: '2', name: 'The Butler', role: 'Key witness' },
        { id: '3', name: 'The Heiress', role: 'Suspect' },
    ];

    const toggleCharacter = (character: Character) => {
        const isSelected = characters.some(c => c.id === character.id);
        if (isSelected) {
            setCharacters(characters.filter(c => c.id !== character.id));
        } else {
            setCharacters([...characters, character]);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <ThemedView style={styles.header}>
                <ThemedText type="title">Create Encounter</ThemedText>
            </ThemedView>

            <ThemedView style={styles.content}>
                <View style={styles.section}>
                    <View style={styles.inputContainer}>
                        <ThemedText>Encounter Name</ThemedText>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter encounter name"
                            placeholderTextColor="rgba(0,0,0,0.5)"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <ThemedText>Brief Summary</ThemedText>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={summary}
                            onChangeText={setSummary}
                            placeholder="What happens in this encounter?"
                            placeholderTextColor="rgba(0,0,0,0.5)"
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <ThemedText>Player Objective</ThemedText>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={objective}
                            onChangeText={setObjective}
                            placeholder="What should the player achieve?"
                            placeholderTextColor="rgba(0,0,0,0.5)"
                            multiline
                            numberOfLines={3}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <ThemedText type="subtitle">Characters Present</ThemedText>
                    {availableCharacters.map(character => (
                        <TouchableOpacity
                            key={character.id}
                            onPress={() => toggleCharacter(character)}
                            style={[
                                styles.characterCard,
                                characters.some(c => c.id === character.id) && styles.characterCardSelected
                            ]}
                        >
                            <ThemedText type="defaultSemiBold">{character.name}</ThemedText>
                            <ThemedText style={styles.characterRole}>{character.role}</ThemedText>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.section}>
                    <TouchableOpacity style={styles.locationButton}>
                        <ThemedText type="defaultSemiBold">Set Encounter Location</ThemedText>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <ThemedView style={styles.submitButton}>
                        <ThemedText type="defaultSemiBold" style={styles.submitButtonText}>Save Encounter</ThemedText>
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
    section: {
        marginTop: 24,
        gap: 12,
    },
    inputContainer: {
        gap: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    characterCard: {
        padding: 16,
        borderRadius: 8,
        backgroundColor: 'rgba(0,0,0,0.05)',
        marginBottom: 8,
    },
    characterCardSelected: {
        backgroundColor: 'rgba(10,126,164,0.1)',
        borderWidth: 1,
        borderColor: '#0a7ea4',
    },
    characterRole: {
        opacity: 0.7,
        fontSize: 14,
        marginTop: 4,
    },
    locationButton: {
        padding: 16,
        borderRadius: 8,
        backgroundColor: 'rgba(0,0,0,0.05)',
        alignItems: 'center',
    },
    submitButton: {
        backgroundColor: '#0a7ea4',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
    }
});
