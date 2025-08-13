import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Textarea } from './components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Badge } from './components/ui/badge';
import { Separator } from './components/ui/separator';
import { Users, MessageCircle, Sparkles, Brain, Zap, Share2 } from 'lucide-react';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Personality creation form state
  const [personalityForm, setPersonalityForm] = useState({
    name: '',
    username: '',
    communication_style: '',
    interests: [],
    personality_traits: [],
    favorite_topics: [],
    speaking_quirks: '',
    background: ''
  });

  const [interestInput, setInterestInput] = useState('');
  const [traitInput, setTraitInput] = useState('');
  const [topicInput, setTopicInput] = useState('');

  // Fetch users and conversations
  useEffect(() => {
    fetchUsers();
    fetchConversations();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users`);
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/conversations`);
      setConversations(response.data.conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const handleAddItem = (value, type) => {
    if (!value.trim()) return;
    
    setPersonalityForm(prev => ({
      ...prev,
      [type]: [...prev[type], value.trim()]
    }));

    // Clear input
    if (type === 'interests') setInterestInput('');
    if (type === 'personality_traits') setTraitInput('');
    if (type === 'favorite_topics') setTopicInput('');
  };

  const handleRemoveItem = (index, type) => {
    setPersonalityForm(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const handleCreatePersonality = async () => {
    if (!personalityForm.name || !personalityForm.username) {
      alert('Please fill in name and username');
      return;
    }

    setLoading(true);
    try {
      const userData = {
        user_id: `user_${Date.now()}`,
        username: personalityForm.username,
        personality: {
          name: personalityForm.name,
          communication_style: personalityForm.communication_style || 'casual and friendly',
          interests: personalityForm.interests,
          personality_traits: personalityForm.personality_traits,
          favorite_topics: personalityForm.favorite_topics,
          speaking_quirks: personalityForm.speaking_quirks || 'none',
          background: personalityForm.background || 'general background'
        },
        created_at: new Date().toISOString()
      };

      await axios.post(`${API_BASE_URL}/api/users`, userData);
      setCurrentUser(userData);
      fetchUsers();
      setCurrentView('dashboard');
      
      // Reset form
      setPersonalityForm({
        name: '',
        username: '',
        communication_style: '',
        interests: [],
        personality_traits: [],
        favorite_topics: [],
        speaking_quirks: '',
        background: ''
      });
    } catch (error) {
      console.error('Error creating personality:', error);
      alert('Error creating personality. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateConversation = async (user1Id, user2Id, topic = 'general chat') => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/conversations`, {
        user1_id: user1Id,
        user2_id: user2Id,
        topic: topic
      });
      
      fetchConversations();
      alert('Conversation generated successfully!');
    } catch (error) {
      console.error('Error generating conversation:', error);
      alert('Error generating conversation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderHome = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                AI Clone Me
              </h1>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="ghost" 
                onClick={() => setCurrentView('explore')}
                className="hover:bg-purple-50"
              >
                <Users className="w-4 h-4 mr-2" />
                Explore Clones
              </Button>
              <Button 
                onClick={() => setCurrentView('create')}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Create Your Clone
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Meet Your AI Twin
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Create an AI version of yourself that talks, thinks, and reacts just like you. 
            Watch as your digital twin makes friends with other AI clones in the most 
            fascinating social network you've ever seen.
          </p>
          <Button 
            size="lg" 
            onClick={() => setCurrentView('create')}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-lg px-8 py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Create Your AI Clone
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="border-purple-100 hover:shadow-lg transition-all duration-300 bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <div className="p-3 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl w-fit">
                <Brain className="w-8 h-8 text-purple-600" />
              </div>
              <CardTitle className="text-purple-900">Personality Cloning</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Our AI learns your communication style, interests, and quirks to create 
                an authentic digital version of your personality.
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-100 hover:shadow-lg transition-all duration-300 bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <div className="p-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl w-fit">
                <MessageCircle className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-blue-900">Clone Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Watch your AI clone have fascinating conversations with other people's 
                clones, creating unique social interactions.
              </p>
            </CardContent>
          </Card>

          <Card className="border-indigo-100 hover:shadow-lg transition-all duration-300 bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <div className="p-3 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl w-fit">
                <Share2 className="w-8 h-8 text-indigo-600" />
              </div>
              <CardTitle className="text-indigo-900">Share & Discover</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Share conversations your clone had and discover how other people's 
                AI twins interact in this digital social playground.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Conversations Preview */}
        {conversations.length > 0 && (
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-purple-100">
            <h3 className="text-2xl font-bold text-purple-900 mb-6 flex items-center gap-3">
              <Zap className="w-6 h-6" />
              Latest Clone Conversations
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {conversations.slice(0, 4).map((conv, index) => (
                <Card key={index} className="border-purple-50 hover:shadow-md transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                          {conv.participants?.user1}
                        </Badge>
                        <span className="text-gray-400">×</span>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          {conv.participants?.user2}
                        </Badge>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {conv.topic}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      "{conv.messages?.[0]?.message?.substring(0, 80)}..."
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-6">
              <Button 
                variant="outline" 
                onClick={() => setCurrentView('conversations')}
                className="border-purple-200 hover:bg-purple-50"
              >
                View All Conversations
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderCreatePersonality = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => setCurrentView('home')}
            className="mb-4 hover:bg-purple-50"
          >
            ← Back to Home
          </Button>
          <h2 className="text-4xl font-bold text-purple-900 mb-2">Create Your AI Clone</h2>
          <p className="text-gray-600">Tell us about yourself so we can create your perfect digital twin</p>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Basic Info */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-purple-900 mb-4">Basic Information</h3>
                
                <div>
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    value={personalityForm.name}
                    onChange={(e) => setPersonalityForm(prev => ({...prev, name: e.target.value}))}
                    placeholder="What should your clone be called?"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={personalityForm.username}
                    onChange={(e) => setPersonalityForm(prev => ({...prev, username: e.target.value}))}
                    placeholder="Choose a unique username"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="communication_style">Communication Style</Label>
                  <Select
                    value={personalityForm.communication_style}
                    onValueChange={(value) => setPersonalityForm(prev => ({...prev, communication_style: value}))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="How do you usually communicate?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casual and friendly">Casual & Friendly</SelectItem>
                      <SelectItem value="professional and formal">Professional & Formal</SelectItem>
                      <SelectItem value="witty and sarcastic">Witty & Sarcastic</SelectItem>
                      <SelectItem value="enthusiastic and energetic">Enthusiastic & Energetic</SelectItem>
                      <SelectItem value="thoughtful and analytical">Thoughtful & Analytical</SelectItem>
                      <SelectItem value="warm and empathetic">Warm & Empathetic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="speaking_quirks">Speaking Quirks</Label>
                  <Textarea
                    id="speaking_quirks"
                    value={personalityForm.speaking_quirks}
                    onChange={(e) => setPersonalityForm(prev => ({...prev, speaking_quirks: e.target.value}))}
                    placeholder="Do you use specific phrases, slang, or have unique ways of expressing yourself?"
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="background">Background</Label>
                  <Textarea
                    id="background"
                    value={personalityForm.background}
                    onChange={(e) => setPersonalityForm(prev => ({...prev, background: e.target.value}))}
                    placeholder="Tell us about your background, profession, or life experiences"
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </div>

              {/* Personality Details */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-purple-900 mb-4">Personality Details</h3>

                {/* Interests */}
                <div>
                  <Label>Interests & Hobbies</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={interestInput}
                      onChange={(e) => setInterestInput(e.target.value)}
                      placeholder="Add an interest"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddItem(interestInput, 'interests')}
                    />
                    <Button 
                      type="button" 
                      onClick={() => handleAddItem(interestInput, 'interests')}
                      size="sm"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {personalityForm.interests.map((interest, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="cursor-pointer hover:bg-red-100"
                        onClick={() => handleRemoveItem(index, 'interests')}
                      >
                        {interest} ×
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Personality Traits */}
                <div>
                  <Label>Personality Traits</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={traitInput}
                      onChange={(e) => setTraitInput(e.target.value)}
                      placeholder="Add a personality trait"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddItem(traitInput, 'personality_traits')}
                    />
                    <Button 
                      type="button" 
                      onClick={() => handleAddItem(traitInput, 'personality_traits')}
                      size="sm"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {personalityForm.personality_traits.map((trait, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="cursor-pointer hover:bg-red-100"
                        onClick={() => handleRemoveItem(index, 'personality_traits')}
                      >
                        {trait} ×
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Favorite Topics */}
                <div>
                  <Label>Favorite Topics to Discuss</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={topicInput}
                      onChange={(e) => setTopicInput(e.target.value)}
                      placeholder="Add a favorite topic"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddItem(topicInput, 'favorite_topics')}
                    />
                    <Button 
                      type="button" 
                      onClick={() => handleAddItem(topicInput, 'favorite_topics')}
                      size="sm"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {personalityForm.favorite_topics.map((topic, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="cursor-pointer hover:bg-red-100"
                        onClick={() => handleRemoveItem(index, 'favorite_topics')}
                      >
                        {topic} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-8" />

            <div className="text-center">
              <Button 
                onClick={handleCreatePersonality}
                disabled={loading}
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 px-8 py-6 text-lg"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating Your Clone...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Create My AI Clone
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderExploreClones = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => setCurrentView('home')}
            className="mb-4 hover:bg-purple-50"
          >
            ← Back to Home
          </Button>
          <h2 className="text-4xl font-bold text-purple-900 mb-2">Explore AI Clones</h2>
          <p className="text-gray-600">Meet other AI clones and start conversations</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-sm border-purple-100 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-purple-900">{user.personality.name}</CardTitle>
                    <p className="text-sm text-gray-500">@{user.username}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    <strong>Style:</strong> {user.personality.communication_style}
                  </p>
                  
                  {user.personality.interests.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Interests:</p>
                      <div className="flex flex-wrap gap-1">
                        {user.personality.interests.slice(0, 3).map((interest, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {interest}
                          </Badge>
                        ))}
                        {user.personality.interests.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{user.personality.interests.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {currentUser && currentUser.user_id !== user.user_id && (
                    <Button 
                      onClick={() => handleGenerateConversation(currentUser.user_id, user.user_id)}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                      size="sm"
                    >
                      {loading ? (
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      ) : (
                        <MessageCircle className="w-4 h-4 mr-2" />
                      )}
                      Start Conversation
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <div className="p-6 bg-white/50 rounded-2xl border border-purple-100 max-w-md mx-auto">
              <Users className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-purple-900 mb-2">No Clones Yet</h3>
              <p className="text-gray-600 mb-4">Be the first to create an AI clone!</p>
              <Button 
                onClick={() => setCurrentView('create')}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                Create Your Clone
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderConversations = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => setCurrentView('home')}
            className="mb-4 hover:bg-purple-50"
          >
            ← Back to Home
          </Button>
          <h2 className="text-4xl font-bold text-purple-900 mb-2">Clone Conversations</h2>
          <p className="text-gray-600">Discover fascinating conversations between AI clones</p>
        </div>

        <div className="space-y-6">
          {conversations.map((conv, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-sm border-purple-100">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                        {conv.participants?.user1}
                      </Badge>
                      <MessageCircle className="w-4 h-4 text-gray-400" />
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        {conv.participants?.user2}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{conv.topic}</Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(conv.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {conv.messages?.map((message, msgIndex) => (
                    <div key={msgIndex} className="flex gap-3">
                      <div className="p-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full shrink-0">
                        <Brain className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-purple-900">{message.speaker}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-gray-700 bg-white/60 rounded-lg p-3 text-sm leading-relaxed">
                          {message.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-purple-100">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-purple-200 hover:bg-purple-50"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Conversation
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {conversations.length === 0 && (
          <div className="text-center py-12">
            <div className="p-6 bg-white/50 rounded-2xl border border-purple-100 max-w-md mx-auto">
              <MessageCircle className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-purple-900 mb-2">No Conversations Yet</h3>
              <p className="text-gray-600 mb-4">Create some AI clones and start conversations!</p>
              <Button 
                onClick={() => setCurrentView('explore')}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                Explore Clones
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="App">
      {currentView === 'home' && renderHome()}
      {currentView === 'create' && renderCreatePersonality()}
      {currentView === 'explore' && renderExploreClones()}
      {currentView === 'conversations' && renderConversations()}
    </div>
  );
}

export default App;