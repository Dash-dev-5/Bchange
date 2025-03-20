import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { getData, saveData } from './firebaseGetAndPost';
import { useEffect, useLayoutEffect, useState } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { RadioButton } from 'react-native-paper';

export default function App() {
  const [data, setData] = useState([]);
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [studentInfo, setStudentInfo] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [statusColor, setStatusColor] = useState('#ffffff');
  const [statusText, setStatusText] = useState('');

  const scanHandler = (data) => {
    setScanned(true);
    try {
      scanStudentId(data);
    } catch (error) {
      alert('Données incorrectes');
    }
    setTimeout(() => {
      setScanned(false);
    }, 5000);
  };

  const getDataTing = async () => {
    const result = await getData('qv');
    setData(result);
  };

  const scanStudentId = async (scannedId) => {
    await getDataTing();
    const student = data.find(item => item.idEtudiant === scannedId);
    if (student) {
      setStudentInfo(student);
      checkPaymentStatus(student);
    } else {
      setStudentInfo({ error: 'Étudiant inconnu' });
      setStatusColor('red');
      setStatusText('Pas en ordre');
      setTimeout(() => {
        setStatusColor('#ffffff');
        setStatusText('');
      }, 3000);
    }
  };

  const checkPaymentStatus = (student) => {
    let isPaid = false;
    if (selectedOption === 'tranche1') isPaid = student.tranche1;
    if (selectedOption === 'tranche2') isPaid = student.tranche2;
    if (selectedOption === 'tranche3') isPaid = student.tranche3;
    if (selectedOption === 'enrol1') isPaid = student.enrolement1;
    if (selectedOption === 'enrol2') isPaid = student.enrolement2;
    if (selectedOption === 'enrol3') isPaid = student.enrolement3;
    
    if (isPaid) {
      setStatusColor('green');
      setStatusText('En ordre');
    } else {
      setStatusColor('red');
      setStatusText('Pas en ordre');
    }
    
    setTimeout(() => {
      setStatusColor('#ffffff');
      setStatusText('');
    }, 3000);
  };

  useLayoutEffect(() => {
    getDataTing();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: statusColor }]}> 
      <Image source={require('./assets/isipa.png')} style={styles.logo} />
      <CameraView style={styles.camera} facing={facing}
        onBarcodeScanned={!scanned ? ({ data }) => { data ? scanHandler(data) : console.log('none') } : () => { }}>
      </CameraView>

      <Text style={styles.statusText}>{statusText}</Text>

      <View style={styles.radioContainer}>
        <RadioButton.Group onValueChange={value => setSelectedOption(value)} value={selectedOption}>
          <View style={styles.radioRow}>
            <View style={styles.radioItem}><RadioButton value="tranche1" /><Text>1ère Tranche</Text></View>
            <View style={styles.radioItem}><RadioButton value="tranche2" /><Text>2ème Tranche</Text></View>
            <View style={styles.radioItem}><RadioButton value="tranche3" /><Text>3ème Tranche</Text></View>
          </View>
          <View style={styles.radioRow}>
            <View style={styles.radioItem}><RadioButton value="enrol1" /><Text>Enrol MS</Text></View>
            <View style={styles.radioItem}><RadioButton value="enrol2" /><Text>Enrol 1S</Text></View>
            <View style={styles.radioItem}><RadioButton value="enrol3" /><Text>Enrol 2S</Text></View>
          </View>
        </RadioButton.Group>
      </View>

      <View style={styles.dataContainer}>
        {studentInfo ? (
          studentInfo.error ? (
            <Text style={styles.errorText}>{studentInfo.error}</Text>
          ) : (
            <>
              <Text style={styles.dataText}>ID Étudiant : {studentInfo.idEtudiant}</Text>
              <Text style={styles.dataText}>Nom : {studentInfo.name}</Text>
              <Text style={styles.dataText}>Email : {studentInfo.email}</Text>
              <Text style={styles.dataText}>Auditoir : {studentInfo.auditoir}</Text>
            </>
          )
        ) : (
          <Text style={styles.dataText}>Scannez un ID étudiant pour voir les informations.</Text>
        )}
      </View>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 50, height: 75, marginBottom: 20 },
  camera: { width: '90%', height: 300, borderRadius: 10, overflow: 'hidden', marginBottom: 20 },
  radioContainer: { marginBottom: 20 },
  radioRow: { flexDirection: 'row', justifyContent: 'space-between', width: '90%', marginBottom: 10 },
  radioItem: { flexDirection: 'row', alignItems: 'center' },
  dataContainer: { marginTop: 20, padding: 15, backgroundColor: 'white', borderRadius: 10, width: '90%' },
  dataText: { fontSize: 16, color: '#333' },
  errorText: { fontSize: 16, color: 'red', fontWeight: 'bold' },
  statusText: { fontSize: 20, fontWeight: 'bold', marginVertical: 10 },
});
