import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Image, ScrollView, StyleSheet, View } from 'react-native';

type Rating = {
    role: 'player' | 'actor' | 'creator';
    score: number;
    reviews: number;
};

type Experience = {
    id: string;
    title: string;
    role: 'player' | 'actor' | 'creator';
    date: string;
};

export default function ProfileScreen() {
    // This would be replaced with actual data from your backend
    const user = {
        name: "Jane Smith",
        joinDate: "March 2025",
        headline: "Adventure enthusiast & mystery creator",
        ratings: [
            { role: 'player', score: 4.8, reviews: 15 },
            { role: 'actor', score: 4.9, reviews: 8 },
            { role: 'creator', score: 4.7, reviews: 3 },
        ] as Rating[],
        experiences: [
            { id: '1', title: 'Mystery at Moonlight Manor', role: 'creator', date: '2025-05-01' },
            { id: '2', title: 'Urban Adventure Quest', role: 'actor', date: '2025-04-15' },
            { id: '3', title: 'Ghost Tour', role: 'player', date: '2025-04-01' },
        ] as Experience[],
    };

    const RatingCard = ({ rating }: { rating: Rating }) => (
        <ThemedView style={styles.ratingCard}>
            <ThemedText type="defaultSemiBold" style={styles.roleText}>
                {rating.role.charAt(0).toUpperCase() + rating.role.slice(1)}
            </ThemedText>
            <ThemedText style={styles.score}>{rating.score.toFixed(1)} ⭐️</ThemedText>
            <ThemedText style={styles.reviews}>{rating.reviews} reviews</ThemedText>
        </ThemedView>
    );

    return (
        <ScrollView style={styles.container}>
            <ThemedView style={styles.header}>
                <View style={styles.profileHeader}>
                    <Image
                        source={{ uri: 'https://placekitten.com/100/100' }}
                        style={styles.profileImage}
                    />
                    <View style={styles.profileInfo}>
                        <ThemedText type="title">{user.name}</ThemedText>
                        <ThemedText style={styles.joinDate}>Joined {user.joinDate}</ThemedText>
                    </View>
                </View>
                <ThemedText style={styles.headline}>{user.headline}</ThemedText>
            </ThemedView>

            <ThemedView style={styles.content}>
                <View style={styles.section}>
                    <ThemedText type="subtitle">Ratings</ThemedText>
                    <View style={styles.ratingsContainer}>
                        {user.ratings.map((rating, index) => (
                            <RatingCard key={index} rating={rating} />
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <ThemedText type="subtitle">Experience History</ThemedText>
                    {user.experiences.map((experience) => (
                        <ThemedView key={experience.id} style={styles.ExperiencePreviewCard}>
                            <ThemedText type="defaultSemiBold">{experience.title}</ThemedText>
                            <View style={styles.experienceMeta}>
                                <ThemedText style={styles.roleTag}>{experience.role}</ThemedText>
                                <ThemedText style={styles.date}>{experience.date}</ThemedText>
                            </View>
                        </ThemedView>
                    ))}
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
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 16,
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    profileInfo: {
        flex: 1,
    },
    joinDate: {
        opacity: 0.7,
    },
    headline: {
        fontSize: 16,
        marginTop: 8,
    },
    content: {
        padding: 16,
    },
    section: {
        marginTop: 24,
        gap: 16,
    },
    ratingsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    ratingCard: {
        flex: 1,
        padding: 16,
        borderRadius: 8,
        backgroundColor: 'rgba(0,0,0,0.05)',
        alignItems: 'center',
    },
    roleText: {
        marginBottom: 4,
    },
    score: {
        fontSize: 18,
        marginBottom: 4,
    },
    reviews: {
        opacity: 0.7,
        fontSize: 12,
    },
    ExperiencePreviewCard: {
        padding: 16,
        borderRadius: 8,
        backgroundColor: 'rgba(0,0,0,0.05)',
        marginBottom: 12,
    },
    experienceMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    roleTag: {
        fontSize: 14,
        color: '#0a7ea4',
    },
    date: {
        opacity: 0.7,
        fontSize: 14,
    },
});
