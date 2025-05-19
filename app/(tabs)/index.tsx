import { ExperienceCard } from '@/components/ExperienceCard';
import { HorizontalList } from '@/components/HorizontalList';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function HomeScreen() {

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Immersive Experiences</ThemedText>
      </ThemedView>

      <View style={styles.section}>
        <ThemedText type="subtitle">Featured Experiences</ThemedText>
        <HorizontalList>
          <ExperienceCard
            title="Mystery at Moonlight Manor"
            description="A thrilling murder mystery set in a historic mansion"
            estimatedDuration="2 hours"
            distance=""
            status="Run this Experience!"
          />
          <ExperienceCard
            title="Urban Adventure Quest"
            description="Explore the city's hidden gems in this interactive treasure hunt"
            estimatedDuration="3 hours"
            distance="1.2 miles away"
            status="Looking for participants"
          />
        </HorizontalList>
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle">Nearby Experiences</ThemedText>
        <HorizontalList>
          <ExperienceCard
            title="Art Gallery Mystery"
            description="Solve the case of the missing masterpiece"
            estimatedDuration="1.5 hours"
            distance="0.3 miles away"
            status="Ready to join"
          />
        </HorizontalList>
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle">Starting Soon</ThemedText>
        <HorizontalList>
          <ExperienceCard
            title="Ghost Tour"
            description="Experience the paranormal history of downtown"
            estimatedDuration="2 hours"
            distance="2.1 miles away"
            status="Starts in 30min"
          />
        </HorizontalList>
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle">Join Ongoing Experiences</ThemedText>
        <HorizontalList>
          <ExperienceCard
            title="City-wide Scavenger Hunt"
            description="Join teams competing in this exciting urban adventure"
            estimatedDuration="4 hours remaining"
            distance="Various locations"
            status="In progress - can join"
          />
        </HorizontalList>
      </View>
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
  section: {
    padding: 16,
    gap: 12,
  },
});
