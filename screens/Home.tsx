// Home.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import * as api from '../app/components/api';
import { useAuth } from '../app/context/AuthContext';
import axios from 'axios';
import { format, subDays, subWeeks, subMonths, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

type Journal = {
    id: number;
    title: string;
    content: string;
    category: {
        id: number;
        name: string;
    };
    created_at: string;
};

type Category = {
    id: number;
    name: string;
};

const Home: React.FC = () => {
    const { onLogout, loadUser } = useAuth();
    const [user, setUser] = useState<any>(null);
    const [journals, setJournals] = useState<Journal[]>([]);
    const [showLogout, setShowLogout] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [newJournal, setNewJournal] = useState({ title: '', content: '', category_id: '' });
    const [journalToUpdate, setJournalToUpdate] = useState<Journal | null>(null);
    const [summaryPeriod, setSummaryPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
    const [summary, setSummary] = useState<{ [key: string]: number }>({});

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        fetchJournals();
        fetchSummary();
    }, [selectedCategory, summaryPeriod]);

    useEffect(() => {
        if (journalToUpdate) {
            setNewJournal({
                title: journalToUpdate.title,
                content: journalToUpdate.content,
                category_id: journalToUpdate.category.id.toString(),
            });
        }
    }, [journalToUpdate]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const userData = await loadUser();
            const categoriesData = await api.fetchCategories();
            setUser(userData);
            setCategories(categoriesData);
            await fetchJournals();
            await fetchSummary();
        } catch (error) {
            console.error('Error fetching data:', error);
            handleAuthError(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchJournals = async () => {
        try {
            const journalsData = await api.fetchJournals(selectedCategory || undefined);
            setJournals(journalsData);
        } catch (error) {
            console.error('Error fetching journals:', error);
            handleAuthError(error);
        }
    };

    const fetchSummary = async () => {
        try {
            const journals = await api.fetchJournals();
            const now = new Date();
            let startDate, endDate;

            switch (summaryPeriod) {
                case 'daily':
                    startDate = startOfDay(now);
                    endDate = endOfDay(now);
                    break;
                case 'weekly':
                    startDate = startOfWeek(now);
                    endDate = endOfWeek(now);
                    break;
                case 'monthly':
                    startDate = startOfMonth(now);
                    endDate = endOfMonth(now);
                    break;
            }

            const filteredJournals = journals.filter((journal: Journal) => {
                const journalDate = new Date(journal.created_at);
                return journalDate >= startDate && journalDate <= endDate;
            });

            const summaryCounts: { [key: string]: number } = {};
            filteredJournals.forEach((journal: Journal) => {
                const key = format(new Date(journal.created_at), 'yyyy-MM-dd');
                summaryCounts[key] = (summaryCounts[key] || 0) + 1;
            });

            setSummary(summaryCounts);
        } catch (error) {
            console.error('Error fetching summary:', error);
            handleAuthError(error);
        }
    };

    const handleSaveJournal = async () => {
        try {
            if (journalToUpdate) {
                await api.updateJournal(journalToUpdate.id, newJournal);
            } else {
                await api.addJournal(newJournal);
            }
            setModalVisible(false);
            setNewJournal({ title: '', content: '', category_id: '' });
            setJournalToUpdate(null);
            fetchJournals();
            fetchSummary();
        } catch (error) {
            console.error('Error saving journal:', error);
            handleAuthError(error);
        }
    };

    const handleUpdateJournal = (journal: Journal) => {
        setJournalToUpdate(journal);
        setModalVisible(true);
    };

    const handleDeleteJournal = async (id: number) => {
        try {
            await api.deleteJournal(id);
            fetchJournals();
            fetchSummary();
        } catch (error) {
            console.error('Error deleting journal:', error);
            handleAuthError(error);
        }
    };

    const handleLogout = async () => {
        if (onLogout) {
            await onLogout();
        }
    };

    const handleAuthError = (error: any) => {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            Alert.alert('Session Expired', 'Please log in again.');
            handleLogout();
        }
    };

    const renderJournalItem = ({ item }: { item: Journal }) => (
        <View style={styles.journalItem}>
            <Text style={styles.journalTitle}>{item.title}</Text>
            <Text style={styles.journalCategory}>{item.category.name}</Text>
            <Text style={styles.journalContent}>{item.content.substring(0, 100)}...</Text>
            <View style={styles.journalActions}>
                <TouchableOpacity onPress={() => handleUpdateJournal(item)} style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>Update</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteJournal(item.id)} style={[styles.actionButton, styles.deleteButton]}>
                    <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderSummary = () => (
        <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Journal Summary ({summaryPeriod})</Text>
            <View style={styles.summaryPeriodPicker}>
                <TouchableOpacity
                    style={[styles.periodButton, summaryPeriod === 'daily' && styles.activePeriodButton]}
                    onPress={() => setSummaryPeriod('daily')}
                >
                    <Text style={styles.periodButtonText}>Daily</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.periodButton, summaryPeriod === 'weekly' && styles.activePeriodButton]}
                    onPress={() => setSummaryPeriod('weekly')}
                >
                    <Text style={styles.periodButtonText}>Weekly</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.periodButton, summaryPeriod === 'monthly' && styles.activePeriodButton]}
                    onPress={() => setSummaryPeriod('monthly')}
                >
                    <Text style={styles.periodButtonText}>Monthly</Text>
                </TouchableOpacity>
            </View>
            {Object.entries(summary).map(([date, count]) => (
                <Text key={date} style={styles.summaryItem}>
                    {format(new Date(date), 'MMM d, yyyy')}: {count} entries
                </Text>
            ))}
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.companyName}>Journal App</Text>
                <TouchableOpacity onPress={() => setShowLogout(!showLogout)} style={styles.profileIcon}>
                    <Icon name="person-circle-outline" size={30} color="#000" />
                </TouchableOpacity>
            </View>

            {showLogout && (
                <View style={styles.logoutDropdown}>
                    <Text style={styles.welcomeText}>Welcome {user?.username}</Text>
                    <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            )}

            {renderSummary()}

            <TouchableOpacity style={styles.addButton} onPress={() => {
                setJournalToUpdate(null);
                setNewJournal({ title: '', content: '', category_id: '' });
                setModalVisible(true);
            }}>
                <Text style={styles.addButtonText}>Add Journal</Text>
            </TouchableOpacity>

            <View style={styles.categoryPicker}>
                <Picker
                    selectedValue={selectedCategory}
                    onValueChange={(itemValue) => setSelectedCategory(itemValue)}
                    style={styles.picker}
                >
                    <Picker.Item label="All Categories" value={null} />
                    {categories.map((category) => (
                        <Picker.Item key={category.id} label={category.name} value={category.id} />
                    ))}
                </Picker>
            </View>

            {journals.length > 0 ? (
                <FlatList
                    data={journals}
                    renderItem={renderJournalItem}
                    keyExtractor={(item) => item.id.toString()}
                    style={styles.journalList}
                />
            ) : (
                <Text style={styles.noJournalsText}>No uploaded journals</Text>
            )}

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(false);
                    setJournalToUpdate(null);
                    setNewJournal({ title: '', content: '', category_id: '' });
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <TextInput
                            style={styles.input}
                            placeholder="Title"
                            value={newJournal.title}
                            onChangeText={(text) => setNewJournal({ ...newJournal, title: text })}
                        />
                        <TextInput
                            style={[styles.input, styles.contentInput]}
                            placeholder="Content"
                            multiline
                            value={newJournal.content}
                            onChangeText={(text) => setNewJournal({ ...newJournal, content: text })}
                        />
                        <Picker
                            selectedValue={newJournal.category_id}
                            onValueChange={(itemValue) => setNewJournal({ ...newJournal, category_id: itemValue })}
                            style={styles.picker}
                        >
                            <Picker.Item label="Select Category" value="" />
                            {categories.map((category) => (
                                <Picker.Item key={category.id} label={category.name} value={category.id.toString()} />
                            ))}
                        </Picker>
                        <TouchableOpacity style={styles.addButton} onPress={handleSaveJournal}>
                            <Text style={styles.addButtonText}>{journalToUpdate ? 'Update Journal' : 'Save Journal'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cancelButton} onPress={() => {
                            setModalVisible(false);
                            setJournalToUpdate(null);
                            setNewJournal({ title: '', content: '', category_id: '' });
                        }}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    companyName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    profileIcon: {
        padding: 5,
    },
    logoutDropdown: {
        position: 'absolute',
        top: 70,
        right: 20,
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        zIndex: 1000,
    },
    welcomeText: {
        marginBottom: 10,
        fontSize: 16,
    },
    logoutButton: {
        backgroundColor: '#ff4444',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    logoutText: {
        color: 'white',
        fontWeight: 'bold',
    },
    addButton: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        margin: 20,
    },
    addButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    categoryPicker: {
        backgroundColor: '#ffffff',
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    picker: {
        height: 50,
    },
    journalList: {
        flex: 1,
        paddingHorizontal: 20,
    },
    journalItem: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        marginBottom: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
    },
    journalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    journalCategory: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    journalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 15,
    },
    actionButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 5,
        backgroundColor: '#2196F3',
        marginLeft: 10,
    },
    deleteButton: {
        backgroundColor: '#FF5252',
    },
    actionButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    noJournalsText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#666',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
    },
    contentInput: {
        height: 100,
        textAlignVertical: 'top',
    },
    cancelButton: {
        backgroundColor: '#ccc',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    cancelButtonText: {
        color: '#333',
        fontWeight: 'bold',
    },
    journalContent: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    summaryContainer: {
        backgroundColor: '#ffffff',
        padding: 15,
        margin: 20,
        borderRadius: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    summaryPeriodPicker: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    periodButton: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        backgroundColor: '#e0e0e0',
    },
    activePeriodButton: {
        backgroundColor: '#2196F3',
    },
    periodButtonText: {
        color: '#333',
        fontWeight: 'bold',
    },
    summaryItem: {
        fontSize: 14,
        marginBottom: 5,
    },
});

export default Home;