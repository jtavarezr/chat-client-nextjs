# Chat Application Documentation

This document provides a comprehensive overview of the chat application's architecture, focusing on its main components and their interactions. It includes class diagrams and sequence diagrams to illustrate the structure and behavior of the application.

## Class Diagram

The class diagram illustrates the main components of the chat application and their relationships.
```
plantuml
@startuml
class Sidebar {
  - chats: List<Chat>
  - searchQuery: String
  - userStatus: Status
  + createGroup(name: String)
  + joinGroup(groupId: String)
  + searchChats(query: String)
  + displayUserStatus()
  + displaySettings()
  + logout()
}

class ChatArea {
  - messages: List<ChatMessage>
  - activeTab: Tab
  - threadView: String
  + sendMessage(content: String)
  + uploadFile(file: File)
  + manageThread(threadId: String)
  + setActiveTab(tab: Tab)
}

class ChatMessage {
  - content: String
  - author: User
  - timestamp: Date
  - threadId: String
}

class ChatInput {
  - inputContent: String
  + sendMessage(content: String)
  + attachFile(file: File)
  + startAudioCall()
}

class CodeEditor {
  + editCode(code: String)
}

class GitIntegration {
  + commitChanges(message: String)
  + pushChanges()
  + pullChanges()
}

class AudioCall {
  - participants: List<User>
  - inCall: Boolean
  + startCall()
  + endCall()
  + muteParticipant(user: User)
}

enum Tab {
  CHAT
  CODE
  GIT
  CALL
}

class User{
    - id: String
    - name: String
}

enum Status{
  ONLINE
  OFFLINE
  AWAY
}

class Chat {
    - id: String
    - name: String
    - type: String
}

Sidebar --|> Chat
Sidebar "1" -- "many" User : members
ChatArea "1" -- "many" ChatMessage
ChatInput -- ChatArea
ChatArea -- CodeEditor
ChatArea -- GitIntegration
ChatArea -- AudioCall
ChatArea -- Sidebar
ChatMessage -- User
Sidebar -- User

@enduml
```
## Sequence Diagrams

### 1. Send Message

This diagram illustrates the sequence of actions when a user sends a message.
```
plantuml
@startuml
participant User
participant ChatInput
participant ChatArea
participant ChatMessage
participant Server

User -> ChatInput: Compose message
activate ChatInput
ChatInput -> ChatArea: sendMessage(content)
activate ChatArea
ChatArea -> ChatMessage: Create new message
activate ChatMessage
ChatMessage --> ChatArea: Message created
deactivate ChatMessage
ChatArea -> Server: Send message
activate Server
Server --> ChatArea: Message sent
deactivate Server
ChatArea --> ChatInput: Confirmation
deactivate ChatArea
ChatInput --> User: Message sent
deactivate ChatInput
@enduml
```
### 2. Create Group

This diagram shows the interactions when a user creates a new group.
```
plantuml
@startuml
participant User
participant Sidebar
participant Server
participant Chat

User -> Sidebar: Initiate create group
activate Sidebar
Sidebar -> Sidebar: Get group name
Sidebar -> Server: createGroup(groupName)
activate Server
Server --> Server: Create a new group in DataBase
Server --> Sidebar: Confirmation
deactivate Server
Sidebar -> Chat : Create New Group
activate Chat
Chat --> Sidebar: Group Created
deactivate Chat
Sidebar --> User: Group created
deactivate Sidebar
@enduml
```
### 3. Join Group

This diagram shows the interactions when a user joins an existing group.
```
plantuml
@startuml
participant User
participant Sidebar
participant Server
participant Chat

User -> Sidebar: Initiate join group
activate Sidebar
Sidebar -> Sidebar: Get group Id
Sidebar -> Server: joinGroup(groupId)
activate Server
Server --> Server: Check if the group exist
Server --> Sidebar: Confirmation
deactivate Server
opt group exists
    Sidebar -> Chat : Add User to Group
    activate Chat
    Chat --> Sidebar: User added
    deactivate Chat
end
Sidebar --> User: Group joined
deactivate Sidebar
@enduml
```
### 4. Start Audio Call

This diagram illustrates the sequence of actions when a user starts an audio call.
```
plantuml
@startuml
participant User
participant ChatArea
participant AudioCall

User -> ChatArea: Start audio call
activate ChatArea
ChatArea -> AudioCall: startCall()
activate AudioCall
AudioCall --> ChatArea: Call started
deactivate AudioCall
ChatArea --> User: Call started
deactivate ChatArea
@enduml
```
### 5. View Old Messages

This diagram illustrates how a user can view old messages in the chat area.