// import React, { useRef, useState } from 'react';
// import { Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// import MapView, { Callout, Marker, PROVIDER_GOOGLE } from 'react-native-maps';

// const { width, height } = Dimensions.get("window")
// const ASPECT_RATIO = width / height
// const LATITUDE_DELTA = 0.02
// const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO

// type Location = {
//     latitude: number;
//     longitude: number;
//     name: string;
//     address: string;
// }

// type Props = {
//     onLocationSelect?: (location: Location) => void;
// }

// const ExperienceMapView = ({ onLocationSelect }: Props) => {
//     const [marker, setMarker] = useState<Location[]>([]);
//     const [searchQuery, setSearchQuery] = useState('');
//     const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
//     const map = useRef<MapView>(null);
//     const [initialRegion, setInitialRegion] = useState({
//         latitude: 37.78825,  // Default to San Francisco
//         longitude: -122.4324,
//         latitudeDelta: LATITUDE_DELTA,
//         longitudeDelta: LONGITUDE_DELTA,
//     });

//     const handleMapPress = async (e: any) => {
//         const coordinate = e.nativeEvent.coordinate;
//         try {
//             const response = await fetch(
//                 `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinate.latitude},${coordinate.longitude}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`
//             );
//             const data = await response.json();

//             if (data.results && data.results.length > 0) {
//                 const place = data.results[0];
//                 const newLocation: Location = {
//                     latitude: coordinate.latitude,
//                     longitude: coordinate.longitude,
//                     name: place.formatted_address,
//                     address: place.formatted_address
//                 };
//                 setMarker([newLocation]);
//                 setSelectedLocation(newLocation);
//                 if (onLocationSelect) {
//                     onLocationSelect(newLocation);
//                 }
//             }
//         } catch (e) {
//             console.log("Reverse geocoding error:", e);
//         }
//     };

//     const handleSearch = async () => {
//         try {
//             const response = await fetch(
//                 `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchQuery)}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`
//             );
//             const data = await response.json();

//             if (data.results && data.results.length > 0) {
//                 const place = data.results[0];
//                 const newLocation: Location = {
//                     latitude: place.geometry.location.lat,
//                     longitude: place.geometry.location.lng,
//                     name: place.formatted_address,
//                     address: place.formatted_address
//                 };
//                 setMarker([newLocation]);
//                 setSelectedLocation(newLocation);
//                 if (onLocationSelect) {
//                     onLocationSelect(newLocation);
//                 }

//                 map.current?.animateToRegion({
//                     latitude: newLocation.latitude,
//                     longitude: newLocation.longitude,
//                     latitudeDelta: LATITUDE_DELTA,
//                     longitudeDelta: LONGITUDE_DELTA,
//                 });
//             }
//         } catch (e) {
//             console.log("Geocoding error:", e);
//         }
//     };

//     return (
//         <View style={styles.container}>
//             <View style={styles.searchContainer}>
//                 <TextInput
//                     style={styles.searchInput}
//                     placeholder="Search for a location"
//                     value={searchQuery}
//                     onChangeText={setSearchQuery}
//                     onSubmitEditing={handleSearch}
//                 />
//                 <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
//                     <Text>Search</Text>
//                 </TouchableOpacity>
//             </View>

//             <MapView
//                 ref={map}
//                 style={styles.map}
//                 provider={PROVIDER_GOOGLE}
//                 initialRegion={initialRegion}
//                 onPress={handleMapPress}
//                 showsUserLocation={true}
//             >
//                 {marker.map((m, i) => (
//                     <Marker
//                         key={i}
//                         coordinate={{
//                             latitude: m.latitude,
//                             longitude: m.longitude,
//                         }}
//                     >
//                         <Callout>
//                             <View style={styles.calloutContainer}>
//                                 <Text style={styles.calloutTitle}>{m.name}</Text>
//                                 <Text style={styles.calloutAddress}>{m.address}</Text>
//                             </View>
//                         </Callout>
//                     </Marker>
//                 ))}
//             </MapView>

//             {selectedLocation && (
//                 <View style={styles.selectedLocationContainer}>
//                     <Text style={styles.selectedLocationText}>
//                         Selected: {selectedLocation.name}
//                     </Text>
//                 </View>
//             )}
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//     },
//     map: {
//         width: '100%',
//         height: '100%',
//     },
//     searchContainer: {
//         position: 'absolute',
//         top: 10,
//         left: 10,
//         right: 10,
//         zIndex: 1,
//         flexDirection: 'row',
//         gap: 10,
//     },
//     searchInput: {
//         flex: 1,
//         height: 40,
//         backgroundColor: 'white',
//         borderRadius: 8,
//         paddingHorizontal: 10,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.25,
//         shadowRadius: 3.84,
//         elevation: 5,
//     },
//     searchButton: {
//         backgroundColor: 'white',
//         padding: 10,
//         borderRadius: 8,
//         justifyContent: 'center',
//         alignItems: 'center',
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.25,
//         shadowRadius: 3.84,
//         elevation: 5,
//     },
//     calloutContainer: {
//         padding: 10,
//         maxWidth: 200,
//     },
//     calloutTitle: {
//         fontWeight: 'bold',
//         marginBottom: 5,
//     },
//     calloutAddress: {
//         fontSize: 12,
//     },
//     selectedLocationContainer: {
//         position: 'absolute',
//         bottom: 20,
//         left: 10,
//         right: 10,
//         backgroundColor: 'white',
//         padding: 10,
//         borderRadius: 8,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.25,
//         shadowRadius: 3.84,
//         elevation: 5,
//     },
//     selectedLocationText: {
//         textAlign: 'center',
//     },
// });

// export default ExperienceMapView;