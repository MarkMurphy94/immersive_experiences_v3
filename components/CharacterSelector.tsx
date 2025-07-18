import { CharacterModal } from '@/components/CharacterModal';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React, { useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

export type Character = {
    id: string;
    name: string;
    description: string;
};

type Props = {
    characters: Character[];
    selectedCharacters: Character[];
    onAddCharacter?: (character: Character) => void;
    onEditCharacter?: (character: Character) => void;
    onDeleteCharacter?: (characterId: string) => void;
    onSelectCharacter?: (character: Character) => void;
    onUnselectCharacter?: (character: Character) => void;
    selectionMode?: boolean;
};

export function CharacterSelector({
    characters,
    selectedCharacters = [],
    onAddCharacter,
    onEditCharacter,
    onDeleteCharacter,
    onSelectCharacter,
    onUnselectCharacter,
    selectionMode = false
}: Props) {
    const [showCharacterModal, setShowCharacterModal] = useState(false);
    const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);

    // Check if a character is selected
    const isSelected = (character: Character) => {
        return selectedCharacters.some(c => c.id === character.id);
    };

    // Toggle character selection
    const toggleCharacterSelection = (character: Character) => {
        if (isSelected(character)) {
            onUnselectCharacter && onUnselectCharacter(character);
        } else {
            onSelectCharacter && onSelectCharacter(character);
        }
    };

    // Handle opening the character modal for editing
    const handleEditCharacter = (character: Character) => {
        setEditingCharacter(character);
        setIsEditMode(true);
        setShowCharacterModal(true);
    };

    // Handle character save (create or update)
    const handleSaveCharacter = (character: Character) => {
        if (isEditMode && onEditCharacter) {
            onEditCharacter(character);
        } else if (onAddCharacter) {
            onAddCharacter(character);
        }
        setShowCharacterModal(false);
        setEditingCharacter(null);
        setIsEditMode(false);
    };

    // Close the character modal
    const closeCharacterModal = () => {
        setShowCharacterModal(false);
        setEditingCharacter(null);
        setIsEditMode(false);
    };

    // Render a character item
    const renderCharacterItem = ({ item }: { item: Character }) => (
        <TouchableOpacity
            style={[
                styles.characterItem,
                selectionMode && isSelected(item) && styles.selectedCharacterItem
            ]}
            onPress={() => {
                if (selectionMode) {
                    toggleCharacterSelection(item);
                } else if (onEditCharacter) {
                    handleEditCharacter(item);
                }
            }}
        >
            <ThemedText style={styles.characterName}>{item.name}</ThemedText>
            <ThemedText style={styles.characterDescription} numberOfLines={2}>
                {item.description}
            </ThemedText>
            {!selectionMode && onEditCharacter && (
                <View style={styles.editIndicator}>
                    <ThemedText style={styles.editIndicatorText}>Tap to Edit</ThemedText>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <ThemedText type="subtitle">Characters</ThemedText>
                {onAddCharacter && (
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => {
                            setEditingCharacter(null);
                            setIsEditMode(false);
                            setShowCharacterModal(true);
                        }}
                    >
                        <ThemedText style={styles.addButtonText}>+ Add Character</ThemedText>
                    </TouchableOpacity>
                )}
            </View>

            {characters.length > 0 ? (
                <FlatList
                    data={characters}
                    renderItem={renderCharacterItem}
                    keyExtractor={(item) => item.id}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    style={styles.characterList}
                    contentContainerStyle={styles.characterListContent}
                />
            ) : (
                <ThemedView style={styles.emptyState}>
                    <ThemedText style={styles.emptyStateText}>No characters added yet</ThemedText>
                </ThemedView>
            )}

            <CharacterModal
                visible={showCharacterModal}
                onClose={closeCharacterModal}
                onSave={handleSaveCharacter}
                character={editingCharacter}
                isEditMode={isEditMode}
                onDelete={onDeleteCharacter ? (characterId) => {
                    if (onDeleteCharacter) {
                        onDeleteCharacter(characterId);
                        closeCharacterModal();
                    }
                } : undefined}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    characterList: {
        flexGrow: 0,
    },
    characterListContent: {
        paddingRight: 10,
    },
    characterItem: {
        width: 200,
        padding: 12,
        marginRight: 10,
        borderRadius: 8,
        backgroundColor: 'rgba(0,0,0,0.05)',
        position: 'relative',
    },
    selectedCharacterItem: {
        backgroundColor: 'rgba(10, 126, 164, 0.2)',
        borderWidth: 1,
        borderColor: '#0a7ea4',
    },
    characterName: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 4,
    },
    characterDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16, // Add space for the edit indicator
    },
    editIndicator: {
        position: 'absolute',
        bottom: 4,
        right: 8,
    },
    editIndicatorText: {
        fontSize: 10,
        color: '#0a7ea4',
        fontStyle: 'italic',
    },
    addButton: {
        padding: 8,
    },
    addButtonText: {
        color: '#0a7ea4',
    },
    emptyState: {
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.03)',
        borderRadius: 8,
        marginBottom: 10,
    },
    emptyStateText: {
        color: '#666',
    },
});
