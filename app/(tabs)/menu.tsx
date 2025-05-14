import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { FIREBASE_AUTH } from '@/FirebaseConfig';
import { useColorScheme } from '@/hooks/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

type MenuItem = {
    icon: any;
    title: string;
    onPress: () => void;
};

export default function MenuScreen() {
    const theme = useColorScheme() ?? 'light';
    const iconColor = Colors[theme].icon;

    const menuItems: MenuItem[] = [
        // {
        //     icon: 'person.crop.circle',
        //     title: 'Account Settings',
        //     onPress: () => router.push('/settings/account'),
        // },
        // {
        //     icon: 'bell',
        //     title: 'Notifications',
        //     onPress: () => router.push('/settings/notifications'),
        // },
        // {
        //     icon: 'lock',
        //     title: 'Privacy',
        //     onPress: () => router.push('/settings/privacy'),
        // },
        // {
        //     icon: 'questionmark.circle',
        //     title: 'Help & Support',
        //     onPress: () => router.push('/support'),
        // },
        // {
        //     icon: 'info.circle',
        //     title: 'About',
        //     onPress: () => router.push('/about'),
        // },
    ];

    const logOut = async () => {
        try {
            await FIREBASE_AUTH.signOut();
            // Clear stored authentication data
            await AsyncStorage.multiRemove(['@user_token', '@user_id']);
            // Navigate to home screen
            router.replace('/');
        } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Error', 'Failed to log out. Please try again.');
        }
    }

    return (
        <ThemedView style={styles.container}>
            <ThemedView style={styles.header}>
                <ThemedText type="title">Menu</ThemedText>
            </ThemedView>

            <View style={styles.content}>
                {menuItems.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.menuItem}
                        onPress={item.onPress}
                    >
                        <IconSymbol name={item.icon} size={24} color={iconColor} />
                        <ThemedText style={styles.menuText}>{item.title}</ThemedText>
                    </TouchableOpacity>
                ))}

                <TouchableOpacity
                    style={[styles.menuItem, styles.logout]}
                    onPress={() => logOut()}
                >
                    <IconSymbol name="power" size={24} color="#FF3B30" />
                    <ThemedText style={[styles.menuText, styles.logoutText]}>Log Out</ThemedText>
                </TouchableOpacity>
            </View>
        </ThemedView>
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
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
    },
    menuText: {
        fontSize: 16,
    },
    logout: {
        marginTop: 24,
    },
    logoutText: {
        color: '#FF3B30',
    },
});
