import requests
import sys
import json
from datetime import datetime

class AICloneMeAPITester:
    def __init__(self, base_url="https://d34561ad-0799-4796-8616-cd4d4a59db07.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.created_users = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test health endpoint"""
        return self.run_test(
            "Health Check",
            "GET",
            "api/health",
            200
        )

    def test_create_user(self, name, username, communication_style="casual and friendly"):
        """Test creating a new user with AI personality"""
        user_data = {
            "user_id": f"user_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{len(self.created_users)}",
            "username": username,
            "personality": {
                "name": name,
                "communication_style": communication_style,
                "interests": ["technology", "music", "reading"],
                "personality_traits": ["friendly", "curious", "thoughtful"],
                "favorite_topics": ["AI", "science", "philosophy"],
                "speaking_quirks": "Uses lots of emojis and exclamation points!",
                "background": "Tech enthusiast who loves learning about AI and connecting with others"
            },
            "created_at": datetime.now().isoformat()
        }
        
        success, response = self.run_test(
            f"Create User - {name}",
            "POST",
            "api/users",
            200,
            data=user_data
        )
        
        if success:
            self.created_users.append(user_data)
            return user_data["user_id"]
        return None

    def test_get_all_users(self):
        """Test getting all users"""
        return self.run_test(
            "Get All Users",
            "GET",
            "api/users",
            200
        )

    def test_get_user_by_id(self, user_id):
        """Test getting a specific user by ID"""
        return self.run_test(
            f"Get User by ID - {user_id}",
            "GET",
            f"api/users/{user_id}",
            200
        )

    def test_create_conversation(self, user1_id, user2_id, topic="technology and AI"):
        """Test generating a conversation between two AI clones"""
        conversation_data = {
            "user1_id": user1_id,
            "user2_id": user2_id,
            "topic": topic
        }
        
        success, response = self.run_test(
            f"Generate Conversation - {topic}",
            "POST",
            "api/conversations",
            200,
            data=conversation_data
        )
        
        if success and 'conversation_id' in response:
            return response['conversation_id']
        return None

    def test_get_all_conversations(self):
        """Test getting all conversations"""
        return self.run_test(
            "Get All Conversations",
            "GET",
            "api/conversations",
            200
        )

    def test_get_user_conversations(self, user_id):
        """Test getting conversations for a specific user"""
        return self.run_test(
            f"Get User Conversations - {user_id}",
            "GET",
            f"api/conversations/{user_id}",
            200
        )

    def test_duplicate_username(self):
        """Test creating user with duplicate username"""
        if not self.created_users:
            print("⚠️  Skipping duplicate username test - no users created yet")
            return True
            
        duplicate_data = {
            "user_id": f"user_duplicate_{datetime.now().strftime('%H%M%S')}",
            "username": self.created_users[0]["username"],  # Use same username
            "personality": {
                "name": "Duplicate User",
                "communication_style": "formal",
                "interests": ["testing"],
                "personality_traits": ["persistent"],
                "favorite_topics": ["duplicates"],
                "speaking_quirks": "Always repeats things",
                "background": "Testing duplicate usernames"
            },
            "created_at": datetime.now().isoformat()
        }
        
        success, _ = self.run_test(
            "Duplicate Username (Should Fail)",
            "POST",
            "api/users",
            400,  # Should return 400 for duplicate username
            data=duplicate_data
        )
        return success

def main():
    print("🚀 Starting AI Clone Me API Tests")
    print("=" * 50)
    
    # Setup
    tester = AICloneMeAPITester()
    
    # Test 1: Health Check
    health_success, _ = tester.test_health_check()
    if not health_success:
        print("❌ Health check failed, stopping tests")
        return 1

    # Test 2: Create multiple users
    print("\n📝 Creating AI Clone Users...")
    user1_id = tester.test_create_user("Alice", f"alice_{datetime.now().strftime('%H%M%S')}", "enthusiastic and energetic")
    user2_id = tester.test_create_user("Bob", f"bob_{datetime.now().strftime('%H%M%S')}", "thoughtful and analytical")
    user3_id = tester.test_create_user("Charlie", f"charlie_{datetime.now().strftime('%H%M%S')}", "witty and sarcastic")
    
    if not user1_id or not user2_id:
        print("❌ User creation failed, stopping conversation tests")
        return 1

    # Test 3: Get all users
    users_success, users_data = tester.test_get_all_users()
    if users_success and 'users' in users_data:
        print(f"   Found {len(users_data['users'])} users in database")

    # Test 4: Get specific users
    if user1_id:
        tester.test_get_user_by_id(user1_id)
    if user2_id:
        tester.test_get_user_by_id(user2_id)

    # Test 5: Test duplicate username
    tester.test_duplicate_username()

    # Test 6: Generate conversations
    print("\n💬 Testing AI Conversation Generation...")
    conv1_id = tester.test_create_conversation(user1_id, user2_id, "artificial intelligence and the future")
    if user3_id:
        conv2_id = tester.test_create_conversation(user1_id, user3_id, "favorite books and movies")
        conv3_id = tester.test_create_conversation(user2_id, user3_id, "travel experiences")

    # Test 7: Get all conversations
    conversations_success, conv_data = tester.test_get_all_conversations()
    if conversations_success and 'conversations' in conv_data:
        print(f"   Found {len(conv_data['conversations'])} conversations in database")

    # Test 8: Get user-specific conversations
    if user1_id:
        tester.test_get_user_conversations(user1_id)

    # Test 9: Test invalid endpoints
    print("\n🔍 Testing Error Handling...")
    tester.run_test("Invalid User ID", "GET", "api/users/invalid_user_id", 404)
    tester.run_test("Invalid Conversation Request", "POST", "api/conversations", 404, 
                   data={"user1_id": "invalid1", "user2_id": "invalid2"})

    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 FINAL RESULTS")
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed! Backend API is working correctly.")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed.")
        return 1

if __name__ == "__main__":
    sys.exit(main())