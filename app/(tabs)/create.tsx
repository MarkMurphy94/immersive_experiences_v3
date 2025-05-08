import { HorizontalList } from '@/components/HorizontalList';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

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

export default function CreateExperienceScreen() {
    const [title, setTitle] = useState('');
    const [shortDescription, setShortDescription] = useState('');
    const [longDescription, setLongDescription] = useState('');
    const [encounters, setEncounters] = useState<Encounter[]>([]);
    const [characters, setCharacters] = useState<Character[]>([]);

    const addEncounter = () => {
        const newEncounter: Encounter = {
            id: Date.now().toString(),
            name: '',
            summary: '',
            location: null,
        };
        setEncounters([...encounters, newEncounter]);
    };

    const addCharacter = () => {
        const newCharacter: Character = {
            id: Date.now().toString(),
            name: '',
            description: '',
        };
        setCharacters([...characters, newCharacter]);
    };

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
                            placeholderTextColor="rgba(0,0,0,0.5)"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <ThemedText>Short Description</ThemedText>
                        <TextInput
                            style={styles.input}
                            value={shortDescription}
                            onChangeText={setShortDescription}
                            placeholder="Enter a one-line description"
                            placeholderTextColor="rgba(0,0,0,0.5)"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <ThemedText>Detailed Description</ThemedText>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={longDescription}
                            onChangeText={setLongDescription}
                            placeholder="Enter a detailed description"
                            placeholderTextColor="rgba(0,0,0,0.5)"
                            multiline
                            numberOfLines={4}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <ThemedText type="subtitle">Characters</ThemedText>
                        <TouchableOpacity onPress={addCharacter} style={styles.addButton}>
                            <ThemedText style={styles.addButtonText}>+ Add Character</ThemedText>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <HorizontalList>
                            {characters.map((character) => (
                                <ThemedView key={character.id} style={styles.card}>
                                    <TextInput
                                        style={styles.cardTitle}
                                        placeholder="Character Name"
                                        placeholderTextColor="rgba(0,0,0,0.5)"
                                    />
                                    <TextInput
                                        style={styles.cardDescription}
                                        placeholder="Brief description"
                                        placeholderTextColor="rgba(0,0,0,0.5)"
                                        multiline
                                    />
                                </ThemedView>
                            ))}
                        </HorizontalList>
                    </ScrollView>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <ThemedText type="subtitle">Encounters</ThemedText>
                        <TouchableOpacity onPress={addEncounter} style={styles.addButton}>
                            <ThemedText style={styles.addButtonText}>+ Add Encounter</ThemedText>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <HorizontalList>
                            {encounters.map((encounter) => (
                                <ThemedView key={encounter.id} style={styles.card}>
                                    <TextInput
                                        style={styles.cardTitle}
                                        placeholder="Encounter Name"
                                        placeholderTextColor="rgba(0,0,0,0.5)"
                                    />
                                    <TextInput
                                        style={styles.cardDescription}
                                        placeholder="Brief summary"
                                        placeholderTextColor="rgba(0,0,0,0.5)"
                                        multiline
                                    />
                                    <TouchableOpacity style={styles.locationButton}>
                                        <ThemedText>Set Location</ThemedText>
                                    </TouchableOpacity>
                                </ThemedView>
                            ))}
                        </HorizontalList>
                    </ScrollView>
                </View>

                <View style={styles.section}>
                    <ThemedView style={styles.submitButton}>
                        <ThemedText type="defaultSemiBold" style={styles.submitButtonText}>Create Experience</ThemedText>
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
        borderColor: 'rgba(0,0,0,0.1)',
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
        backgroundColor: 'rgba(0,0,0,0.05)',
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
    }
});
