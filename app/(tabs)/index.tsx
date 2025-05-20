import { ExperienceCard } from '@/components/ExperienceCard';
import { HorizontalList } from '@/components/HorizontalList';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { FIRESTORE } from '@/FirebaseConfig';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

type Experience = {
  id: string;
  title: string;
  shortDescription: string;
  estimatedDuration?: string;
  status?: string;
  distance?: string;
};


export default function HomeScreen() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExperiencesFromFirebase = async () => {
    try {
      const experiencesRef = collection(FIRESTORE, 'ImmersiveExperiences');
      const q = query(experiencesRef, limit(5)); // Limit to 5 featured experiences
      const querySnapshot = await getDocs(q);
      const fetchedExperiences: Experience[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedExperiences.push({
          id: doc.id,
          title: data.title,
          shortDescription: data.shortDescription,
          estimatedDuration: '2 hours', // You might want to add this to your experience data
          status: 'Ready to Play!', // You might want to add this to your experience data
          distance: '', // You might want to calculate this based on user location
        });
      });

      setExperiences(fetchedExperiences);
    } catch (error) {
      console.error('Error fetching experiences:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkUpcomingExperiencesForUser = async () => {
    // TODO: if user is part of any upcoming experiences, add "Your Upcoming Experiences" section
  }

  useEffect(() => {
    fetchExperiencesFromFirebase();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Immersive Experiences</ThemedText>
      </ThemedView>

      <View style={styles.section}>
        <ThemedText type="subtitle">Featured Experiences</ThemedText>
        <HorizontalList>
          {loading ? (
            <ActivityIndicator size="large" color="#0a7ea4" />
          ) : (
            experiences.map((experience) => (
              <ExperienceCard
                key={experience.id}
                id={experience.id}
                title={experience.title}
                description={experience.shortDescription}
                estimatedDuration={experience.estimatedDuration}
                distance={experience.distance}
                status={experience.status}
              />
            ))
          )}
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
          <ExperienceCard
            title="Cops 'n Robbers"
            description="Be a cop or be a robber"
            estimatedDuration="4 hours remaining"
            distance="Various locations"
            status="No Characters Available"
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
