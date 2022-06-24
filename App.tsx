/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React from 'react';
import {useState} from 'react';
import {
  View,
  Text,
  Button,
  PermissionsAndroid,
  Alert,
  SafeAreaView,
  StyleSheet,
  TextInput,
} from 'react-native';
// @ts-ignore
import SMS from 'react-native-get-sms-android';
import io, {Socket} from 'socket.io-client';
//@ts-ignore

const style = StyleSheet.create({
  text: {
    fontSize: 30,
    textAlign: 'center',
    color: 'white',
  },
  view: {
    marginBottom: 20,
    marginTop: 20,
  },
  _view: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnAction: {
    paddingRight: 20,
    paddingLeft: 20,
    paddingBottom: 20,
  },
  textInput: {
    borderRadius: 5,
    borderColor: 'white',
    borderWidth: 1,
    padding: 10,
  },
});
type List = {phoneNumber: string; otp: number; message: string};
const App = () => {
  const [address, setAddress] = useState<string>('192.168.1.8');
  const [port, setPort] = useState<string>('5000');
  const [isStart, setStart] = useState<boolean>(false);
  const [socket, setSocket] = useState<Socket>(io());
  const [list, setList] = useState<Array<List>>([]);

  const requestMessage = async () => {
    try {
      const grantedSendSMS = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.SEND_SMS,
      );
      const grantedReadSMS = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS,
      );
      if (
        grantedReadSMS === PermissionsAndroid.RESULTS.GRANTED &&
        grantedSendSMS === PermissionsAndroid.RESULTS.GRANTED
      ) {
        Alert.alert('Notification', 'Request success');
      }
    } catch (err) {
      console.warn(err);
    }
  };
  const sendSMS = async (phoneNumber: string, otp: string) => {
    SMS.autoSend(
      phoneNumber,
      `Verify account otp: ${otp}`,
      // @ts-ignore
      fail => {
        let user: List = {
          phoneNumber: phoneNumber,
          otp: +otp,
          message: fail,
        };
        setList(prevList => [...prevList, user]);
      },
      // @ts-ignore
      success => {
        let user: List = {
          phoneNumber: phoneNumber,
          otp: +otp,
          message: 'Success',
        };
        setList(prevList => [...prevList, user]);
        console.log(success);
      },
    );
  };

  const InitializeSocket = () => {
    setStart(true);
    let ip = `http://${address}:${port}`;
    let _socket = io(ip);
    setSocket(_socket);
    _socket.on('emitMessage', arg => {
      sendSMS(arg.phoneNumber, arg.otp);
      _socket.emit('sendSuccess', arg);
    });
  };
  return (
    <SafeAreaView>
      <View>
        <Text style={style.text}>Send Message Gateway</Text>
        <View style={style.view}>
          <View style={style._view}>
            <Button
              title="Request Permission SMS"
              onPress={requestMessage}
              color="green"
            />
          </View>
        </View>
        <View style={{paddingRight: 20, paddingLeft: 20, marginBottom: 20}}>
          <Text style={{marginBottom: 10}}> IP Server</Text>
          <TextInput
            style={style.textInput}
            placeholder="IP Server"
            maxLength={15}
            onChangeText={setAddress}
            textAlign={'center'}
            editable={!isStart}
            value={address}
          />
        </View>

        <View style={{paddingRight: 20, paddingLeft: 20, marginBottom: 20}}>
          <Text style={{marginBottom: 10}}>Port</Text>
          <TextInput
            style={style.textInput}
            placeholder="Port"
            maxLength={5}
            keyboardType="phone-pad"
            onChangeText={setPort}
            textAlign={'center'}
            editable={!isStart}
            value={port}
          />
        </View>
        <View style={{paddingRight: 20, paddingLeft: 20, marginBottom: 20}}>
          <Text>
            IP Address: {address}:{port}
          </Text>
          <Text>Status: {isStart ? 'Started' : 'Stopped'}</Text>
        </View>
        <View style={style.btnAction}>
          <Button
            title="Start"
            onPress={InitializeSocket}
            color="green"
            disabled={isStart}
          />
        </View>
        <View style={style.btnAction}>
          <Button
            title="Stop"
            onPress={() => {
              setStart(false);
              socket.disconnect();
            }}
            disabled={!isStart}
            color="red"
          />
        </View>
      </View>

      <View style={{paddingRight: 20, paddingLeft: 20, marginBottom: 20}}>
        <Text
          style={{
            fontWeight: 'bold',
            fontSize: 30,
            textTransform: 'uppercase',
            color: 'white',
          }}>
          List
        </Text>
        {list.map((item: List, i) => (
          <Text key={i}>
            {item.phoneNumber} - {item.otp} - Success
          </Text>
        ))}
      </View>
    </SafeAreaView>
  );
};
export default App;
