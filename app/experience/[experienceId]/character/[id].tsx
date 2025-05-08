import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function CharacterDetailsScreen() {
    const { id, experienceId } = useLocalSearchParams();

    // This would be replaced with actual data from your backend
    const character = {
        id,
        experienceId,
        name: "Detective Inspector",
        shortDescription: "Lead investigator on the case",
        longDescription: "A seasoned detective with a keen eye for detail and a reputation for solving the most complex cases. Known for their methodical approach and ability to put witnesses at ease.",
        scriptNotes: "The character should maintain an air of authority while being approachable. Key moments include the initial crime scene assessment and the final reveal of the culprit.",
        props: [
            "Detective's notebook",
            "Magnifying glass",
            "Police badge (prop)",
            "Period-appropriate coat"
        ],
        costume: {
            style: "1920s Detective",
            requirements: [
                "Dark colored suit or period-appropriate dress",
                "Detective's hat (provided)",
                "Comfortable shoes for walking",
            ]
        }
    };

    return (
        <ScrollView style={styles.container}>
            <ThemedView style={styles.header}>
                <ThemedText type="title">{character.name}</ThemedText>
                <ThemedText style={styles.subtitle}>{character.shortDescription}</ThemedText>
            </ThemedView>

            <ThemedView style={styles.content}>
                <View style={styles.section}>
                    <ThemedText type="subtitle">Character Background</ThemedText>
                    <ThemedText>{character.longDescription}</ThemedText>
                </View>

                <View style={styles.section}>
                    <ThemedText type="subtitle">Script Notes</ThemedText>
                    <ThemedView style={styles.notesCard}>
                        <ThemedText>{character.scriptNotes}</ThemedText>
                    </ThemedView>
                </View>

                <View style={styles.section}>
                    <ThemedText type="subtitle">Required Props</ThemedText>
                    {character.props.map((prop, index) => (
                        <ThemedText key={index} style={styles.listItem}>• {prop}</ThemedText>
                    ))}
                </View>

                <View style={styles.section}>
                    <ThemedText type="subtitle">Costume Requirements</ThemedText>
                    <ThemedText style={styles.costumeStyle}>{character.costume.style}</ThemedText>
                    {character.costume.requirements.map((requirement, index) => (
                        <ThemedText key={index} style={styles.listItem}>• {requirement}</ThemedText>
                    ))}
                </View>

                <View style={styles.section}>
                    <ThemedView style={styles.selectButton}>
                        <ThemedText type="defaultSemiBold" style={styles.selectButtonText}>Select Character</ThemedText>
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
    subtitle: {
        marginTop: 8,
        opacity: 0.7,
    },
    content: {
        padding: 16,
    },
    section: {
        marginTop: 24,
        gap: 8,
    },
    notesCard: {
        padding: 16,
        borderRadius: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    listItem: {
        marginLeft: 8,
        marginTop: 4,
    },
    costumeStyle: {
        fontStyle: 'italic',
        marginBottom: 8,
    },
    selectButton: {
        backgroundColor: '#0a7ea4',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    },
    selectButtonText: {
        color: '#fff',
    }
});
