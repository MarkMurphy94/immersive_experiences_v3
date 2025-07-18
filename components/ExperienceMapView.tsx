import { ThemedText } from '@/components/ThemedText';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import GooglePlacesSDK from 'react-native-google-places-sdk';

const GOOGLE_PLACES_API_KEY: string = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "-------------";

type PlacePrediction = {
    description: string;
    placeID: string;
    primaryText: string;
    secondaryText: string;
    types: string[];
    distanceMeters: number;
}

type Location = {
    latitude: number;
    longitude: number;
    name: string;
    address: string;
    placeId?: string;
};

type Props = {
    visible: boolean;
    onClose: () => void;
    onLocationSelect?: (location: Location) => void;
};

export default function ExperienceMapView({ visible, onClose, onLocationSelect }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
    const [suggestions, setSuggestions] = useState<Location[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    // Initialize Google Places SDK
    useEffect(() => {
        const initializePlaces = async () => {
            try {
                await GooglePlacesSDK.initialize(GOOGLE_PLACES_API_KEY);
            } catch (error) {
                console.error("Failed to initialize Google Places SDK:", error);
            }
        };

        initializePlaces();

        return () => {
            // Clean up if needed
        };
    }, []);

    // Handle location selection
    const handleLocationSelect = (location: Location) => {
        setSelectedLocation(location);
        setSuggestions([]);
        setPredictions([]);
        setSearchQuery(location.name);
    };

    // Handle selection of place prediction
    const handlePredictionSelect = async (prediction: PlacePrediction) => {
        setIsSearching(true);
        try {
            // Get place details from the placeID
            // Since fetchPlaceDetails isn't available, we'll use what we have from the prediction
            // and create a location object
            const location: Location = {
                // Default to 0,0 coordinates since we don't have them from the prediction
                // In a real app, you might want to do a separate API call to get coordinates
                latitude: 0,
                longitude: 0,
                name: prediction.primaryText || prediction.description.split(',')[0],
                address: prediction.description,
                placeId: prediction.placeID
            };

            // You can use the Google Geocoding API to get the coordinates if needed
            try {
                const response = await fetch(
                    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(prediction.description)}&key=${GOOGLE_PLACES_API_KEY}`
                );
                const data = await response.json();

                if (data.results && data.results.length > 0) {
                    location.latitude = data.results[0].geometry.location.lat;
                    location.longitude = data.results[0].geometry.location.lng;
                }
            } catch (geoError) {
                console.error("Error fetching coordinates:", geoError);
            }

            handleLocationSelect(location);
        } catch (error) {
            console.error("Error handling place prediction:", error);
        } finally {
            setIsSearching(false);
        }
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
        setPredictions([]);
        setSelectedLocation(null);
        onClose();
    };

    // Search for locations based on query using Google Places SDK
    const handleSearch = async () => {
        if (!searchQuery.trim() || searchQuery.length < 3) return;

        setIsSearching(true);
        try {
            // Use fetchPredictions to get place predictions
            const placePredictions = await GooglePlacesSDK.fetchPredictions(
                searchQuery,
                {
                    countries: ["us"],  // Limit to US for now, can be expanded or made configurable
                }
            );
            console.log("Place Predictions:", placePredictions);
            setPredictions(placePredictions);

            // Clear any existing suggestions
            setSuggestions([]);
        } catch (error) {
            console.error("Error searching locations:", error);
            setPredictions([]);
        } finally {
            setIsSearching(false);
        }
    };

    // Render a prediction item
    const renderPredictionItem = ({ item }: { item: PlacePrediction }) => (
        <TouchableOpacity
            style={styles.suggestionItem}
            onPress={() => handlePredictionSelect(item)}
        >
            <ThemedText style={styles.suggestionName}>{item.primaryText}</ThemedText>
            <ThemedText style={styles.suggestionAddress}>{item.secondaryText}</ThemedText>
        </TouchableOpacity>
    );

    // Render a suggestion item (legacy, can be used for custom suggestions)
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

                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search for a location"
                            value={searchQuery}
                            onChangeText={(text) => {
                                setSearchQuery(text);
                                if (text.length > 2) { // Only search when text is at least 3 characters
                                    handleSearch();
                                } else {
                                    setPredictions([]);
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

                    {predictions.length > 0 && (
                        <View style={styles.suggestionsContainer}>
                            <FlatList
                                data={predictions}
                                renderItem={renderPredictionItem}
                                keyExtractor={(item) => item.placeID}
                                showsVerticalScrollIndicator={false}
                                style={styles.suggestionsList}
                            />
                        </View>
                    )}

                    {suggestions.length > 0 && predictions.length === 0 && (
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
                    )}

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
        height: 200,
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