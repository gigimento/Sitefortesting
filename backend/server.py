from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
import os
import uuid
from typing import List, Optional
from pydantic import BaseModel
import asyncio
from datetime import datetime
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage

# Load environment variables
load_dotenv()

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
client = MongoClient(os.getenv("MONGO_URL"))
db = client[os.getenv("DB_NAME", "aicloneme")]
users_collection = db.users
personalities_collection = db.personalities
conversations_collection = db.conversations

# Pydantic models
class PersonalityData(BaseModel):
    name: str
    communication_style: str
    interests: List[str]
    personality_traits: List[str]
    favorite_topics: List[str]
    speaking_quirks: str
    background: str

class User(BaseModel):
    user_id: str
    username: str
    personality: PersonalityData
    created_at: str

class ConversationRequest(BaseModel):
    user1_id: str
    user2_id: str
    topic: Optional[str] = "general chat"

class AICloneConversation:
    def __init__(self):
        self.api_key = os.getenv("EMERGENT_LLM_KEY")
        
    async def generate_personality_prompt(self, personality: PersonalityData) -> str:
        """Generate a personality prompt for the AI clone"""
        return f"""You are {personality.name}, an AI clone with these characteristics:

Communication Style: {personality.communication_style}
Personality Traits: {', '.join(personality.personality_traits)}
Interests: {', '.join(personality.interests)}
Favorite Topics: {', '.join(personality.favorite_topics)}
Speaking Quirks: {personality.speaking_quirks}
Background: {personality.background}

You should respond naturally as this person would, incorporating their unique communication style, interests, and personality traits. Keep responses conversational and authentic to their character. Don't mention that you're an AI clone - just be this person."""

    async def generate_conversation(self, user1: dict, user2: dict, topic: str) -> List[dict]:
        """Generate a conversation between two AI clones"""
        personality1 = PersonalityData(**user1["personality"])
        personality2 = PersonalityData(**user2["personality"])
        
        # Create LLM chat instances for both personalities
        chat1 = LlmChat(
            api_key=self.api_key,
            session_id=f"clone_{user1['user_id']}",
            system_message=await self.generate_personality_prompt(personality1)
        ).with_model("openai", "gpt-4o-mini")
        
        chat2 = LlmChat(
            api_key=self.api_key,
            session_id=f"clone_{user2['user_id']}",
            system_message=await self.generate_personality_prompt(personality2)
        ).with_model("openai", "gpt-4o-mini")
        
        conversation = []
        
        # Start the conversation
        starter_prompt = f"Start a casual conversation with someone about {topic}. Make it natural and true to your personality. Just say something to begin the conversation - don't introduce yourself formally."
        
        # First message from user1's clone
        user1_message = UserMessage(text=starter_prompt)
        response1 = await chat1.send_message(user1_message)
        
        conversation.append({
            "speaker": personality1.name,
            "message": response1,
            "timestamp": datetime.now().isoformat()
        })
        
        # Generate 6-8 messages alternating between the two clones
        last_message = response1
        current_speaker = chat2
        current_name = personality2.name
        
        for i in range(7):
            # Create a response to the last message
            response_message = UserMessage(text=f"Respond naturally to this message: '{last_message}' - keep the conversation flowing and stay in character.")
            response = await current_speaker.send_message(response_message)
            
            conversation.append({
                "speaker": current_name,
                "message": response,
                "timestamp": datetime.now().isoformat()
            })
            
            last_message = response
            
            # Switch speakers
            if current_speaker == chat2:
                current_speaker = chat1
                current_name = personality1.name
            else:
                current_speaker = chat2
                current_name = personality2.name
        
        return conversation

# Initialize AI conversation generator
ai_conversation = AICloneConversation()

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "AI Clone Me API is running"}

@app.post("/api/users")
async def create_user(user_data: User):
    """Create a new user with their AI personality"""
    try:
        # Check if username already exists
        existing_user = users_collection.find_one({"username": user_data.username})
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already exists")
        
        # Create user document
        user_doc = {
            "user_id": user_data.user_id,
            "username": user_data.username,
            "personality": user_data.personality.dict(),
            "created_at": user_data.created_at
        }
        
        users_collection.insert_one(user_doc)
        return {"message": "User created successfully", "user_id": user_data.user_id}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating user: {str(e)}")

@app.get("/api/users")
async def get_all_users():
    """Get all users for clone discovery"""
    try:
        users = list(users_collection.find({}, {"_id": 0}))
        return {"users": users}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching users: {str(e)}")

@app.get("/api/users/{user_id}")
async def get_user(user_id: str):
    """Get a specific user by ID"""
    try:
        user = users_collection.find_one({"user_id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user: {str(e)}")

@app.post("/api/conversations")
async def create_conversation(request: ConversationRequest):
    """Generate a conversation between two AI clones"""
    try:
        # Get both users
        user1 = users_collection.find_one({"user_id": request.user1_id}, {"_id": 0})
        user2 = users_collection.find_one({"user_id": request.user2_id}, {"_id": 0})
        
        if not user1 or not user2:
            raise HTTPException(status_code=404, detail="One or both users not found")
        
        # Generate conversation
        conversation_messages = await ai_conversation.generate_conversation(
            user1, user2, request.topic
        )
        
        # Save conversation to database
        conversation_doc = {
            "conversation_id": str(uuid.uuid4()),
            "user1_id": request.user1_id,
            "user2_id": request.user2_id,
            "topic": request.topic,
            "messages": conversation_messages,
            "created_at": datetime.now().isoformat()
        }
        
        conversations_collection.insert_one(conversation_doc)
        
        return {
            "conversation_id": conversation_doc["conversation_id"],
            "messages": conversation_messages,
            "participants": {
                "user1": user1["username"],
                "user2": user2["username"]
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating conversation: {str(e)}")

@app.get("/api/conversations")
async def get_all_conversations():
    """Get all conversations for discovery"""
    try:
        conversations = list(conversations_collection.find({}, {"_id": 0}))
        
        # Add participant usernames to each conversation
        for conv in conversations:
            user1 = users_collection.find_one({"user_id": conv["user1_id"]}, {"username": 1, "_id": 0})
            user2 = users_collection.find_one({"user_id": conv["user2_id"]}, {"username": 1, "_id": 0})
            
            conv["participants"] = {
                "user1": user1["username"] if user1 else "Unknown",
                "user2": user2["username"] if user2 else "Unknown"
            }
        
        return {"conversations": conversations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching conversations: {str(e)}")

@app.get("/api/conversations/{user_id}")
async def get_user_conversations(user_id: str):
    """Get all conversations involving a specific user"""
    try:
        conversations = list(conversations_collection.find({
            "$or": [
                {"user1_id": user_id},
                {"user2_id": user_id}
            ]
        }, {"_id": 0}))
        
        # Add participant usernames
        for conv in conversations:
            user1 = users_collection.find_one({"user_id": conv["user1_id"]}, {"username": 1, "_id": 0})
            user2 = users_collection.find_one({"user_id": conv["user2_id"]}, {"username": 1, "_id": 0})
            
            conv["participants"] = {
                "user1": user1["username"] if user1 else "Unknown",
                "user2": user2["username"] if user2 else "Unknown"
            }
            
        return {"conversations": conversations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user conversations: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)