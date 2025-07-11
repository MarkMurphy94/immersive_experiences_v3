import { ThemedText } from '@/components/ThemedText';
import React, { useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';


type Location = {
    latitude: number;
    longitude: number;
    name: string;
    address: string;
};

type Props = {
    visible: boolean;
    onClose: () => void;
    onLocationSelect?: (location: Location) => void;
};

export default function ExperienceMapView({ visible, onClose, onLocationSelect }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Location[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    // Handle location selection
    const handleLocationSelect = (location: Location) => {
        setSelectedLocation(location);
        setSuggestions([]);
        setSearchQuery(location.name);
    };

    // Handle confirmation and close modal
    const handleConfirmLocation = () => {
        if (selectedLocation && onLocationSelect) {
            onLocationSelect(selectedLocation);
        }
        onClose();
    };

    // Reset the component state when closing
    const handleClose = () => {
        setSearchQuery('');
        setSuggestions([]);
        setSelectedLocation(null);
        onClose();
    };

    // Search for locations based on query
    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchQuery)}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`
            );
            const data = await response.json();
            console.log("Geocode API response:", data);

            if (data.results && data.results.length > 0) {
                // Map API results to Location objects
                const locationSuggestions = data.results.map((place: any) => ({
                    latitude: place.geometry.location.lat,
                    longitude: place.geometry.location.lng,
                    name: place.formatted_address.split(',')[0],
                    address: place.formatted_address
                }));

                setSuggestions(locationSuggestions);
            } else {
                setSuggestions([]);
            }
        } catch (error) {
            console.error("Error searching location:", error);
            setSuggestions([]);
        } finally {
            setIsSearching(false);
        }
    };

    // Render a suggestion item
    const renderSuggestionItem = ({ item }: { item: Location }) => (
        <TouchableOpacity
            style={styles.suggestionItem}
            onPress={() => handleLocationSelect(item)}
        >
            <ThemedText style={styles.suggestionName}>{item.name}</ThemedText>
            <ThemedText style={styles.suggestionAddress}>{item.address}</ThemedText>
        </TouchableOpacity>
    );

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={handleClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <ThemedText style={styles.modalTitle}>Select Location</ThemedText>

                    {/* <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search for a location"
                            value={searchQuery}
                            onChangeText={(text) => {
                                setSearchQuery(text);
                                if (text.length > 2) { // Only search when text is at least 3 characters
                                    handleSearch();
                                } else {
                                    setSuggestions([]);
                                }
                            }}
                            onSubmitEditing={handleSearch}
                        />
                        <TouchableOpacity
                            style={styles.searchButton}
                            onPress={handleSearch}
                            disabled={isSearching || searchQuery.length < 3}
                        >
                            {isSearching ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <ThemedText style={styles.buttonText}>Search</ThemedText>
                            )}
                        </TouchableOpacity>
                    </View>

                    {suggestions.length > 0 && (
                        <View style={styles.suggestionsContainer}>
                            <FlatList
                                data={suggestions}
                                renderItem={renderSuggestionItem}
                                keyExtractor={(item, index) => index.toString()}
                                showsVerticalScrollIndicator={false}
                                style={styles.suggestionsList}
                            />
                        </View>
                    )}

                    {selectedLocation && (
                        <View style={styles.selectedLocationContainer}>
                            <ThemedText style={styles.selectedLocationText}>
                                Selected Location:
                            </ThemedText>
                            <ThemedText style={styles.selectedLocationName}>
                                {selectedLocation.name}
                            </ThemedText>
                            <ThemedText style={styles.selectedLocationAddress}>
                                {selectedLocation.address}
                            </ThemedText>
                        </View>
                    )} */}

                    <GooglePlacesAutocomplete
                        placeholder='Search'
                        predefinedPlaces={[]}
                        // textInputProps={{}}
                        // minLength={2}
                        // styles={{}}
                        // keyboardShouldPersistTaps='handled'
                        onPress={(data, details = null) => {
                            // 'details' is provided when fetchDetails = true
                            console.log(data, details);
                        }}
                        query={{
                            key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
                            language: 'en',
                        }}
                    />

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={handleClose}
                        >
                            <ThemedText>Cancel</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.confirmButton]}
                            onPress={handleConfirmLocation}
                            disabled={!selectedLocation}
                        >
                            <ThemedText style={styles.confirmButtonText}>
                                Confirm Location
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    modalContent: {
        width: '90%',
        maxHeight: '80%',
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 10,
    },
    searchInput: {
        flex: 1,
        height: 40,
        backgroundColor: 'white',
        borderRadius: 8,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    searchButton: {
        backgroundColor: '#0a7ea4',
        padding: 10,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 80,
    },
    buttonText: {
        color: 'white',
    },
    suggestionsContainer: {
        maxHeight: 200,
        backgroundColor: 'white',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 10,
    },
    suggestionsList: {
        flex: 1,
    },
    suggestionItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    suggestionName: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    suggestionAddress: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    selectedLocationContainer: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 16,
    },
    selectedLocationText: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 5,
    },
    selectedLocationName: {
        fontSize: 16,
        marginBottom: 3,
    },
    selectedLocationAddress: {
        color: '#666',
        marginBottom: 5,
        fontSize: 14,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    button: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    confirmButton: {
        backgroundColor: '#0a7ea4',
    },
    confirmButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});