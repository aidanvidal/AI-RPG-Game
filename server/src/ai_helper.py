from openai import OpenAI
import os

def create_vector_store(api_key: str) -> None:
    # Upload the story file first to get its id
    file_id = upload_story_file(api_key)
    # Create vector store for the new user
    client = OpenAI(api_key=api_key)
    vector_store = client.beta.vector_stores.create(
        name="AI Game RPG",
        file_ids=[file_id]
    )
    return vector_store.id
    
def create_ai_assistant(api_key: str, vector_store_id: str) -> None:
    # Creates an AI assistant for the user
    client = OpenAI(api_key=api_key)
    assistant = client.beta.assistants.create(
        name="AI Game RPG",
        tool_resources={"file_search": {"vector_store_ids": [vector_store_id]}},
        tools=[{"type": "file_search"}],
        model="gpt-4o",
        instructions="""You are the dungeon master to a game of Dungeons & Dragons which is played by the user. 
                        Use the context given to you to construct a faithful and accurate story. DO NOT RETCON PREVIOUS THINGS IN THE GAME.
                        Make sure that the player is not all powerful and that they are not allowed to do things that will break the game.
                        The player's information will be provided to you.
                    """
    )
    return assistant.id

def upload_story_file(api_key: str) -> str:
    # Uploads the story file to OpenAI
    client = OpenAI(api_key=api_key)
    file = client.files.create(
        file=open("Test-Game-Prompt.txt", "rb"),
        purpose="assistants"
    )
    return file.id

def format_for_embedding(messages: list) -> list:
    # Returns a list of strings for each message
    # The string is formatted as "user" or "assistant" and the content of the message
    return [
        f"{"user" if message['is_ai_response'] == False else "assistant"}: {message['content']}" for message in messages
    ]
    
def upload_vector_store(api_key: str, vector_store_id: str, messages: list) -> None:
    # Writes the messages to a file
    messages_formatted = format_for_embedding(messages)
    file_paths = []
    with open('messages.txt', 'w') as file:
        for message in messages_formatted:
            file.write(message + '\n')
    file_paths.append('messages.txt')
    # Uploads the messages to the vector store
    client = OpenAI(api_key=api_key)
    client.beta.vector_stores.file_batches.upload_and_poll(
        vector_store_id=vector_store_id,
        files=[open(path, "rb") for path in file_paths]
    )
    # Deletes the file after uploading
    os.remove('messages.txt')
    
def create_player_ai(api_key: str, name: str, race: str, clss: str, desc: str) -> str:
    client = OpenAI(api_key=api_key)
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {'role': 'system', 'content': f"""Create a description for a player in Dungeons & Dragons game based off the provided descriptions.
                                            Make sure to include skills the player has, any starting items, and flesh out their background some more.
                                            Provided Description:
                                                Name: {name}
                                                Race: {race}
                                                Class: {clss}
                                                Description: {desc}"""}
        ]
    )
    cleaned_message = response.choices[0].message.content
    return cleaned_message
