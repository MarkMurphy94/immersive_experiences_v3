import { ExperiencePreviewCard } from '@/components/ExperiencePreviewCard';
import { HorizontalList } from '@/components/HorizontalList';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { FIRESTORE } from '@/FirebaseConfig';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

type Experience = {
  id: string;
  title: string;
  shortDescription: string;
  estimatedDuration: string;
  status: string;
  distance: string;
};


export default function HomeScreen() {
  const [featuredExperiences, setFeaturedExperiences] = useState<Experience[]>([]);
  const [upcomingExperiences, setUpcomingExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeaturedExperiences = async () => {
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

      setFeaturedExperiences(fetchedExperiences);
    } catch (error) {
      console.error('Error fetching experiences:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingExperiences = async () => {
    try {
      // Calculate the date 7 days from now
      const today = new Date();
      const sevenDaysLater = new Date();
      sevenDaysLater.setDate(today.getDate() + 7);

      const experiencesRef = collection(FIRESTORE, 'ExperienceCalendar');
      // Query for experiences starting between now and 7 days from now
      const q = query(
        experiencesRef,
        where('startDateTime', '>=', today),
        where('startDateTime', '<=', sevenDaysLater),
        limit(5)
      );

      const querySnapshot = await getDocs(q);
      const fetchedExperiences: Experience[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedExperiences.push({
          id: doc.id,
          title: data.title,
          shortDescription: data.shortDescription || 'Join this upcoming experience',
          estimatedDuration: '2 hours', // You might want to add this to your experience data
          status: 'Starting Soon', // Changed status to reflect upcoming nature
          distance: '', // You might want to calculate this based on user location
        });
      });

      setUpcomingExperiences(fetchedExperiences);
    } catch (error) {
      console.error('Error fetching upcoming experiences:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkUpcomingExperiencesForUser = async () => {
    // TODO: if user is part of any upcoming experiences, add "Your Upcoming Experiences" section
  }

  useEffect(() => {
    fetchFeaturedExperiences();
    // Also fetch upcoming experiences
    fetchUpcomingExperiences();
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
            featuredExperiences.map((experience) => (
              <ExperiencePreviewCard
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
          <ExperiencePreviewCard
            id="nearby-1"
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
          {loading ? (
            <ActivityIndicator size="large" color="#0a7ea4" />
          ) : upcomingExperiences.length > 0 ? (
            upcomingExperiences.map((experience) => (
              <ExperiencePreviewCard
                key={experience.id}
                id={experience.id}
                title={experience.title}
                description={experience.shortDescription}
                estimatedDuration={experience.estimatedDuration}
                distance={experience.distance}
                status={experience.status}
                source="calendar"
              />
            ))
          ) : (
            <ExperiencePreviewCard
              id="soon-1"
              title="Ghost Tour"
              description="Experience the paranormal history of downtown"
              estimatedDuration="2 hours"
              distance="2.1 miles away"
              status="Starts in 30min"
            />
          )}
        </HorizontalList>
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle">Join Ongoing Experiences</ThemedText>
        <HorizontalList>
          <ExperiencePreviewCard
            id="ongoing-1"
            title="City-wide Scavenger Hunt"
            description="Join teams competing in this exciting urban adventure"
            estimatedDuration="4 hours remaining"
            distance="Various locations"
            status="In progress - can join"
          />
          <ExperiencePreviewCard
            id="ongoing-2"
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
