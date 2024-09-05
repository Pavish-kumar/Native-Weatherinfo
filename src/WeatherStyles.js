import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'lightblue',
        padding: 20,
        justifyContent:'center',
        alignItems:'center',
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    title: {
        textAlign: 'center',
        fontSize: 36,
        fontWeight: 'bold',
        color: '#C84B31',
        marginBottom: 20,
    },
    locationText: {
        textAlign: 'center',
        fontSize: 18,
        color: '#333',
        marginBottom: 10,
    },
    weatherContainer: {
        marginTop: 20,
        padding: 30,
        backgroundColor: '#f0f8ff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        width:500,
        elevation: 5,
        

    },
    weatherText: {
        fontSize: 20,
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
});

export default styles;
