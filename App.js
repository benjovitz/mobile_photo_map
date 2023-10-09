import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Image } from 'react-native';
import * as ImagePicker from "expo-image-picker"
import MapView, {Marker} from 'react-native-maps';
import { useEffect, useRef, useState } from 'react';
import * as Location from "expo-location"
import { collection, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useCollection } from "react-firebase-hooks/firestore"
import {ref, uploadBytes, getDownloadURL} from "firebase/storage"
import { app, database, storage } from './firebase.js';

export default function App() {
  const [values, loading, error] = useCollection(collection(database, "photoMarkers"))
  const data = values?.docs.map((doc => ({...doc.data(), id: doc.id})))
  const [uploadImagePath, setUploadImagePath] = useState()
  const [image, setImage] = useState()

  console.log(data)
  const [markers, setMarkers] = useState([])
  const [region, setRegion] = useState({
    latitude: 62,
    longitude: -7,
    latitudeDelta: 2,
    longitudeDelta: 2
  })
  const [currentMarker, setCurrentMarker] = useState({})
  const mapView = useRef(null) 
  const locationSub = useRef(null)

  useEffect(() => {
    uploadImage()
  }, [uploadImagePath])
  
  useEffect(() => {
    addMarkerToDatabase()
  }, [currentMarker])

  useEffect(() => {
    async function startListening(){
      let { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted"){
        alert("no access")
        return
      } 
      locationSub.current = await Location.watchPositionAsync({
        distanceInterval: 100,
        accuracy: Location.Accuracy.High
      }, (location) => {
        const newRegion = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 5,
          longitudeDelta: 5
        }
        setRegion(newRegion)
        if(mapView.current) {
          mapView.current.animateToRegion(newRegion)
        }
      })
    }
    startListening()
    return () => {
      if(locationSub.current){
        locationSub.current.remove()
      }
    }
  },[])

  


  async function launchImagePicker(){
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true
     })
     if(!result.canceled){
      setUploadImagePath(result.assets[0].uri)

     }
  }

  async function uploadImage(){
    const res = await fetch(uploadImagePath)
    const blob = await res.blob()
    const storageRef = ref(storage, `${currentMarker.key}.jpg`)
    uploadBytes(storageRef, blob).then((snapshot) => {
      alert("image uploaded")
    })
  }

  async function downloadImage(key){
    await getDownloadURL(ref(storage, `${key}.jpg`))
    .then((url) => {
      setImage(url)
    })
    .catch((err) => {
      alert(err)
    })
  }

  function addMarker(data){
    const {latitude, longitude} = data.nativeEvent.coordinate
    const newMarker = {
      coordinate: {latitude, longitude},
      key: data.timeStamp
    }
    console.log(newMarker.key)

    setMarkers([...markers, newMarker])
    setCurrentMarker(newMarker)

    launchImagePicker()

    
  }

  async function addMarkerToDatabase(){
    try{
    await addDoc(collection(database, "photoMarkers"),{
      coordinate: currentMarker.coordinate,
      key: currentMarker.key
    })
  } catch(err) {
    console.log(err)
  }
}
async function deleteFromDatabase(id){
  await deleteDoc(doc(database, "notes", id))
}


  function onMarkerPressedText(text){
    alert(`you pressed ${text}`)
  }

  return (
    <View>
      <MapView style={styles.map}
       region={region}
       onLongPress={addMarker}>
        {markers.map(marker => (
        <Marker coordinate={marker.coordinate}
        key={marker.key}
        onPress={() => downloadImage(marker.key)}
        />
       ))}
       
       </MapView>
       <Button title='get markers' onPress={() => setMarkers(data)}></Button>
       <Image style={{width: 200, height: 200}} source={{uri: image}}></Image>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "50%"
  },
});
